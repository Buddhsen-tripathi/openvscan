import { ScanStatus } from "@openvscan/types";
import {
  Activity,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  ScanSearch,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useProjectsQuery,
  useRepositoriesQuery,
  useScansQuery,
} from "@/lib/api";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind text color token for the icon. */
  tone?: string;
}

/**
 * Compact summary of the user's workspace — project/repo/scan counts plus a
 * live scan-status breakdown — rendered above the project list on the overview.
 */
export function OverviewStats() {
  const { data: projects } = useProjectsQuery();
  const { data: repositories } = useRepositoriesQuery();
  const { data: scans } = useScansQuery();

  const scanList = scans ?? [];
  const active = scanList.filter(
    (s) => s.status === ScanStatus.RUNNING || s.status === ScanStatus.PENDING,
  ).length;
  const completed = scanList.filter(
    (s) => s.status === ScanStatus.COMPLETED,
  ).length;
  const failed = scanList.filter((s) => s.status === ScanStatus.FAILED).length;

  const stats: Stat[] = [
    { label: "Projects", value: projects?.length ?? 0, icon: FolderGit2 },
    {
      label: "Repositories",
      value: repositories?.length ?? 0,
      icon: GitBranch,
    },
    { label: "Total scans", value: scanList.length, icon: ScanSearch },
    {
      label: "Active",
      value: active,
      icon: Activity,
      tone: "text-status-running",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      tone: "text-status-completed",
    },
    { label: "Failed", value: failed, icon: XCircle, tone: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Icon size={14} className={tone ?? "text-muted-foreground"} />
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
