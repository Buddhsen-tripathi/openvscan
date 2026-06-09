import { ScanStatus } from "@openvscan/types";
import { createFileRoute } from "@tanstack/react-router";
import { Filter, Loader2, ScanSearch, Search } from "lucide-react";
import { useState } from "react";
import Link from "@/components/AppLink";
import { useScansQuery } from "@/lib/api";

const statusStyles: Record<string, string> = {
  [ScanStatus.COMPLETED]: "bg-status-completed-muted text-status-completed",
  [ScanStatus.FAILED]: "bg-status-failed-muted text-status-failed",
  [ScanStatus.RUNNING]: "bg-status-running-muted text-status-running",
  [ScanStatus.PENDING]: "bg-status-pending-muted text-status-pending",
  [ScanStatus.CANCELLED]: "bg-status-cancelled-muted text-status-cancelled",
};

export const Route = createFileRoute("/dashboard/scans")({
  component: ScansListPage,
});

function ScansListPage() {
  const { data: scans = [], isLoading } = useScansQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      !search ||
      scan.config.target.toLowerCase().includes(search.toLowerCase()) ||
      scan.project.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <header className="flex justify-between items-center bg-card border-b border-border px-6 py-4">
        <h2 className="text-xl font-semibold text-foreground">All Scans</h2>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
            />
            <input
              type="text"
              placeholder="Search by target or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              <option value="all">All statuses</option>
              <option value={ScanStatus.COMPLETED}>Completed</option>
              <option value={ScanStatus.RUNNING}>Running</option>
              <option value={ScanStatus.PENDING}>Pending</option>
              <option value={ScanStatus.FAILED}>Failed</option>
              <option value={ScanStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border/60 bg-card">
            <ScanSearch className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              {scans.length === 0 ? "No scans yet" : "No matching scans"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {scans.length === 0
                ? "Start a scan from one of your projects."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Target
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredScans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/scans/${scan.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {scan.config.target}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/projects/${scan.project.id}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {scan.project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${statusStyles[scan.status] || "bg-muted text-muted-foreground"}`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
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
