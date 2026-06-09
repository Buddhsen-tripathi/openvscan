import { createFileRoute } from "@tanstack/react-router";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectButton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProjectList } from "@/components/dashboard/ProjectList";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <PageHeader title="Overview" />

      <main className="flex-1 overflow-y-auto p-6">
        <WelcomeBanner />

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
