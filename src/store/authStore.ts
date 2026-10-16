import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthToken, setAuthToken } from "@/services/authToken";

export type UserRole = "provider" | "moderator" | "admin";
export type AuthUser = { id: string; name: string; email: string; role: UserRole };

type AuthState = { token: string | null; user: AuthUser | null; expiresAtUtc: string | null; setSession: (token: string, user: AuthUser, expiresAtUtc?: string | null) => void; clearSession: () => void };

export const useAuthStore = create<AuthState>()(persist((set) => ({
  token: null,
  user: null,
  expiresAtUtc: null,
  setSession: (token, user, expiresAtUtc) => {
    if (expiresAtUtc !== undefined) setAuthToken(token, expiresAtUtc);
    else setAuthToken(token);
    set((state) => ({ token, user, expiresAtUtc: expiresAtUtc === undefined ? state.expiresAtUtc : expiresAtUtc }));
  },
  clearSession: () => {
    clearAuthToken();
    set({ token: null, user: null, expiresAtUtc: null });
  },
}), {
  name: "film-photo.auth-session",
  partialize: (state) => ({ token: state.token, user: state.user, expiresAtUtc: state.expiresAtUtc }),
}));
