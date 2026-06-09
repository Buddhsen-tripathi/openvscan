"use client";

import { createContext, useContext } from "react";

interface DashboardUser {
  name: string;
  email: string;
}

interface DashboardContextType {
  user: DashboardUser;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return (
    <DashboardContext.Provider value={{ user }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardUser() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardUser must be used within DashboardProvider");
  }
  return ctx.user;
}
