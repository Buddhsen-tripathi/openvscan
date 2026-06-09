import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useDashboardUser } from "@/components/dashboard/DashboardContext";
import { signOut } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useDashboardUser();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate({ to: "/signin" });
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center bg-card border-b border-border px-6 py-4">
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl p-5 border border-border/60 bg-card">
            <div className="flex items-center gap-2 mb-5">
              <User size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-card-foreground">
                Profile
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-muted-foreground mb-1">
                  Name
                </div>
                <div className="text-foreground font-medium">{user.name}</div>
              </div>
              <div>
                <div className="block text-sm font-medium text-muted-foreground mb-1">
                  Email
                </div>
                <div className="text-foreground">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 border border-border/60 bg-card">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-card-foreground">
                Security
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Password</div>
                  <div className="text-sm text-muted-foreground">
                    Change your account password
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/forgot-password" })}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Change password
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 border border-destructive/20 bg-card">
            <div className="flex items-center gap-2 mb-5">
              <LogOut size={18} className="text-destructive" />
              <h3 className="text-lg font-bold text-destructive">Account</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Sign out</div>
                <div className="text-sm text-muted-foreground">
                  Sign out of your account on this device
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
