import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardProvider } from "@/components/dashboard/DashboardContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { requireSession } from "@/src/lib/session";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => requireSession(),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user } = Route.useRouteContext();

  return (
    <DashboardProvider user={user}>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </DashboardProvider>
  );
}
