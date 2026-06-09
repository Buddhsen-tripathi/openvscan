"use client";

import { FolderKanban, Loader2 } from "lucide-react";
import Link from "@/components/AppLink";
import { useProjectsQuery } from "@/lib/api";

export function ProjectList() {
  const { data: projects = [], isLoading } = useProjectsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border/60 bg-card">
        <FolderKanban className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold text-foreground">
          No projects yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating a new project.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/projects/${project.id}`}
          className="group block rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40"
        >
          <h3 className="text-base font-bold text-card-foreground mb-1.5 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
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
