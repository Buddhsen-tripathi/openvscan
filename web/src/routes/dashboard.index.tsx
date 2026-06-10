import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Github } from "lucide-react";
import Link from "@/components/AppLink";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectButton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProjectList } from "@/components/dashboard/ProjectList";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import { useGithubConnectionQuery, useRepositoriesQuery } from "@/lib/api";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function ConnectGithubCTA() {
  const { data: connection } = useGithubConnectionQuery();
  const { data: repositories } = useRepositoriesQuery();
  // Only nudge when GitHub is available but nothing is connected yet.
  if (!connection?.configured) return null;
  if (repositories && repositories.length > 0) return null;

  return (
    <Link
      href="/dashboard/repositories"
      className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
          <Github size={18} className="text-foreground" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">
            Connect a GitHub repository
          </div>
          <div className="text-xs text-muted-foreground">
            Scan automatically on every push and get results on your PRs.
          </div>
        </div>
      </div>
      <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}

function DashboardPage() {
  return (
    <>
      <PageHeader title="Overview" />

      <main className="flex-1 overflow-y-auto p-6">
        <WelcomeBanner />
        <ConnectGithubCTA />

        <div className="mb-4 mt-8 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Your projects
          </h2>
          <CreateProjectButton />
        </div>

        <ProjectList />
      </main>
    </>
  );
}
