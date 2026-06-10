import { createFileRoute } from "@tanstack/react-router";
import { GitBranch, Github, Loader2, Plus } from "lucide-react";
import Link from "@/components/AppLink";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useConnectableReposQuery,
  useConnectRepositoryMutation,
  useGithubConnectionQuery,
  useRepositoriesQuery,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard/repositories")({
  component: RepositoriesPage,
});

function RepositoriesPage() {
  const { data: connection, isLoading: connLoading } =
    useGithubConnectionQuery();
  const { data: repositories = [], isLoading: reposLoading } =
    useRepositoriesQuery();
  const hasInstallation = (connection?.installations.length ?? 0) > 0;
  const { data: connectable = [], isLoading: connectableLoading } =
    useConnectableReposQuery(hasInstallation);
  const connect = useConnectRepositoryMutation();

  if (connLoading) {
    return (
      <>
        <PageHeader title="Repositories" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Repositories"
        description="Connect GitHub repositories and scan them automatically on push."
        actions={
          connection?.installUrl ? (
            <a href={connection.installUrl}>
              <Button size="sm" variant="outline">
                <Github size={15} className="mr-1.5" />
                {hasInstallation ? "Manage on GitHub" : "Connect GitHub"}
              </Button>
            </a>
          ) : undefined
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        {!connection?.configured ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-center">
            <Github className="mb-3 size-10 text-muted-foreground/40" />
            <h3 className="font-serif text-base font-semibold text-foreground">
              GitHub integration not configured
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              The GitHub App credentials are not set on this deployment. See the
              README "GitHub integration" section to register an App.
            </p>
          </div>
        ) : !hasInstallation ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-center">
            <Github className="mb-3 size-10 text-muted-foreground/40" />
            <h3 className="font-serif text-base font-semibold text-foreground">
              Connect your GitHub account
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Install the OpenVScan GitHub App on the repositories you want to
              scan, then come back to configure them.
            </p>
            {connection.installUrl && (
              <a href={connection.installUrl} className="mt-5">
                <Button>
                  <Github size={16} className="mr-2" />
                  Install GitHub App
                </Button>
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Connected repositories */}
            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Connected
              </h2>
              {reposLoading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : repositories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No repositories connected yet. Pick one below.
                </p>
              ) : (
                <div className="space-y-2">
                  {repositories.map((repo) => (
                    <Link
                      key={repo.id}
                      href={`/dashboard/repositories/${repo.id}`}
                      className="flex items-center justify-between rounded-md border border-border bg-card p-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-3">
                        <GitBranch
                          size={16}
                          className="shrink-0 text-muted-foreground"
                        />
                        <div>
                          <div className="font-medium text-foreground">
                            {repo.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {repo.scanMode === "automatic"
                              ? `Auto · ${repo.branchFilter || "all branches"}`
                              : "Manual"}
                          </div>
                        </div>
                      </div>
                      <span
                        className={
                          repo.scanMode === "automatic"
                            ? "rounded-full bg-status-completed-muted px-2.5 py-0.5 text-xs font-medium text-status-completed"
                            : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {repo.scanMode}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Connectable repositories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Connect a repository
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectableLoading ? (
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                ) : connectable.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No more repositories available. Install the App on more
                    repos from GitHub to see them here.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {connectable.map((repo) => (
                      <div
                        key={repo.githubRepoId}
                        className="flex items-center justify-between rounded-md border border-border px-4 py-2.5"
                      >
                        <span className="text-sm text-foreground">
                          {repo.fullName}
                          {repo.private && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              private
                            </span>
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={connect.isPending}
                          onClick={() => connect.mutate(repo.githubRepoId)}
                        >
                          <Plus size={14} className="mr-1" />
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
