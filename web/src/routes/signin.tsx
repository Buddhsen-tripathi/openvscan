import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Link from "@/components/AppLink";
import {
  AuthError,
  AuthShell,
  GithubAuthButton,
  PasswordField,
} from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/auth-client";
import { getSession } from "@/src/lib/session";

export const Route = createFileRoute("/signin")({
  // Already signed in? Don't show the auth form — go to the dashboard.
  beforeLoad: async () => {
    if (await getSession()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SignInPage,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue securing your code before it ships."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <GithubAuthButton label="Continue with GitHub" />

      <form
        className="mt-4 space-y-4"
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          await signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
            fetchOptions: {
              onSuccess: () => {
                setLoading(false);
                // Honor a post-login destination (the GitHub setup callback
                // bounces unauthenticated users through /signin?redirect=…). It
                // may be a non-router path, so use a full navigation when set.
                const target = new URLSearchParams(window.location.search).get(
                  "redirect",
                );
                if (target) {
                  window.location.href = target;
                } else {
                  navigate({ to: "/dashboard" });
                }
              },
              onError: (ctx) => {
                setLoading(false);
                setError(ctx.error.message);
              },
            },
          });
        }}
      >
        {error && <AuthError message={error} />}

        <div className="space-y-1.5">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="email"
          >
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="password"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
