import { ScanType } from "@openvscan/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Play, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import Link from "@/components/AppLink";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/Input";
import {
  useDisconnectRepositoryMutation,
  useRepositoryQuery,
  useStartRepositoryScanMutation,
  useUpdateRepositoryConfigMutation,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/repositories/$id")({
  component: RepositoryDetailPage,
});

const availableScanners = [
  { type: ScanType.STATIC_ANALYSIS, label: "Static Analysis", tool: "Semgrep" },
  { type: ScanType.DEPENDENCY_AUDIT, label: "Dependency Audit", tool: "Trivy" },
  { type: ScanType.CONTAINER, label: "Container Scan", tool: "Trivy" },
  { type: ScanType.DAST, label: "DAST", tool: "OWASP ZAP" },
];

function RepositoryDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: repo, isLoading } = useRepositoryQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!repo) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Repository not found</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        backTo="/dashboard/repositories"
        title={repo.fullName}
        description={`Default branch: ${repo.defaultBranch}`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ConfigForm repo={repo} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <RecentScans
              scans={repo.scans ?? []}
              onView={(scanId) =>
                navigate({
                  to: "/dashboard/scans/$id",
                  params: { id: scanId },
                })
              }
            />
          </div>
        </div>
      </main>
    </>
  );
}

function ConfigForm({
  repo,
}: {
  repo: NonNullable<ReturnType<typeof useRepositoryQuery>["data"]>;
}) {
  const navigate = useNavigate();
  const update = useUpdateRepositoryConfigMutation(repo.id);
  const startScan = useStartRepositoryScanMutation(repo.id);
  const disconnect = useDisconnectRepositoryMutation();

  const [scanMode, setScanMode] = useState<"manual" | "automatic">(
    repo.scanMode,
  );
  const [branchFilter, setBranchFilter] = useState(repo.branchFilter ?? "");
  const [scanners, setScanners] = useState<string[]>(
    repo.enabledScanners.length
      ? repo.enabledScanners
      : [ScanType.DEPENDENCY_AUDIT],
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (type: string) =>
    setScanners((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (scanners.length === 0) {
      setError("Select at least one scanner");
      return;
    }
    try {
      await update.mutateAsync({
        scanMode,
        branchFilter: branchFilter.trim() || null,
        enabledScanners: scanners,
      });
      setSaved(true);
    } catch {
      setError("Failed to save configuration");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scan configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-md border border-status-completed/30 bg-status-completed-muted px-3 py-2 text-sm text-status-completed">
              Configuration saved.
            </div>
          )}

          {/* Trigger mode */}
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-foreground">
              Trigger
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  value: "automatic" as const,
                  title: "Automatic",
                  desc: "Scan on every push to a matching branch.",
                },
                {
                  value: "manual" as const,
                  title: "Manual",
                  desc: "Only scan when you start it here.",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScanMode(opt.value)}
                  className={cn(
                    "rounded-md border p-3 text-left transition-colors",
                    scanMode === opt.value
                      ? "border-primary/50 bg-accent"
                      : "border-border hover:bg-accent/50",
                  )}
                >
                  <div className="text-sm font-medium text-foreground">
                    {opt.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Branch filter */}
          <div className="space-y-1.5">
            <Label htmlFor="branch-filter">Branch filter</Label>
            <Input
              id="branch-filter"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              placeholder="main, develop (leave empty for all branches)"
              disabled={scanMode !== "automatic"}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated branch names. Only used in Automatic mode.
            </p>
          </div>

          {/* Scanners */}
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-foreground">
              Scanners
            </legend>
            <div className="grid gap-2">
              {availableScanners.map(({ type, label, tool }) => {
                const active = scanners.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggle(type)}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "border-primary/50 bg-accent text-accent-foreground"
                        : "border-border hover:bg-accent/50",
                    )}
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {tool}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save configuration"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={startScan.isPending}
              onClick={async () => {
                const res = await startScan.mutateAsync();
                navigate({
                  to: "/dashboard/scans/$id",
                  params: { id: res.scanId },
                });
              }}
            >
              <Play size={15} className="mr-1.5" />
              {startScan.isPending ? "Starting…" : "Scan now"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="ml-auto"
              disabled={disconnect.isPending}
              onClick={async () => {
                await disconnect.mutateAsync(repo.id);
                navigate({ to: "/dashboard/repositories" });
              }}
            >
              <Trash2 size={15} className="mr-1.5" />
              Disconnect
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function RecentScans({
  scans,
  onView,
}: {
  scans: Array<{
    id: string;
    status: string;
    branch?: string | null;
    trigger: string;
    createdAt: Date;
  }>;
  onView: (scanId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent scans</CardTitle>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scans yet.</p>
        ) : (
          <div className="space-y-2">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/dashboard/scans/${scan.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onView(scan.id);
                }}
                className="block rounded-md border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 text-sm">
                    <div className="truncate font-medium text-foreground">
                      {scan.branch || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scan.trigger} ·{" "}
                      {new Date(scan.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <StatusBadge status={scan.status} className="shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
