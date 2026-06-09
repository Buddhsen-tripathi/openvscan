import { ScanStatus, Severity } from "@openvscan/types";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Download, Loader2, XCircle } from "lucide-react";
import Link from "@/components/AppLink";
import { api, useCancelScanMutation, useScanQuery } from "@/lib/api";

const statusBadge: Record<string, string> = {
  [ScanStatus.COMPLETED]: "bg-status-completed-muted text-status-completed",
  [ScanStatus.FAILED]: "bg-status-failed-muted text-status-failed",
  [ScanStatus.RUNNING]: "bg-status-running-muted text-status-running",
  [ScanStatus.PENDING]: "bg-status-pending-muted text-status-pending",
  [ScanStatus.CANCELLED]: "bg-status-cancelled-muted text-status-cancelled",
};

const severityBadge: Record<string, string> = {
  [Severity.CRITICAL]: "bg-severity-critical text-severity-critical-foreground",
  [Severity.HIGH]: "bg-severity-high text-severity-high-foreground",
  [Severity.MEDIUM]: "bg-severity-medium text-severity-medium-foreground",
  [Severity.LOW]: "bg-severity-low text-severity-low-foreground",
};

const severityText: Record<string, string> = {
  CRITICAL: "text-severity-critical",
  HIGH: "text-severity-high",
  MEDIUM: "text-severity-medium",
  LOW: "text-severity-low",
};

export const Route = createFileRoute("/dashboard/scans/$id")({
  component: ScanResultsPage,
});

function ScanResultsPage() {
  const { id } = Route.useParams();
  const { data: scan, isLoading, error } = useScanQuery(id);
  const cancelScan = useCancelScanMutation(id);

  const handleCancel = async () => {
    try {
      await cancelScan.mutateAsync();
    } catch {
      alert("Failed to cancel scan");
    }
  };

  const handleExport = (format: "json" | "sarif") => {
    window.open(api.scans.exportUrl(id, format), "_blank");
  };

  if (isLoading && !scan) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            {error instanceof Error ? error.message : "Scan not found"}
          </p>
          <Link
            href="/dashboard/scans"
            className="text-primary hover:underline text-sm"
          >
            Back to Scans
          </Link>
        </div>
      </div>
    );
  }

  const isActive =
    scan.status === ScanStatus.RUNNING || scan.status === ScanStatus.PENDING;

  return (
    <>
      <header className="flex justify-between items-center bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/scans"
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Scan Results
            </h2>
            <p className="text-sm text-muted-foreground">
              {scan.config.target}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelScan.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 disabled:opacity-50 transition-colors"
            >
              <XCircle size={14} />
              {cancelScan.isPending ? "Cancelling..." : "Cancel"}
            </button>
          )}
          {scan.status === ScanStatus.COMPLETED && scan.findings.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExport("json")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Download size={14} />
                JSON
              </button>
              <button
                type="button"
                onClick={() => handleExport("sarif")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Download size={14} />
                SARIF
              </button>
            </div>
          )}
          <div
            className={`px-3 py-1 rounded-full text-sm font-bold ${statusBadge[scan.status] || "bg-muted text-muted-foreground"}`}
          >
            {isActive && (
              <Loader2 size={12} className="inline-block animate-spin mr-1" />
            )}
            {scan.status.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        {isActive && (
          <div className="mb-8 bg-status-running-muted border border-status-running/20 rounded-xl p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-status-running mx-auto mb-3" />
            <p className="text-foreground font-medium">
              Scan is {scan.status}...
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Results will appear automatically.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
            const count = scan.findings.filter(
              (f) => f.severity.toUpperCase() === sev,
            ).length;
            return (
              <div
                key={sev}
                className="bg-card p-4 rounded-xl border border-border/60"
              >
                <div className="text-muted-foreground text-xs font-bold mb-1">
                  {sev}
                </div>
                <div className={`text-2xl font-bold ${severityText[sev]}`}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border bg-muted/50 flex justify-between items-center">
            <h3 className="font-bold text-foreground">
              Findings ({scan.findings.length})
            </h3>
          </div>
          {scan.findings.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {isActive
                ? "Waiting for results..."
                : "No vulnerabilities found."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {scan.findings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-card-foreground">
                      {finding.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ml-3 ${severityBadge[finding.severity] || "bg-muted text-muted-foreground"}`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {finding.description}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground/70">
                    <span>Tool: {finding.tool}</span>
                    <span>Location: {finding.location || "N/A"}</span>
                  </div>
                  {finding.remediation && (
                    <div className="mt-3 bg-accent/50 p-3 rounded-lg border border-accent">
                      <span className="font-bold text-accent-foreground text-xs block mb-1">
                        Remediation:
                      </span>
                      <p className="text-foreground text-sm whitespace-pre-line">
                        {finding.remediation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {scan.logs && scan.logs.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-border/60 bg-secondary font-mono text-sm">
            <div className="px-6 py-3 border-b border-border bg-secondary text-muted-foreground font-bold text-xs uppercase tracking-wider">
              Scan Logs
            </div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-1">
              {scan.logs.map((log, i) => (
                <div key={`${log.timestamp}-${i}`} className="flex gap-2">
                  <span className="text-muted-foreground/50 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={
                      log.level === "error"
                        ? "text-destructive"
                        : log.level === "warn"
                          ? "text-status-pending"
                          : "text-secondary-foreground"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
