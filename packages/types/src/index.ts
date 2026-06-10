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

/** How scans are triggered for a connected repository. */
export enum ScanMode {
  /** Scan automatically on every push to a matching branch. */
  AUTOMATIC = 'automatic',
  /** Only scan when started manually from the dashboard. */
  MANUAL = 'manual',
}

/** What initiated a given scan. */
export enum ScanTrigger {
  MANUAL = 'manual',
  PUSH = 'push',
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** GitHub context attached to a push-triggered (or repo-linked) scan. */
export interface GithubScanContext {
  installationId: string;
  owner: string;
  repo: string;
  branch: string;
  commitSha: string;
  /** Open PR number whose head is `branch`, if any. */
  prNumber?: number;
}

export interface ScanConfig {
  target: string;
  scanners: ScanType[];
  maxDuration?: number;
  enableAi?: boolean;
  /** Present when the scan targets a connected GitHub repository. */
  github?: GithubScanContext;
}

export interface GithubInstallation {
  id: string;
  userId: string;
  installationId: string;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  id: string;
  userId: string;
  installationId: string;
  githubRepoId: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  scanMode: ScanMode;
  /** Comma-separated branch allowlist; null/empty = all branches. */
  branchFilter?: string | null;
  enabledScanners: ScanType[];
  createdAt: Date;
  updatedAt: Date;
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
