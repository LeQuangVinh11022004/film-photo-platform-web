"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Bell, Monitor, Palette, Shield, UserRound } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { useAdminProfile } from "@/shared/providers/AdminProfileProvider";
import type { AdminLocale } from "@/shared/i18n/adminMessages";
import { useAuthStore } from "@/store/authStore";

export type SettingsSection = "profile" | "account" | "appearance" | "notifications" | "display";

const sectionIcons = {
  profile: UserRound,
  account: Shield,
  appearance: Palette,
  notifications: Bell,
  display: Monitor,
};

const inputClassName = "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export function AdminSettingsPage({ section }: { section: SettingsSection }) {
  const { locale, messages, setLocale } = useAdminLanguage();
  const t = messages.settings;
  const { displayName, setDisplayName } = useAdminProfile();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const [saved, setSaved] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [notifications, setNotifications] = useState({ bookings: true, security: true, reviews: false });
  const sectionNames = t.sections;
  const sectionItems: { key: SettingsSection; label: string; icon: typeof UserRound }[] = [
    { key: "profile", label: sectionNames.profile, icon: sectionIcons.profile },
    { key: "account", label: sectionNames.account, icon: sectionIcons.account },
    { key: "appearance", label: sectionNames.appearance, icon: sectionIcons.appearance },
    { key: "notifications", label: sectionNames.notifications, icon: sectionIcons.notifications },
    { key: "display", label: sectionNames.display, icon: sectionIcons.display },
  ];

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = displayName.trim();
    if (!nextName) return;
    setDisplayName(nextName);
    if (token && user) setSession(token, { ...user, name: nextName });
    setSaved(true);
  }

  function chooseLanguage(nextLocale: AdminLocale) {
    setLocale(nextLocale);
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="mx-auto max-w-375">
      <PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} />
      <nav aria-label={t.title} className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 pb-2">
        {sectionItems.map(({ key, label, icon: Icon }) => (
          <Link key={key} href={`/settings/${key}`} aria-current={section === key ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${section === key ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
            <Icon size={16} strokeWidth={1.8} />{label}
          </Link>
        ))}
      </nav>

      {section === "profile" && (
        <SettingsPanel title={sectionNames.profile} description={t.profileDescription}>
          <form onSubmit={saveProfile} className="max-w-xl space-y-5">
            <label className="block text-sm font-medium text-slate-700">{t.displayName}<input required value={displayName} onChange={(event) => { setDisplayName(event.target.value); setSaved(false); }} className={`${inputClassName} mt-2`} /></label>
            <label className="block text-sm font-medium text-slate-700">{t.email}<input value={user?.email ?? t.emailUnavailable} readOnly className={`${inputClassName} mt-2 bg-slate-50 text-slate-500`} /></label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800">{t.saveChanges}</button>
              {saved && <p role="status" className="text-sm text-emerald-700">{t.savedLocally}</p>}
            </div>
          </form>
        </SettingsPanel>
      )}

      {section === "account" && (
        <SettingsPanel title={sectionNames.account} description={t.accountDescription}>
          <dl className="max-w-xl divide-y divide-slate-100 text-sm">
            <SettingsRow label={t.role} value={user?.role ?? t.adminRole} />
            <SettingsRow label={t.authStatus} value={t.notConnected} />
            <SettingsRow label={t.email} value={user?.email ?? t.emailUnavailable} />
          </dl>
        </SettingsPanel>
      )}

      {section === "appearance" && (
        <SettingsPanel title={sectionNames.appearance} description={t.appearanceDescription}>
          <div className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-slate-800">{t.language}</p>
            <div role="group" aria-label={t.language} className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
              {(["en", "vi"] as const).map((language) => <button key={language} type="button" lang={language} aria-pressed={locale === language} onClick={() => chooseLanguage(language)} className={`rounded px-4 py-2 text-sm font-medium transition-colors ${locale === language ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}>{messages.common.languages[language]}</button>)}
            </div>
          </div>
        </SettingsPanel>
      )}

      {section === "notifications" && (
        <SettingsPanel title={sectionNames.notifications} description={t.notificationsDescription}>
          <div className="max-w-xl divide-y divide-slate-100">
            <NotificationToggle label={t.bookingNotifications} checked={notifications.bookings} onChange={() => toggleNotification("bookings")} />
            <NotificationToggle label={t.securityNotifications} checked={notifications.security} onChange={() => toggleNotification("security")} />
            <NotificationToggle label={t.reviewNotifications} checked={notifications.reviews} onChange={() => toggleNotification("reviews")} />
          </div>
        </SettingsPanel>
      )}

      {section === "display" && (
        <SettingsPanel title={sectionNames.display} description={t.displayDescription}>
          <div className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-slate-800">{t.density}</p>
            <div role="group" aria-label={t.density} className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
              {(["comfortable", "compact"] as const).map((option) => <button key={option} type="button" aria-pressed={density === option} onClick={() => setDensity(option)} className={`rounded px-4 py-2 text-sm font-medium transition-colors ${density === option ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}>{option === "comfortable" ? t.comfortable : t.compact}</button>)}
            </div>
          </div>
        </SettingsPanel>
      )}
    </div>
  );
}

function SettingsPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="rounded-lg border border-slate-200 bg-white"><header className="border-b border-slate-200 px-5 py-4"><h2 className="text-base font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></header><div className="p-5">{children}</div></section>;
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-4 py-4"><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-900">{value}</dd></div>;
}

function NotificationToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-3 text-sm font-medium text-slate-800"><span>{label}</span><input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-slate-900" /></label>;
}