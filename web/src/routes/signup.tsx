import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Image from "@/components/AppImage";
import Link from "@/components/AppLink";
import { signUp } from "@/lib/auth-client";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <section className="p-4 min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

      <div
        className="absolute inset-0 flex items-center justify-center blur-3xl pointer-events-none"
        style={{ opacity: 0.15 }}
      >
        <div className="w-[600px] h-[600px] bg-primary/20 rounded-full animate-pulse-slow" />
      </div>

      <div
        className="relative bg-background/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-full sm:max-w-md px-8 sm:px-8 py-6 md:py-8 mx-auto text-center z-10 animate-fade-in-up overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-lg shadow-lg shadow-primary/20"
            priority
          />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            OpenVScan
          </h2>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          Create your account
        </h3>
        <p className="mb-8 text-sm text-muted-foreground">
          Sign up to secure your code before it ships.
        </p>

        <form
          className="space-y-5"
          autoComplete="off"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            await signUp.email({
              email,
              password,
              name: username,
              callbackURL: "/dashboard",
              fetchOptions: {
                onSuccess: () => {
                  setLoading(false);
                  navigate({ to: "/dashboard" });
                },
                onError: (ctx) => {
                  setLoading(false);
                  setError(ctx.error.message);
                },
              },
            });
          }}
        >
          {error && (
            <div className="text-destructive text-sm text-center bg-destructive/10 py-2 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}
          <div>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all text-base"
            />
          </div>
          <div>
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all text-base"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all pr-10 text-base"
            />
            <button
              type="button"
              className="absolute right-3 top-0 bottom-0 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 cursor-pointer transition-all duration-300 text-base"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
