import type { ReactNode } from "react";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { DashboardShell } from "@/shared/layouts/DashboardShell";

export default function ModeratorLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="moderator"><DashboardShell role="moderator">{children}</DashboardShell></RoleGuard>;
}
