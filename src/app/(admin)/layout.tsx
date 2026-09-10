import type { ReactNode } from "react";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { DashboardShell } from "@/shared/layouts/DashboardShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="admin"><DashboardShell role="admin">{children}</DashboardShell></RoleGuard>;
}
