import { ArrowUpRight, FolderKanban, Loader2 } from "lucide-react";
import Link from "@/components/AppLink";
import { useProjectsQuery } from "@/lib/api";

export function ProjectList() {
  const { data: projects = [], isLoading } = useProjectsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
        <FolderKanban className="mb-3 size-10 text-muted-foreground/40" />
        <h3 className="font-serif text-base font-semibold text-foreground">
          No projects yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating a new project.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/projects/${project.id}`}
          className="group block rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="mb-1.5 flex items-start justify-between">
            <h3 className="font-serif text-base font-semibold text-card-foreground">
              {project.name}
            </h3>
            <ArrowUpRight className="size-4 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
          </div>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {project.description || "No description provided"}
          </p>
          <div className="text-xs text-muted-foreground/70">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
