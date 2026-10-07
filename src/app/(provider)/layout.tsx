import type { ReactNode } from "react";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ProviderWorkspaceShell } from "@/shared/layouts/ProviderWorkspaceShell";

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="provider"><ProviderWorkspaceShell>{children}</ProviderWorkspaceShell></RoleGuard>;
}
