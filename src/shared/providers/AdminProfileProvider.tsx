"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

type AdminProfileValue = {
  displayName: string;
  setDisplayName: (name: string) => void;
};

const profileStorageKey = "film-photo-admin-profile-name";
const profileListeners = new Set<() => void>();
const fallbackProfile: AdminProfileValue = { displayName: "Administrator", setDisplayName: () => undefined };
const AdminProfileContext = createContext(fallbackProfile);

function subscribeToProfile(listener: () => void) {
  profileListeners.add(listener);
  if (typeof window !== "undefined") window.addEventListener("storage", listener);
  return () => {
    profileListeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", listener);
  };
}

function getProfileSnapshot() {
  if (typeof window === "undefined") return "Administrator";
  return window.localStorage.getItem(profileStorageKey) || "Administrator";
}

function setStoredDisplayName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(profileStorageKey, name);
  profileListeners.forEach((listener) => listener());
}

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const displayName = useSyncExternalStore(subscribeToProfile, getProfileSnapshot, () => "Administrator");
  return <AdminProfileContext.Provider value={{ displayName, setDisplayName: setStoredDisplayName }}>{children}</AdminProfileContext.Provider>;
}

export function useAdminProfile() {
  return useContext(AdminProfileContext);
}