import { Finding, ScanConfig } from '@openvscan/types';

export interface ScanResult {
  findings: Finding[];
  rawOutput: string;
}

export interface Scanner {
  name: string;
  isAvailable(): Promise<boolean>;
  scan(target: string, config?: ScanConfig): Promise<ScanResult>;
}
