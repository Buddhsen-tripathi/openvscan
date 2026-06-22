import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import Link from "@/components/AppLink";
import {
  AuthError,
  AuthShell,
  AuthSuccess,
} from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { getSession } from "@/src/lib/session";

export const Route = createFileRoute("/forgot-password")({
  // Already signed in? No need for the reset flow.
  beforeLoad: async () => {
    if (await getSession()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to reset your password."
      footer={
        <>
          Remember your password?{" "}
          <Link
            href="/signin"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          setSuccess(false);
          try {
            // Relative URL resolves against the current origin — works in dev
            // (:3000) and prod (openvscan.com) without a hardcoded host.
            const response = await fetch(
              "/api/auth/request-password-reset",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, redirectTo: "/reset-password" }),
              },
            );
            if (!response.ok) {
              const body = (await response.json().catch(() => undefined)) as
                | { message?: string }
                | undefined;
              setError(body?.message || "An error occurred");
              return;
            }
            setSuccess(true);
          } catch {
            setError("An unexpected error occurred.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {error && <AuthError message={error} />}
        {success && <AuthSuccess message="Check your email for a reset link." />}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
