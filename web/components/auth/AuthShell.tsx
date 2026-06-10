import { FileDown, Github, ListTree, ScanLine } from "lucide-react";
import { type ReactNode, useState } from "react";
import Image from "@/components/AppImage";
import Link from "@/components/AppLink";
import { signIn } from "@/lib/auth-client";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const scanners = ["Trivy", "Nmap", "Semgrep", "OWASP ZAP"];

const features = [
  {
    icon: ScanLine,
    title: "Async vulnerability scanning",
    desc: "Queue-backed scans, powered by Trivy.",
  },
  {
    icon: ListTree,
    title: "Findings by severity",
    desc: "Grouped results with remediation guidance.",
  },
  {
    icon: FileDown,
    title: "SARIF & JSON exports",
    desc: "Drop results straight into your pipeline.",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="mb-8 flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="OpenVScan"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-base font-semibold tracking-tight text-foreground">
                OpenVScan
              </span>
            </Link>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {children}

          {footer && (
            <p className="mt-8 text-center text-xs text-muted-foreground">
              {footer}
            </p>
          )}
        </div>
      </section>

      {/* Decorative side — distinct textured surface */}
      <section className="relative hidden overflow-hidden border-l border-sidebar-border bg-sidebar lg:block">
        {/* masked dot texture */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.06] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
        {/* soft directional tint + depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-center px-12 xl:px-16">
          <h2 className="max-w-md font-serif text-3xl font-semibold leading-tight tracking-tight text-sidebar-foreground">
            Catch the vulnerability before it ships.
          </h2>
          <p className="mt-3 max-w-md text-sm text-sidebar-foreground/60">
            Open-source scanners and AI-assisted triage, unified into one
            pre-production security workflow.
          </p>

          <ul className="mt-10 max-w-md space-y-4">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-card/60 text-sidebar-foreground">
                  <f.icon size={15} />
                </span>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-sidebar-foreground/55">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Scanner integrations */}
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-sidebar-foreground/50">
            <span className="uppercase tracking-wider">Powered by</span>
            {scanners.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * "Continue with GitHub" social-login button. Kicks off the Better-auth GitHub
 * OAuth flow; on success the user lands on the dashboard. When GitHub OAuth is
 * not configured the call fails and we surface a short hint.
 */
export function GithubAuthButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            await signIn.social({
              provider: "github",
              callbackURL: "/dashboard",
            });
          } catch {
            setLoading(false);
            setError("GitHub sign-in is not available. Try email instead.");
          }
        }}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background/40 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent/50 disabled:opacity-60"
      >
        <Github size={16} />
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
      {message}
    </div>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-status-completed/30 bg-status-completed-muted px-3 py-2 text-center text-sm text-status-completed">
      {message}
    </div>
  );
}

export function PasswordField({
  show,
  onToggle,
  ...props
}: {
  show: boolean;
  onToggle: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className="flex h-10 w-full rounded-md border border-input bg-background/40 px-3 py-1 pr-16 text-sm shadow-xs transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggle}
        className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
