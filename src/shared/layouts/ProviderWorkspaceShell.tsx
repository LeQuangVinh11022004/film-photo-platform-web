"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Monitor, Palette, PanelLeftClose, PanelLeftOpen, Search, Shield, UserRound } from "lucide-react";
import { Sidebar } from "@/shared/components/Sidebar";
import { ProviderLanguageProvider, useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";
import { ProviderProfileProvider, useProviderProfile } from "@/shared/providers/ProviderProfileProvider";
import type { ProviderLocale } from "@/shared/i18n/providerMessages";
import { useAuthStore } from "@/store/authStore";

function ProviderToolbar({ sidebarCollapsed, onMenuClick, onToggleSidebar }: { sidebarCollapsed: boolean; onMenuClick: () => void; onToggleSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, messages, setLocale } = useProviderLanguage();
  const { displayName } = useProviderProfile();
  const [query, setQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const clearSession = useAuthStore((state) => state.clearSession);
  const pages = [
    { label: messages.nav.dashboard, href: "/dashboard" },
    { label: messages.nav.creativeSpaces, href: "/creative-spaces" },
    { label: messages.nav.equipment, href: "/equipment" },
    { label: messages.nav.reservations, href: "/reservations" },
    { label: messages.nav.packages, href: "/packages" },
    { label: messages.nav.settings, href: "/settings/profile" },
  ];
  const settingsItems = [
    { key: "profile", label: messages.settings.sections.profile, icon: UserRound },
    { key: "account", label: messages.settings.sections.account, icon: Shield },
    { key: "appearance", label: messages.settings.sections.appearance, icon: Palette },
    { key: "notifications", label: messages.settings.sections.notifications, icon: Bell },
    { key: "display", label: messages.settings.sections.display, icon: Monitor },
  ];
  const avatarInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const matchingPages = pages.filter((page) => page.label.toLowerCase().includes(query.trim().toLowerCase()));

  function navigateToFirstMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matchingPages[0]) return;
    router.push(matchingPages[0].href);
    setQuery("");
  }

  function changeLocale(nextLocale: ProviderLocale) {
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
        <input type="search" aria-label={messages.common.search} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} placeholder={messages.common.searchPlaceholder} className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200" />
        {query && (
          <div className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            {matchingPages.length ? matchingPages.map((page) => (
              <button key={page.href} type="button" onClick={() => { router.push(page.href); setQuery(""); }} className="flex w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950">{page.label}</button>
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
      <div className="relative z-40 shrink-0" onKeyDown={(event) => { if (event.key === "Escape") setAccountMenuOpen(false); }} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setAccountMenuOpen(false); }}>
        <button type="button" aria-label={messages.common.accountMenu} aria-haspopup="menu" aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((open) => !open)} className="flex h-9 items-center gap-1.5 rounded-full p-0.5 pr-1.5 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{avatarInitials}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        {accountMenuOpen && <div role="menu" aria-label={messages.common.accountMenu} className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
          <div className="space-y-0.5 p-1.5">
            {settingsItems.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" role="menuitem" onClick={() => { router.push(`/settings/${key}`); setAccountMenuOpen(false); }} className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${pathname === `/settings/${key}` ? "bg-slate-100 font-medium text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
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

function ProviderWorkspaceContent({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { messages } = useProviderLanguage();

  return (
    <div className="min-h-screen bg-[#f3f4f6] md:flex">
      {menuOpen && <button type="button" aria-label={messages.common.closeMenu} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" />}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[86vw] transition-all duration-200 md:sticky md:top-0 md:block md:shrink-0 ${sidebarCollapsed ? "md:w-18" : "md:w-64"} ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar role="provider" collapsed={sidebarCollapsed && !menuOpen} onNavigate={() => setMenuOpen(false)} />
      </div>
      <div className="min-w-0 flex-1 p-2 sm:p-3">
        <div className="min-h-[calc(100vh-1rem)] rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <ProviderToolbar sidebarCollapsed={sidebarCollapsed} onMenuClick={() => setMenuOpen(true)} onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)} />
          <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function ProviderWorkspaceShell({ children }: { children: ReactNode }) {
  return <ProviderLanguageProvider><ProviderProfileProvider><ProviderWorkspaceContent>{children}</ProviderWorkspaceContent></ProviderProfileProvider></ProviderLanguageProvider>;
}
