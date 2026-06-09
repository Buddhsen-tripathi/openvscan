import { createFileRoute } from "@tanstack/react-router";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectButton";
import { ProjectList } from "@/components/dashboard/ProjectList";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <header className="flex justify-between items-center bg-card border-b border-border px-6 py-4">
        <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <WelcomeBanner />

        <div className="flex justify-between items-center mt-8 mb-4">
          <h3 className="text-lg font-bold text-foreground">Your Projects</h3>
          <CreateProjectButton />
        </div>

        <ProjectList />
      </main>
    </>
  );
}
