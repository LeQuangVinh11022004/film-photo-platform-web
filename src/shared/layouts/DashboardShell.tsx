import type { ReactNode } from "react";
import { Sidebar } from "@/shared/components/Sidebar";

export function DashboardShell({ children, role }: { children: ReactNode; role: "provider" | "moderator" | "admin" }) {
  return (
    <div className="min-h-screen bg-[#f7f7f2] lg:flex">
      <Sidebar role={role} />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
