"use client";

import { createContext, useContext, useState, useSyncExternalStore, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Layers3, LogOut, Menu, Monitor, Moon, Palette, PanelLeftClose, PanelLeftOpen, Search, Shield, Sun, UserRound } from "lucide-react";
import { Sidebar } from "@/shared/components/Sidebar";
import { AdminLoadingState } from "@/shared/components/AdminLoadingState";
import { AdminLanguageProvider, useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { AdminProfileProvider, useAdminProfile } from "@/shared/providers/AdminProfileProvider";
import type { AdminLocale } from "@/shared/i18n/adminMessages";
import { useAuthStore } from "@/store/authStore";
import { getServerApiLoadingSnapshot, isApiLoading, subscribeToApiLoading } from "@/services/loadingState";

export type AdminTheme = "light" | "dark";
const themeStorageKey = "film-photo-admin-theme";
const themeListeners = new Set<() => void>();

function subscribeToAdminTheme(listener: () => void) {
  themeListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getStoredAdminTheme(): AdminTheme {
  return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
}

function getServerAdminTheme(): AdminTheme {
  return "light";
}

function updateAdminTheme(theme: AdminTheme) {
  window.localStorage.setItem(themeStorageKey, theme);
  themeListeners.forEach((listener) => listener());
}

const AdminThemeContext = createContext<{ theme: AdminTheme; setTheme: (theme: AdminTheme) => void }>({ theme: "light", setTheme: () => {} });

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

function AdminToolbar({ sidebarCollapsed, theme, onMenuClick, onToggleSidebar, onToggleTheme, onNavigate }: { sidebarCollapsed: boolean; theme: AdminTheme; onMenuClick: () => void; onToggleSidebar: () => void; onToggleTheme: () => void; onNavigate: (href: string) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, messages, setLocale } = useAdminLanguage();
  const { displayName } = useAdminProfile();
  const [query, setQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const clearSession = useAuthStore((state) => state.clearSession);
  const pages = [
    { label: messages.nav.dashboard, href: "/admin/dashboard" },
    { label: messages.nav.users, href: "/users" },
    { label: messages.nav.transactions, href: "/transactions" },
    { label: messages.nav.disputes, href: "/disputes" },
    { label: messages.nav.reports, href: "/reports" },
    { label: messages.nav.errors, href: "/errors" },
    { label: messages.nav.settings, href: "/settings/profile" },
    { label: messages.settings.sections.platform, href: "/settings/platform" },
  ];
  const settingsItems = [
    { key: "profile", label: messages.settings.sections.profile, icon: UserRound },
    { key: "account", label: messages.settings.sections.account, icon: Shield },
    { key: "appearance", label: messages.settings.sections.appearance, icon: Palette },
    { key: "notifications", label: messages.settings.sections.notifications, icon: Bell },
    { key: "display", label: messages.settings.sections.display, icon: Monitor },
    { key: "platform", label: messages.settings.sections.platform, icon: Layers3 },
  ];
  const avatarInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const matchingPages = pages.filter((page) => page.label.toLowerCase().includes(query.trim().toLowerCase()));

  function navigateToFirstMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matchingPages[0]) return;
    onNavigate(matchingPages[0].href);
    setQuery("");
  }

  function changeLocale(nextLocale: AdminLocale) {
    setLocale(nextLocale);
  }

  function logout() {
    clearSession();
    setAccountMenuOpen(false);
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 rounded-t-xl border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onMenuClick} aria-label={messages.common.openMenu} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 md:hidden">
        <Menu size={19} />
      </button>
      <button type="button" onClick={onToggleSidebar} aria-label={sidebarCollapsed ? messages.common.expandSidebar : messages.common.collapseSidebar} title={sidebarCollapsed ? messages.common.expandSidebar : messages.common.collapseSidebar} className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 md:flex">
        {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
      <form onSubmit={navigateToFirstMatch} className="relative flex min-w-0 max-w-md flex-1">
        <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          aria-label={messages.common.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }}
          placeholder={messages.common.searchPlaceholder}
          className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
        />
        {query && (
          <div className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            {matchingPages.length ? matchingPages.map((page) => (
              <button key={page.href} type="button" onClick={() => { onNavigate(page.href); setQuery(""); }} className="flex w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950">{page.label}</button>
            )) : <p className="px-3 py-2 text-sm text-slate-500">{messages.common.noPagesFound}</p>}
          </div>
        )}
      </form>
      <div role="group" aria-label={messages.common.language} className="ml-auto flex shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 p-1">
        {(["en", "vi"] as const).map((language) => (
          <button key={language} type="button" lang={language} aria-pressed={locale === language} onClick={() => changeLocale(language)} className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${locale === language ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
            {language.toUpperCase()}
          </button>
        ))}
      </div>
      <button type="button" onClick={onToggleTheme} aria-label={theme === "light" ? messages.common.switchToDark : messages.common.switchToLight} title={theme === "light" ? messages.common.switchToDark : messages.common.switchToLight} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">
        {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
      </button>
      <div className="relative z-40 shrink-0" onKeyDown={(event) => { if (event.key === "Escape") setAccountMenuOpen(false); }} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setAccountMenuOpen(false); }}>
        <button type="button" aria-label={messages.common.accountMenu} aria-haspopup="menu" aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((open) => !open)} className="flex h-9 items-center gap-1.5 rounded-full p-0.5 pr-1.5 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{avatarInitials}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        {accountMenuOpen && <div role="menu" aria-label={messages.common.accountMenu} className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
          <div className="space-y-0.5 p-1.5">
            {settingsItems.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" role="menuitem" onClick={() => { onNavigate(`/settings/${key}`); setAccountMenuOpen(false); }} className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${pathname === `/settings/${key}` ? "bg-slate-100 font-medium text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
                <Icon size={16} strokeWidth={1.8} className="text-slate-500" />{label}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-200 p-1.5"><button type="button" role="menuitem" onClick={logout} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"><LogOut size={16} />{messages.common.logout}</button></div>
        </div>}
      </div>
    </header>
  );
}

function AdminWorkspaceContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const theme = useSyncExternalStore(subscribeToAdminTheme, getStoredAdminTheme, getServerAdminTheme);
  const apiLoading = useSyncExternalStore(subscribeToApiLoading, isApiLoading, getServerApiLoadingSnapshot);
  const pathname = usePathname();
  const { messages } = useAdminLanguage();
  const isNavigating = pendingPath !== null && pendingPath !== pathname;
  const isLoading = isNavigating || apiLoading;

  function navigateTo(href: string) {
    const destination = new URL(href, window.location.href);
    if (destination.origin === window.location.origin && destination.pathname !== pathname) {
      setPendingPath(destination.pathname);
    }
    router.push(destination.href);
  }

  function showLinkLoading(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download") || anchor.target === "_blank") return;
    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin === window.location.origin && destination.pathname !== pathname) {
      setPendingPath(destination.pathname);
    }
  }

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme: updateAdminTheme }}>
    <div data-admin-theme={theme} onClickCapture={showLinkLoading} className="admin-workspace min-h-screen bg-[#f3f4f6] md:flex">
      {menuOpen && <button type="button" aria-label={messages.common.closeMenu} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" />}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[86vw] transition-all duration-200 md:sticky md:top-0 md:block md:shrink-0 ${sidebarCollapsed ? "md:w-18" : "md:w-64"} ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar role="admin" collapsed={sidebarCollapsed && !menuOpen} onNavigate={() => setMenuOpen(false)} />
      </div>
      <div className="min-w-0 flex-1 p-2 sm:p-3">
        <div className="min-h-[calc(100vh-1rem)] rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <AdminToolbar sidebarCollapsed={sidebarCollapsed} theme={theme} onMenuClick={() => setMenuOpen(true)} onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)} onToggleTheme={() => updateAdminTheme(theme === "light" ? "dark" : "light")} onNavigate={navigateTo} />
          <main aria-busy={isLoading} className="relative min-w-0 p-4 sm:p-6 lg:p-8">{isLoading && <AdminLoadingState label={messages.common.loading} mode="overlay" />}{children}</main>
        </div>
      </div>
    </div>
    </AdminThemeContext.Provider>
  );
}

export function AdminWorkspaceShell({ children }: { children: ReactNode }) {
  return <AdminLanguageProvider><AdminProfileProvider><AdminWorkspaceContent>{children}</AdminWorkspaceContent></AdminProfileProvider></AdminLanguageProvider>;
}