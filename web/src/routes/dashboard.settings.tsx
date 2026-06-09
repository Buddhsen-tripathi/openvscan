import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useDashboardUser } from "@/components/dashboard/DashboardContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <PageHeader title="Settings" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User size={18} className="text-muted-foreground" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <div className="font-medium text-foreground">{user.name}</div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">
                  Email
                </div>
                <div className="text-foreground">{user.email}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock size={18} className="text-muted-foreground" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Password</div>
                  <div className="text-sm text-muted-foreground">
                    Change your account password
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: "/forgot-password" })}
                >
                  Change password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <LogOut size={18} />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Sign out</div>
                  <div className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Signing out…" : "Sign out"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
