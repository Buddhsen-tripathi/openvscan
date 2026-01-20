import OpenAI from 'openai';
import { Finding } from '@openvscan/types';

export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    });
  }

  async analyzeFinding(finding: Finding): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return 'AI analysis unavailable: Missing API Key';
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert. Analyze the vulnerability and provide a remediation strategy.',
          },
          {
            role: 'user',
            content: `Analyze this finding: ${finding.title}. Description: ${finding.description}.`,
          },
        ],
        model: 'gpt-4o-mini',
      });

      return completion.choices[0].message.content || 'No analysis generated';
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return 'AI analysis failed';
    }
  }
}
