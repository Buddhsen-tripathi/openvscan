import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

/* ---- Domain badges: severity & scan status, driven by semantic tokens ---- */

type Severity = "critical" | "high" | "medium" | "low" | "info";

const severityStyles: Record<Severity, string> = {
  critical:
    "bg-severity-critical-muted text-severity-critical border-severity-critical/30",
  high: "bg-severity-high-muted text-severity-high border-severity-high/30",
  medium:
    "bg-severity-medium-muted text-severity-medium border-severity-medium/30",
  low: "bg-severity-low-muted text-severity-low border-severity-low/30",
  info: "bg-severity-info-muted text-severity-info border-severity-info/30",
};

function SeverityBadge({
  severity,
  className,
  ...props
}: { severity: string } & React.ComponentProps<"span">) {
  const key = (severity?.toLowerCase() as Severity) ?? "info";
  const style = severityStyles[key] ?? severityStyles.info;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        style,
        className,
      )}
      {...props}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

type ScanStatus =
  | "completed"
  | "running"
  | "pending"
  | "failed"
  | "cancelled";

const statusStyles: Record<ScanStatus, string> = {
  completed:
    "bg-status-completed-muted text-status-completed border-status-completed/30",
  running:
    "bg-status-running-muted text-status-running border-status-running/30",
  pending:
    "bg-status-pending-muted text-status-pending border-status-pending/30",
  failed: "bg-status-failed-muted text-status-failed border-status-failed/30",
  cancelled:
    "bg-status-cancelled-muted text-status-cancelled border-status-cancelled/30",
};

function StatusBadge({
  status,
  className,
  ...props
}: { status: string } & React.ComponentProps<"span">) {
  const key = (status?.toLowerCase() as ScanStatus) ?? "pending";
  const style = statusStyles[key] ?? statusStyles.pending;
  const pulse = key === "running" || key === "pending";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        style,
        className,
      )}
      {...props}
    >
      <span
        className={cn("size-1.5 rounded-full bg-current", pulse && "animate-pulse")}
      />
      {status}
    </span>
  );
}

export { Badge, badgeVariants, SeverityBadge, StatusBadge };
