import { execa } from 'execa';
import { Scanner, ScanResult } from './base.scanner';
import { Finding, Severity, ScanConfig } from '@openvscan/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export class SemgrepScanner implements Scanner {
  name = 'Semgrep';

  async isAvailable(): Promise<boolean> {
    try {
      await execa('semgrep', ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  async scan(target: string, config?: ScanConfig): Promise<ScanResult> {
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      throw new Error('Semgrep is not installed or available in PATH');
    }

    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `semgrep-result-${Date.now()}.json`);

    try {
      // Run semgrep with auto config (uses recommended rules)
      const args = [
        'scan',
        '--config', 'auto',
        '--json',
        '--output', outputPath,
        '--no-git-ignore',
        '--timeout', '300',
        target,
      ];

      console.log(`[Semgrep] Running command: semgrep ${args.join(' ')}`);

      try {
        await execa('semgrep', args);
      } catch (error: any) {
        // Semgrep exits with code 1 when it finds issues - that's expected
        if (error.exitCode !== 1) {
          throw error;
        }
      }

      const rawOutput = await fs.readFile(outputPath, 'utf-8');
      const findings = this.parseFindings(rawOutput);

      return {
        findings,
        rawOutput,
      };
    } finally {
      try {
        await fs.unlink(outputPath);
      } catch {}
    }
  }

  private parseFindings(jsonOutput: string): Finding[] {
    try {
      const data = JSON.parse(jsonOutput);
      const findings: Finding[] = [];

      if (!data.results || !Array.isArray(data.results)) return [];

      for (const result of data.results) {
        const severity = this.mapSeverity(result.extra?.severity || 'WARNING');
        const filePath = result.path || 'unknown';
        const startLine = result.start?.line || 0;
        const endLine = result.end?.line || startLine;

        findings.push({
          id: result.extra?.fingerprint || `semgrep-${Date.now()}-${Math.random()}`,
          scanId: '',
          title: result.check_id || 'Semgrep finding',
          description: result.extra?.message || result.extra?.metadata?.description || 'No description available',
          severity,
          location: `${filePath}:${startLine}-${endLine}`,
          remediation: this.buildRemediation(result),
          tool: 'semgrep',
          createdAt: new Date(),
        });
      }

      return findings;
    } catch (error) {
      console.error('Failed to parse Semgrep output', error);
      return [];
    }
  }

  private mapSeverity(severity: string): Severity {
    switch (severity.toUpperCase()) {
      case 'ERROR':
        return Severity.HIGH;
      case 'WARNING':
        return Severity.MEDIUM;
      case 'INFO':
        return Severity.LOW;
      default:
        return Severity.INFO;
    }
  }

  private buildRemediation(result: any): string {
    const parts: string[] = [];

    if (result.extra?.fix) {
      parts.push(`Suggested fix: ${result.extra.fix}`);
    }

    if (result.extra?.metadata?.references) {
      const refs = result.extra.metadata.references;
      if (Array.isArray(refs) && refs.length > 0) {
        parts.push(`References: ${refs.slice(0, 3).join(', ')}`);
      }
    }

    if (result.extra?.metadata?.cwe) {
      const cwes = Array.isArray(result.extra.metadata.cwe)
        ? result.extra.metadata.cwe
        : [result.extra.metadata.cwe];
      parts.push(`CWE: ${cwes.join(', ')}`);
    }

    return parts.length > 0
      ? parts.join('\n')
      : 'Review the code pattern flagged by Semgrep and apply secure coding practices.';
  }
}
