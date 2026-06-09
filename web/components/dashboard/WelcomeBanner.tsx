import { Shield } from "lucide-react";
import { useDashboardUser } from "@/components/dashboard/DashboardContext";

export default function WelcomeBanner() {
  const user = useDashboardUser();

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Welcome back, {user.name}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s an overview of your security posture.
          </p>
        </div>
      </div>
    </div>
  );
}
