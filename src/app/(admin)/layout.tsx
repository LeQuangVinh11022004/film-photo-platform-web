import type { ReactNode } from "react";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { AdminWorkspaceShell } from "@/shared/layouts/AdminWorkspaceShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="admin"><AdminWorkspaceShell>{children}</AdminWorkspaceShell></RoleGuard>;
}
