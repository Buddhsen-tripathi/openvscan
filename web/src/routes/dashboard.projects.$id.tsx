import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import Link from "@/components/AppLink";
import { CreateScanForm } from "@/components/dashboard/CreateScanForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectQuery } from "@/lib/api";

export const Route = createFileRoute("/dashboard/projects/$id")({
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProjectQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        backTo="/dashboard"
        title={project.name}
        description={project.description || undefined}
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent scans</CardTitle>
              </CardHeader>
              <CardContent>
                {!project.scans || project.scans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No scans performed yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {project.scans.map((scan) => (
                      <Link
                        key={scan.id}
                        href={`/dashboard/scans/${scan.id}`}
                        className="block rounded-md border border-border p-4 transition-colors hover:bg-accent/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                              {scan.config.target}
                            </div>
                            <div className="text-sm text-muted-foreground">
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
          </div>

          <div className="lg:col-span-1">
            <CreateScanForm
              projectId={project.id}
              onScanStarted={(scanId) =>
                navigate({ to: "/dashboard/scans/$id", params: { id: scanId } })
              }
            />
          </div>
        </div>
      </main>
    </>
  );
}
