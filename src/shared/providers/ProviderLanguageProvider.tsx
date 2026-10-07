"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { providerMessages, type ProviderLocale, type ProviderMessages } from "@/shared/i18n/providerMessages";

type ProviderLanguageContextValue = {
  locale: ProviderLocale;
  messages: ProviderMessages;
  setLocale: (locale: ProviderLocale) => void;
};

const defaultContext: ProviderLanguageContextValue = {
  locale: "en",
  messages: providerMessages.en,
  setLocale: () => undefined,
};

const ProviderLanguageContext = createContext<ProviderLanguageContextValue>(defaultContext);
const localeStorageKey = "film-photo-provider-language";
const localeListeners = new Set<() => void>();

function subscribeToLocale(listener: () => void) {
  localeListeners.add(listener);
  if (typeof window !== "undefined") window.addEventListener("storage", listener);
  return () => {
    localeListeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", listener);
  };
}

function getLocaleSnapshot(): ProviderLocale {
  if (typeof window === "undefined") return "en";
  const savedLocale = window.localStorage.getItem(localeStorageKey);
  return savedLocale === "vi" ? "vi" : "en";
}

function getServerLocaleSnapshot(): ProviderLocale {
  return "en";
}

function saveLocale(locale: ProviderLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localeStorageKey, locale);
  localeListeners.forEach((listener) => listener());
}

export function ProviderLanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, getServerLocaleSnapshot);

  return (
    <ProviderLanguageContext.Provider value={{ locale, messages: providerMessages[locale], setLocale: saveLocale }}>
      {children}
    </ProviderLanguageContext.Provider>
  );
}

export function useProviderLanguage() {
  return useContext(ProviderLanguageContext);
}
