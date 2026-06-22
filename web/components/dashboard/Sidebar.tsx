import { useRouterState } from "@tanstack/react-router";
import {
  GitBranch,
  LayoutDashboard,
  ScanSearch,
  Settings,
  User,
} from "lucide-react";
import Image from "@/components/AppImage";
import Link from "@/components/AppLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useDashboardUser } from "./DashboardContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/repositories", label: "Repositories", icon: GitBranch },
  { href: "/dashboard/scans", label: "Scans", icon: ScanSearch },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const user = useDashboardUser();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Logo */}
      <div className="px-4 pb-4 pt-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="OpenVScan"
            width={24}
            height={24}
            className="rounded-md"
          />
          <span className="font-serif text-base font-semibold tracking-tight text-sidebar-foreground">
            OpenVScan
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto p-3">
        <div className="flex items-center gap-2.5 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3 py-2.5">
          <Link
            href="/dashboard/profile"
            className="flex min-w-0 flex-1 items-center gap-2.5"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={28}
                height={28}
                className="size-7 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
          </Link>
          <ThemeToggle className="size-7 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
