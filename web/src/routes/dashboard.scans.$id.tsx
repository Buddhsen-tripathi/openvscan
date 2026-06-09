import { ScanStatus } from "@openvscan/types";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, XCircle } from "lucide-react";
import Link from "@/components/AppLink";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api, useCancelScanMutation, useScanQuery } from "@/lib/api";

export const Route = createFileRoute("/dashboard/scans/$id")({
  component: ScanResultsPage,
});

const severityText: Record<string, string> = {
  CRITICAL: "text-severity-critical",
  HIGH: "text-severity-high",
  MEDIUM: "text-severity-medium",
  LOW: "text-severity-low",
};

function ScanResultsPage() {
  const { id } = Route.useParams();
  const { data: scan, isLoading, error } = useScanQuery(id);
  const cancelScan = useCancelScanMutation(id);

  const handleCancel = async () => {
    try {
      await cancelScan.mutateAsync();
    } catch {
      /* surfaced via mutation state */
    }
  };

  const handleExport = (format: "json" | "sarif") => {
    window.open(api.scans.exportUrl(id, format), "_blank");
  };

  if (isLoading && !scan) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 size-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading scan results…</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-2 font-medium text-destructive">
            {error instanceof Error ? error.message : "Scan not found"}
          </p>
          <Link
            href="/dashboard/scans"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to scans
          </Link>
        </div>
      </div>
    );
  }

  const isActive =
    scan.status === ScanStatus.RUNNING || scan.status === ScanStatus.PENDING;
  const canExport =
    scan.status === ScanStatus.COMPLETED && scan.findings.length > 0;

  return (
    <>
      <PageHeader
        backTo="/dashboard/scans"
        title="Scan results"
        description={scan.config.target}
        actions={
          <>
            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelScan.isPending}
                className="text-destructive hover:text-destructive"
              >
                <XCircle size={14} />
                {cancelScan.isPending ? "Cancelling…" : "Cancel"}
              </Button>
            )}
            {canExport && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                >
                  <Download size={14} />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("sarif")}
                >
                  <Download size={14} />
                  SARIF
                </Button>
              </>
            )}
            <StatusBadge status={scan.status} />
          </>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        {isActive && (
          <Card className="mb-8 border-status-running/30 bg-status-running-muted p-6 text-center">
            <Loader2 className="mx-auto mb-3 size-7 animate-spin text-status-running" />
            <p className="font-medium text-foreground">
              Scan is {scan.status}…
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Results will appear automatically.
            </p>
          </Card>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
            const count = scan.findings.filter(
              (f) => f.severity.toUpperCase() === sev,
            ).length;
            return (
              <Card key={sev} className="p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {sev}
                </div>
                <div className={cn("mt-1 font-serif text-3xl font-semibold", severityText[sev])}>
                  {count}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mb-8 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3.5">
            <h2 className="font-serif text-base font-semibold text-foreground">
              Findings ({scan.findings.length})
            </h2>
          </div>
          {scan.findings.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isActive ? "Waiting for results…" : "No vulnerabilities found."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {scan.findings.map((finding) => (
                <div key={finding.id} className="p-5 transition-colors hover:bg-accent/30">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-medium text-card-foreground">
                      {finding.title}
                    </h3>
                    <SeverityBadge severity={finding.severity} className="shrink-0" />
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {finding.description}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground/70">
                    <span>Tool: {finding.tool}</span>
                    <span>Location: {finding.location || "N/A"}</span>
                  </div>
                  {finding.remediation && (
                    <div className="mt-3 rounded-md border border-border bg-accent/40 p-3">
                      <span className="mb-1 block text-xs font-semibold text-accent-foreground">
                        Remediation
                      </span>
                      <p className="whitespace-pre-line text-sm text-foreground">
                        {finding.remediation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {scan.logs && scan.logs.length > 0 && (
          <Card className="overflow-hidden p-0 font-mono text-sm">
            <div className="border-b border-border bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scan logs
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto p-4">
              {scan.logs.map((log, i) => (
                <div key={`${log.timestamp}-${i}`} className="flex gap-2">
                  <span className="shrink-0 text-muted-foreground/50">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={
                      log.level === "error"
                        ? "text-destructive"
                        : log.level === "warn"
                          ? "text-status-pending"
                          : "text-foreground/80"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
