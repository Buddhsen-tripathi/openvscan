import { ScanStatus } from "@openvscan/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "@/components/AppLink";
import { CreateScanForm } from "@/components/dashboard/CreateScanForm";
import { useProjectQuery } from "@/lib/api";

const statusStyles: Record<string, string> = {
  [ScanStatus.COMPLETED]: "bg-status-completed-muted text-status-completed",
  [ScanStatus.FAILED]: "bg-status-failed-muted text-status-failed",
  [ScanStatus.RUNNING]: "bg-status-running-muted text-status-running",
  [ScanStatus.PENDING]: "bg-status-pending-muted text-status-pending",
  [ScanStatus.CANCELLED]: "bg-status-cancelled-muted text-status-cancelled",
};

export const Route = createFileRoute("/dashboard/projects/$id")({
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProjectQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-semibold text-foreground">
            {project.name}
          </h2>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl p-5 border border-border/60 bg-card">
              <h3 className="text-lg font-bold text-card-foreground mb-4">
                Recent Scans
              </h3>
              {!project.scans || project.scans.length === 0 ? (
                <p className="text-muted-foreground">No scans performed yet.</p>
              ) : (
                <div className="space-y-3">
                  {project.scans.map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/dashboard/scans/${scan.id}`}
                      className="block border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-foreground">
                            {scan.config.target}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(scan.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${statusStyles[scan.status] || "bg-muted text-muted-foreground"}`}
                        >
                          {scan.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CreateScanForm
              projectId={project.id}
              onScanStarted={(scanId) =>
                navigate({ to: "/dashboard/scans/$id", params: { id: scanId } })
              }
            />

            <div className="mt-6 rounded-xl p-5 border border-border/60 bg-card">
              <h3 className="text-lg font-bold text-card-foreground mb-2">
                About
              </h3>
              <p className="text-muted-foreground text-sm">
                {project.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
