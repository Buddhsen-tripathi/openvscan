import { ShieldCheck } from "lucide-react";
import { useDashboardUser } from "@/components/dashboard/DashboardContext";

export default function WelcomeBanner() {
  const user = useDashboardUser();

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
      <div className="relative flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold text-card-foreground">
            Welcome back, {user.name}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s an overview of your security posture.
          </p>
        </div>
      </div>
    </div>
  );
}
