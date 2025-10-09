export enum ScanType {
  NPM = 'npm',
  PACKAGE_JSON = 'package-json',
}

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
