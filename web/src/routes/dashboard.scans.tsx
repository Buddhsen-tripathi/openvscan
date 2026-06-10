import { ScanStatus } from "@openvscan/types";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ScanSearch, Search } from "lucide-react";
import { useState } from "react";
import Link from "@/components/AppLink";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import { useScansQuery } from "@/lib/api";

export const Route = createFileRoute("/dashboard/scans")({
  component: ScansListPage,
});

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: ScanStatus.COMPLETED, label: "Completed" },
  { value: ScanStatus.RUNNING, label: "Running" },
  { value: ScanStatus.PENDING, label: "Pending" },
  { value: ScanStatus.FAILED, label: "Failed" },
  { value: ScanStatus.CANCELLED, label: "Cancelled" },
];

function ScansListPage() {
  const { data: scans = [], isLoading } = useScansQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const sourceName = (scan: (typeof scans)[number]) =>
    scan.project?.name ?? scan.repository?.fullName ?? "—";

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      !search ||
      scan.config.target.toLowerCase().includes(search.toLowerCase()) ||
      sourceName(scan).toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader title="Scans" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
            />
            <Input
              type="text"
              placeholder="Search by target or project…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <ScanSearch className="mb-3 size-10 text-muted-foreground/40" />
            <h3 className="font-serif text-base font-semibold text-foreground">
              {scans.length === 0 ? "No scans yet" : "No matching scans"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {scans.length === 0
                ? "Start a scan from one of your projects."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/scans/${scan.id}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {scan.config.target}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {scan.project ? (
                        <Link
                          href={`/dashboard/projects/${scan.project.id}`}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {scan.project.name}
                        </Link>
                      ) : scan.repository ? (
                        <Link
                          href={`/dashboard/repositories/${scan.repository.id}`}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {scan.repository.fullName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={scan.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
