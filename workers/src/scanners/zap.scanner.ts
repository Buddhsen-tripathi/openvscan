import { execa } from 'execa';
import { Scanner, ScanResult } from './base.scanner';
import { Finding, Severity, ScanConfig } from '@openvscan/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export class ZapScanner implements Scanner {
  name = 'OWASP ZAP';

  async isAvailable(): Promise<boolean> {
    try {
      // Check for zap-cli or zap.sh
      await execa('zap-cli', ['--version']);
      return true;
    } catch {
      try {
        await execa('zap.sh', ['-version']);
        return true;
      } catch {
        return false;
      }
    }
  }

  async scan(target: string, config?: ScanConfig): Promise<ScanResult> {
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      throw new Error('OWASP ZAP is not installed or available in PATH');
    }

    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `zap-result-${Date.now()}.json`);

    try {
      // Run ZAP baseline scan (quick passive scan)
      const args = [
        '-t', target,
        '-J', outputPath,
        '-I', // Don't fail on warnings
      ];

      console.log(`[ZAP] Running baseline scan on: ${target}`);

      try {
        await execa('zap-baseline.py', args);
      } catch (error: any) {
        // ZAP baseline returns exit codes for different warning levels
        if (error.exitCode > 2) {
          throw error;
        }
      }

      let rawOutput = '';
      try {
        rawOutput = await fs.readFile(outputPath, 'utf-8');
      } catch {
        return { findings: [], rawOutput: 'ZAP scan completed but no output was generated.' };
      }

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

      // ZAP JSON report has a "site" array with "alerts"
      const sites = data.site || [];

      for (const site of sites) {
        const alerts = site.alerts || [];

        for (const alert of alerts) {
          const severity = this.mapRiskCode(alert.riskcode);

          findings.push({
            id: `zap-${alert.pluginid || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            scanId: '',
            title: alert.alert || alert.name || 'ZAP Finding',
            description: (alert.desc || 'No description available').replace(/<[^>]*>/g, ''),
            severity,
            location: alert.url || alert.uri || 'N/A',
            remediation: (alert.solution || 'Review and remediate this finding.').replace(/<[^>]*>/g, ''),
            tool: 'owasp-zap',
            createdAt: new Date(),
          });
        }
      }

      return findings;
    } catch (error) {
      console.error('Failed to parse ZAP output', error);
      return [];
    }
  }

  private mapRiskCode(riskCode: string | number): Severity {
    switch (Number(riskCode)) {
      case 3: return Severity.HIGH;
      case 2: return Severity.MEDIUM;
      case 1: return Severity.LOW;
      case 0: return Severity.INFO;
      default: return Severity.INFO;
    }
  }
}
