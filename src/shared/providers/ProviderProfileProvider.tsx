"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

type ProviderProfileValue = {
  displayName: string;
  setDisplayName: (name: string) => void;
};

const profileStorageKey = "film-photo-provider-profile-name";
const profileListeners = new Set<() => void>();
const fallbackProfile: ProviderProfileValue = { displayName: "Provider", setDisplayName: () => undefined };

const ProviderProfileContext = createContext(fallbackProfile);

function subscribeToProfile(listener: () => void) {
  profileListeners.add(listener);
  if (typeof window !== "undefined") window.addEventListener("storage", listener);
  return () => {
    profileListeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", listener);
  };
}

function getProfileSnapshot() {
  if (typeof window === "undefined") return "Provider";
  return window.localStorage.getItem(profileStorageKey) || "Provider";
}

function setStoredDisplayName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(profileStorageKey, name);
  profileListeners.forEach((listener) => listener());
}

export function ProviderProfileProvider({ children }: { children: ReactNode }) {
  const displayName = useSyncExternalStore(subscribeToProfile, getProfileSnapshot, () => "Provider");
  return <ProviderProfileContext.Provider value={{ displayName, setDisplayName: setStoredDisplayName }}>{children}</ProviderProfileContext.Provider>;
}

export function useProviderProfile() {
  return useContext(ProviderProfileContext);
}
