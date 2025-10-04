import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ScanRequestDto, ScanType } from './dto/scan-request.dto';

export interface Vulnerability {
  package: string;
  version: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve: string;
  description: string;
  fix: string;
}

export interface ScanResult {
  scanId: string;
  timestamp: string;
  target: string;
  vulnerabilities: Vulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

@Injectable()
export class ScanService {
  async scan(scanRequest: ScanRequestDto): Promise<ScanResult> {
    const scanId = this.generateScanId();
    const timestamp = new Date().toISOString();

    try {
      let vulnerabilities: Vulnerability[] = [];

      if (scanRequest.type === ScanType.NPM) {
        vulnerabilities = await this.scanNpmPackage(
          scanRequest.target,
          scanRequest.version,
        );
      } else if (scanRequest.type === ScanType.PACKAGE_JSON) {
        vulnerabilities = await this.scanPackageJson(scanRequest.target);
      }

      const summary = this.calculateSummary(vulnerabilities);

      return {
        scanId,
        timestamp,
        target: scanRequest.target,
        vulnerabilities,
        summary,
      };
    } catch (error) {
      throw new HttpException(
        `Scan failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async scanNpmPackage(
    packageName: string,
    version?: string,
  ): Promise<Vulnerability[]> {
    // Mock implementation - in production, this would call npm audit API or vulnerability database
    const mockVulnerabilities: Vulnerability[] = [
      {
        package: packageName,
        version: version || 'unknown',
        severity: 'high',
        cve: 'CVE-2024-XXXXX',
        description: `Security vulnerability found in ${packageName}`,
        fix: 'Upgrade to latest version',
      },
    ];

    // Simulate some packages having no vulnerabilities
    if (packageName.includes('safe') || packageName.includes('secure')) {
      return [];
    }

    return mockVulnerabilities;
  }

  private async scanPackageJson(content: string): Promise<Vulnerability[]> {
    try {
      const packageJson = JSON.parse(content);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const vulnerabilities: Vulnerability[] = [];

      for (const [pkg, version] of Object.entries(dependencies)) {
        const pkgVulns = await this.scanNpmPackage(pkg, version as string);
        vulnerabilities.push(...pkgVulns);
      }

      return vulnerabilities;
    } catch (error) {
      throw new Error('Invalid package.json format');
    }
  }

  private calculateSummary(vulnerabilities: Vulnerability[]) {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: vulnerabilities.length,
    };

    vulnerabilities.forEach((vuln) => {
      summary[vuln.severity]++;
    });

    return summary;
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
