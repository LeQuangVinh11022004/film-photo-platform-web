"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { getAuthToken } from "@/services/authToken";
import { ErrorStatusPage } from "@/shared/components/ErrorPages";

export function RoleGuard({ role, children }: { role: "provider" | "moderator" | "admin"; children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const storeToken = useAuthStore((state) => state.token);
  const currentRole = useAuthStore((state) => state.user?.role);
  const authErrorCode = useAuthStore((state) => state.authErrorCode);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    const finishHydration = () => setHydrated(true);
    if (useAuthStore.persist.hasHydrated()) {
      finishHydration();
      return;
    }
    return useAuthStore.persist.onFinishHydration(finishHydration);
  }, []);

  const activeToken = hydrated ? (getAuthToken() ?? storeToken) : null;

  useEffect(() => {
    if (hydrated && !getAuthToken() && storeToken) {
      clearSession();
    }
  }, [hydrated, storeToken, clearSession]);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-6 py-12 text-sm text-slate-500">
        Checking session…
      </main>
    );
  }

  if (authErrorCode === "401" || !activeToken || !currentRole) {
    return <ErrorStatusPage code="401" />;
  }

  if (authErrorCode === "403" || currentRole !== role) {
    return <ErrorStatusPage code="403" />;
  }

  return children;
}
