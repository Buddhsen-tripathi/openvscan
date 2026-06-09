"use client";

import { useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ScanSearch, Settings } from "lucide-react";
import Image from "@/components/AppImage";
import Link from "@/components/AppLink";
import { cn } from "@/lib/utils";
import { useDashboardUser } from "./DashboardContext";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard/scans", label: "Scans", icon: ScanSearch },
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
    <aside className="w-56 flex-shrink-0 bg-sidebar hidden md:flex flex-col border-r border-border/40">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="OpenVScan"
            width={24}
            height={24}
            className="rounded"
          />
          <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
            OpenVScan
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                active
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 mt-auto">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/40">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {user.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
