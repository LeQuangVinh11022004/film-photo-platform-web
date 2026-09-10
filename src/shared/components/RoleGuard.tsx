"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";

export function RoleGuard({ role, children }: { role: "provider" | "moderator" | "admin"; children: ReactNode }) {
  const currentRole = useAuthStore((state) => state.user?.role);

  if (currentRole && currentRole !== role) {
    return <div className="p-8 text-sm text-red-700">You do not have access to this workspace.</div>;
  }

  return children;
}
