import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthToken, setAuthToken } from "@/services/authToken";

export type UserRole = "provider" | "moderator" | "admin";
export type AuthUser = { id: string; name: string; email: string; role: UserRole };
export type AuthErrorCode = "401" | "403" | null;

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  expiresAtUtc: string | null;
  authErrorCode: AuthErrorCode;
  isLoggingOut: boolean;
  setSession: (token: string, user: AuthUser, expiresAtUtc?: string | null) => void;
  setAuthError: (code: AuthErrorCode) => void;
  clearSession: () => void;
  startLogout: () => void;
  finishLogout: () => void;
};

export const useAuthStore = create<AuthState>()(persist((set) => ({
  token: null,
  user: null,
  expiresAtUtc: null,
  authErrorCode: null,
  isLoggingOut: false,
  setSession: (token, user, expiresAtUtc) => {
    if (expiresAtUtc !== undefined) setAuthToken(token, expiresAtUtc);
    else setAuthToken(token);
    set((state) => ({ token, user, authErrorCode: null, isLoggingOut: false, expiresAtUtc: expiresAtUtc === undefined ? state.expiresAtUtc : expiresAtUtc }));
  },
  setAuthError: (authErrorCode) => set({ authErrorCode }),
  clearSession: () => {
    clearAuthToken();
    set({ token: null, user: null, expiresAtUtc: null, authErrorCode: null });
  },
  startLogout: () => {
    clearAuthToken();
    set({ token: null, user: null, expiresAtUtc: null, authErrorCode: null, isLoggingOut: true });
  },
  finishLogout: () => set({ isLoggingOut: false }),
}), {
  name: "film-photo.auth-session",
  partialize: (state) => ({ token: state.token, user: state.user, expiresAtUtc: state.expiresAtUtc }),
}));
