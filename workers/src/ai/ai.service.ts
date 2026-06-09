import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Finding, Severity } from '@openvscan/types';

type AiProvider = 'openai' | 'anthropic' | 'google';

interface AiUsageStats {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export class AiService {
  private provider: AiProvider;
  private usage: AiUsageStats = { totalCalls: 0, totalInputTokens: 0, totalOutputTokens: 0 };

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AiProvider) || 'openai';
  }

  isEnabled(): boolean {
    switch (this.provider) {
      case 'openai': return !!process.env.OPENAI_API_KEY;
      case 'anthropic': return !!process.env.ANTHROPIC_API_KEY;
      case 'google': return !!process.env.GOOGLE_API_KEY;
      default: return false;
    }
  }

  shouldAnalyze(finding: Finding): boolean {
    // Only analyze critical and high severity findings to save tokens/cost
    return finding.severity === Severity.CRITICAL || finding.severity === Severity.HIGH;
  }

  private getModel() {
    switch (this.provider) {
      case 'openai': {
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        return openai(process.env.OPENAI_MODEL || 'gpt-4o-mini');
      }
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        return anthropic(process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514');
      }
      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
        return google(process.env.GOOGLE_MODEL || 'gemini-2.0-flash');
      }
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async analyzeFinding(finding: Finding): Promise<string> {
    if (!this.isEnabled()) {
      return finding.remediation || 'AI analysis unavailable: No API key configured';
    }

    if (!this.shouldAnalyze(finding)) {
      return finding.remediation || 'No AI analysis for this severity level';
    }

    try {
      const { text, usage } = await generateText({
        model: this.getModel(),
        system: `You are a cybersecurity expert specializing in vulnerability analysis.
Analyze the given vulnerability and provide:
1. A brief risk assessment (2-3 sentences)
2. Specific remediation steps
3. Any relevant CVE or CWE references if applicable

Be concise and actionable. Format your response in plain text, not markdown.`,
        prompt: `Vulnerability: ${finding.title}
Severity: ${finding.severity}
Tool: ${finding.tool}
Location: ${finding.location || 'N/A'}
Description: ${finding.description}

Provide a targeted remediation strategy.`,
        maxOutputTokens: 500,
      });

      // Track usage
      if (usage) {
        this.usage.totalCalls++;
        this.usage.totalInputTokens += usage.inputTokens || 0;
        this.usage.totalOutputTokens += usage.outputTokens || 0;
      }

      return text || 'No analysis generated';
    } catch (error) {
      console.error(`[AI] Analysis failed (${this.provider}):`, error instanceof Error ? error.message : error);
      return finding.remediation || 'AI analysis failed';
    }
  }

  async summarizeScan(findings: Finding[]): Promise<string> {
    if (!this.isEnabled() || findings.length === 0) {
      return '';
    }

    try {
      const summary = findings
        .slice(0, 20) // Limit to top 20 findings for context window
        .map(f => `- [${f.severity.toUpperCase()}] ${f.title} (${f.tool})`)
        .join('\n');

      const { text, usage } = await generateText({
        model: this.getModel(),
        system: 'You are a cybersecurity expert. Provide a concise executive summary of scan findings.',
        prompt: `Summarize these ${findings.length} vulnerability findings in 3-5 sentences. Focus on the most critical issues and overall security posture:\n\n${summary}`,
        maxOutputTokens: 300,
      });

      if (usage) {
        this.usage.totalCalls++;
        this.usage.totalInputTokens += usage.inputTokens || 0;
        this.usage.totalOutputTokens += usage.outputTokens || 0;
      }

      return text || '';
    } catch (error) {
      console.error('[AI] Scan summary failed:', error instanceof Error ? error.message : error);
      return '';
    }
  }

  getUsageStats(): AiUsageStats {
    return { ...this.usage };
  }
}
