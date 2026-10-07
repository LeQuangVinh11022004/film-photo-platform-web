"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Aperture, Bug, CalendarDays, Camera, ChartNoAxesCombined, CreditCard, LayoutDashboard, MessageSquareWarning, Package, Settings2, UsersRound, type LucideIcon } from "lucide-react";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { useProviderLanguage } from "../providers/ProviderLanguageProvider";

const iconByPath: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/admin/dashboard": LayoutDashboard,
  "/moderator/dashboard": LayoutDashboard,
  "/users": UsersRound,
  "/transactions": CreditCard,
  "/disputes": MessageSquareWarning,
  "/reports": ChartNoAxesCombined,
  "/errors": Bug,
  "/settings/profile": Settings2,
  "/creative-spaces": Aperture,
  "/moderator/creative-spaces": Aperture,
  "/equipment": Camera,
  "/moderator/equipment": Camera,
  "/reservations": CalendarDays,
  "/moderator/reservations": CalendarDays,
  "/packages": Package,
  "/moderator/packages": Package,
};

// const providerLinks = [["Dashboard", "/dashboard"], ["Creative spaces", "/creative-spaces"], ["Equipment", "/equipment"], ["Reservations", "/reservations"], ["Packages", "/packages"]];
const moderatorLinks = [["Dashboard", "/moderator/dashboard"], ["Creative spaces", "/moderator/creative-spaces"], ["Equipment", "/moderator/equipment"], ["Reservations", "/moderator/reservations"], ["Packages", "/moderator/packages"]];

export function Sidebar({ role, collapsed = false, onNavigate }: { role: "provider" | "moderator" | "admin"; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { messages: adminMessages } = useAdminLanguage();
  const { messages: providerMessages } = useProviderLanguage();
  const links = role === "admin"
    ? [
        { label: adminMessages.nav.dashboard, href: "/admin/dashboard" },
        { label: adminMessages.nav.users, href: "/users" },
        { label: adminMessages.nav.transactions, href: "/transactions" },
        { label: adminMessages.nav.disputes, href: "/disputes" },
        { label: adminMessages.nav.reports, href: "/reports" },
        { label: adminMessages.nav.settings, href: "/settings/profile" },
      ]
    : role === "provider"
      ? [
          { label: providerMessages.nav.dashboard, href: "/dashboard" },
          { label: providerMessages.nav.creativeSpaces, href: "/creative-spaces" },
          { label: providerMessages.nav.equipment, href: "/equipment" },
          { label: providerMessages.nav.reservations, href: "/reservations" },
          { label: providerMessages.nav.packages, href: "/packages" },
        ]
      : moderatorLinks.map(([label, href]) => ({ label, href }));

  return (
    <aside className={`flex h-full min-h-screen w-full flex-col bg-white px-3 py-5 ${role === "admin" ? "md:border-r md:border-slate-200" : "border-b border-stone-200 lg:border-b-0"}`}>
      <Link href="/" onClick={onNavigate} title={collapsed ? "Film Photo" : undefined} className={`flex items-center gap-3 px-2 text-slate-950 ${collapsed ? "justify-center" : ""}`}>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white"><Aperture size={19} strokeWidth={1.8} /></span>
        {!collapsed && <span className="text-sm font-semibold tracking-tight">Film Photo</span>}
      </Link>
      {!collapsed && <p className="mb-2 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{role === "admin" ? adminMessages.common.general : role === "provider" ? providerMessages.common.general : 'Workplace'}</p>}
      <nav className={`flex gap-1 overflow-x-auto ${role === "admin" ? "flex-col" : "lg:flex-col"}`}>
        {links.map(({ label, href }) => {
          const isActive = pathname === href;
          const Icon = iconByPath[href] ?? LayoutDashboard;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm transition-colors ${collapsed ? "justify-center px-0" : ""} ${isActive ? "bg-slate-100 font-semibold text-slate-950" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <Icon size={17} strokeWidth={1.8} className={isActive ? "text-slate-900" : "text-slate-500"} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>
      {role === "admin" && <>
        {!collapsed && <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{adminMessages.common.pages}</p>}
        <nav className="mt-1 flex flex-col gap-1">
          <Link href="/errors" onClick={onNavigate} aria-current={pathname.startsWith("/errors") ? "page" : undefined} title={collapsed ? adminMessages.nav.errors : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 ${collapsed ? "justify-center px-0" : ""}`}>
            <Bug size={17} strokeWidth={1.8} className="text-slate-500" />{!collapsed && adminMessages.nav.errors}
          </Link>
        </nav>
        <div className={`mt-auto border-t border-slate-200 pt-4 ${collapsed ? "flex justify-center px-0" : "px-2"}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`} title={collapsed ? adminMessages.common.account : undefined}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">AD</span>
            {!collapsed && <div><p className="text-sm font-medium text-slate-900">{adminMessages.common.account}</p><p className="text-xs text-slate-500">Film Photo</p></div>}
          </div>
        </div>
      </>}
    </aside>
  );
}
