import type { ReactNode } from "react";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { DashboardShell } from "@/shared/layouts/DashboardShell";

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="provider"><DashboardShell role="provider">{children}</DashboardShell></RoleGuard>;
}
