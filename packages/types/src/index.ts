export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ScanType {
  STATIC_ANALYSIS = 'static_analysis',
  DEPENDENCY_AUDIT = 'dependency_audit',
  DAST = 'dast',
  CONTAINER = 'container',
}

export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScanConfig {
  target: string;
  scanners: ScanType[];
  maxDuration?: number;
}

export interface Scan {
  id: string;
  projectId: string;
  status: ScanStatus;
  config: ScanConfig;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Finding {
  id: string;
  scanId: string;
  title: string;
  description: string;
  severity: Severity;
  location?: string;
  remediation?: string;
  tool: string;
  createdAt: Date;
}
