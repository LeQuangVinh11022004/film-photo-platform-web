import { create } from "zustand";

export type UserRole = "provider" | "moderator" | "admin";
export type AuthUser = { id: string; name: string; email: string; role: UserRole };

type AuthState = { token: string | null; user: AuthUser | null; setSession: (token: string, user: AuthUser) => void; clearSession: () => void };

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => set({ token, user }),
  clearSession: () => set({ token: null, user: null }),
}));
