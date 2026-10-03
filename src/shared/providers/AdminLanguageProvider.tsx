"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { adminMessages, type AdminLocale, type AdminMessages } from "@/shared/i18n/adminMessages";

type AdminLanguageContextValue = {
  locale: AdminLocale;
  messages: AdminMessages;
  setLocale: (locale: AdminLocale) => void;
};

const defaultContext: AdminLanguageContextValue = {
  locale: "en",
  messages: adminMessages.en,
  setLocale: () => undefined,
};

const AdminLanguageContext = createContext<AdminLanguageContextValue>(defaultContext);
const localeStorageKey = "film-photo-admin-language";
const localeListeners = new Set<() => void>();

function subscribeToLocale(listener: () => void) {
  localeListeners.add(listener);
  if (typeof window !== "undefined") window.addEventListener("storage", listener);
  return () => {
    localeListeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", listener);
  };
}

function getLocaleSnapshot(): AdminLocale {
  if (typeof window === "undefined") return "en";
  const savedLocale = window.localStorage.getItem(localeStorageKey);
  return savedLocale === "vi" ? "vi" : "en";
}

function getServerLocaleSnapshot(): AdminLocale {
  return "en";
}

function saveLocale(locale: AdminLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localeStorageKey, locale);
  localeListeners.forEach((listener) => listener());
}

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, getServerLocaleSnapshot);

  return (
    <AdminLanguageContext.Provider value={{ locale, messages: adminMessages[locale], setLocale: saveLocale }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  return useContext(AdminLanguageContext);
}