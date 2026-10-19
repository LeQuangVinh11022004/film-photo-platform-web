"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Aperture, Bug, Building2, CalendarDays, Camera, ChartNoAxesCombined, ClipboardCheck, CreditCard, LayoutDashboard, MessageSquareWarning, Package, Settings2, UsersRound, type LucideIcon } from "lucide-react";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { useAdminProfile } from "@/shared/providers/AdminProfileProvider";
import { useProviderLanguage } from "../providers/ProviderLanguageProvider";

const iconByPath: Record<string, LucideIcon> = {
  "/admin/dashboard": LayoutDashboard,
  "/moderator/dashboard": LayoutDashboard,
  "/users": UsersRound,
  "/providers": Building2,
  "/spaces": Building2,
  "/content": ClipboardCheck,
  "/transactions": CreditCard,
  "/disputes": MessageSquareWarning,
  "/reports": ChartNoAxesCombined,
  "/errors": Bug,
  "/settings/profile": Settings2,

  "/provider/dashboard": LayoutDashboard,
  "/provider/creative-spaces": Aperture,
  "/provider/equipment": Camera,
  "/provider/reservations": CalendarDays,
  "/provider/packages": Package,
  "/provider/transaction": CreditCard,
  "/provider/rating-feedback": MessageSquareWarning,
  "/provider/pricing-policy": Settings2,

  "/moderator/creative-spaces": Aperture,
  "/moderator/equipment": Camera,
  "/moderator/reservations": CalendarDays,
  "/moderator/packages": Package,
};

// const providerLinks = [["Dashboard", "/provider/dashboard"], ["Creative spaces", "/provider/creative-spaces"], ["Equipment", "/provider/equipment"], ["Reservations", "/provider/reservations"], ["Packages", "/provider/packages"], ["Transactions", "/provider/transaction"], ["Rating & Feedback", "/provider/rating-feedback"], ["Pricing Policy", "/provider/pricing-policy"]];
const moderatorLinks = [["Dashboard", "/moderator/dashboard"], ["Creative spaces", "/moderator/creative-spaces"], ["Equipment", "/moderator/equipment"], ["Reservations", "/moderator/reservations"], ["Packages", "/moderator/packages"]];

export function Sidebar({ role, collapsed = false, onNavigate }: { role: "provider" | "moderator" | "admin"; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { messages: adminMessages } = useAdminLanguage();
  const { displayName } = useAdminProfile();
  const { messages: providerMessages } = useProviderLanguage();
  const adminInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const links = role === "admin"
    ? [
        { label: adminMessages.nav.dashboard, href: "/admin/dashboard" },
        { label: adminMessages.nav.users, href: "/users" },
        { label: adminMessages.nav.providers, href: "/providers" },
        { label: adminMessages.nav.spaces, href: "/spaces" },
        { label: adminMessages.nav.content, href: "/content" },
        { label: adminMessages.nav.transactions, href: "/transactions" },
        { label: adminMessages.nav.disputes, href: "/disputes" },
        { label: adminMessages.nav.reports, href: "/reports" },
        { label: adminMessages.nav.settings, href: "/settings/profile" },
      ]
    : role === "provider"
      ? [
          { label: providerMessages.nav.dashboard, href: "/provider/dashboard" },
          { label: providerMessages.nav.creativeSpaces, href: "/provider/creative-spaces" },
          { label: providerMessages.nav.equipment, href: "/provider/equipment" },
          { label: providerMessages.nav.reservations, href: "/provider/reservations" },
          { label: providerMessages.nav.packages, href: "/provider/packages" },
          { label: providerMessages.nav.transactions, href: "/provider/transaction" },
          { label: providerMessages.nav.ratingFeedback, href: "/provider/rating-feedback" },
          { label: providerMessages.nav.pricingPolicy, href: "/provider/pricing-policy" },
        ]
      : moderatorLinks.map(([label, href]) => ({ label, href }));

  return (
    <aside className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-white px-3 py-5 ${role === "admin" ? "md:border-r md:border-slate-200" : "border-b border-stone-200 lg:border-b-0"}`}>
      <Link href="/" onClick={onNavigate} title={collapsed ? "Film Photo" : undefined} className={`flex items-center gap-3 px-2 text-slate-950 ${collapsed ? "justify-center" : ""}`}>
        <Image src="/images/auth/logo.jpg" alt="" width={500} height={500} className="h-11 w-11 shrink-0 rounded-md object-contain" />
        {!collapsed && <span className="text-sm font-semibold tracking-tight">Film Photo</span>}
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!collapsed && <p className="mb-2 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{role === "admin" ? adminMessages.common.general : role === "provider" ? providerMessages.common.general : 'Workplace'}</p>}
        <nav className="flex flex-col gap-1 overflow-x-auto">
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
        </>}
      </div>
      {role === "admin" && <div className={`shrink-0 border-t border-slate-200 pt-4 ${collapsed ? "flex justify-center px-0" : "px-2"}`}>
          <Link href="/settings/profile" onClick={onNavigate} aria-label={`${displayName}, ${adminMessages.settings.adminRole}`} title={collapsed ? `${displayName} · ${adminMessages.settings.adminRole}` : undefined} className={`flex items-center gap-3 transition-colors ${collapsed ? "justify-center" : "rounded-lg bg-slate-50 p-3 hover:bg-slate-100"}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{adminInitials || "AD"}</span>
            {!collapsed && <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-slate-900">{displayName}</span><Settings2 size={14} className="shrink-0 text-slate-500" /></span>
              <span className="mt-0.5 block text-xs text-slate-600">{adminMessages.settings.adminRole}</span>
              <span className="mt-2 block rounded bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{adminMessages.common.adminWorkspace}</span>
            </span>}
          </Link>
      </div>}
    </aside>
  );
}
