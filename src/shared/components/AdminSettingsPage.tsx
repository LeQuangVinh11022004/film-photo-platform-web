"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Bell, Layers3, Monitor, Moon, Palette, Plus, Save, Shield, Sun, Trash2, UserRound } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { useAdminTheme } from "@/shared/layouts/AdminWorkspaceShell";
import { useAdminProfile } from "@/shared/providers/AdminProfileProvider";
import type { AdminLocale } from "@/shared/i18n/adminMessages";
import { useAuthStore } from "@/store/authStore";

export type SettingsSection = "profile" | "account" | "appearance" | "notifications" | "display" | "platform";

const sectionIcons = {
  profile: UserRound,
  account: Shield,
  appearance: Palette,
  notifications: Bell,
  display: Monitor,
  platform: Layers3,
};

const inputClassName = "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export function AdminSettingsPage({ section }: { section: SettingsSection }) {
  const { locale, messages, setLocale } = useAdminLanguage();
  const { theme, setTheme } = useAdminTheme();
  const t = messages.settings;
  const { displayName, setDisplayName } = useAdminProfile();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState<string[]>(t.defaultCategories);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [aiServices, setAiServices] = useState({ spaceMatching: true, imageReview: false });
  const [confidenceThreshold, setConfidenceThreshold] = useState(82);
  const [platformPolicies, setPlatformPolicies] = useState({ providerVerification: true, contentModeration: true, disputeWindow: true });
  const [platformSaved, setPlatformSaved] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [notifications, setNotifications] = useState({ bookings: true, security: true, reviews: false });
  const sectionNames = t.sections;
  const sectionItems: { key: SettingsSection; label: string; icon: typeof UserRound }[] = [
    { key: "profile", label: sectionNames.profile, icon: sectionIcons.profile },
    { key: "account", label: sectionNames.account, icon: sectionIcons.account },
    { key: "appearance", label: sectionNames.appearance, icon: sectionIcons.appearance },
    { key: "notifications", label: sectionNames.notifications, icon: sectionIcons.notifications },
    { key: "display", label: sectionNames.display, icon: sectionIcons.display },
    { key: "platform", label: sectionNames.platform, icon: sectionIcons.platform },
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

  function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCategory = categoryDraft.trim();
    if (!nextCategory || categories.some((category) => category.toLowerCase() === nextCategory.toLowerCase())) return;
    setCategories((current) => [...current, nextCategory]);
    setCategoryDraft("");
    setPlatformSaved(false);
  }

  function toggleAiService(key: keyof typeof aiServices) {
    setAiServices((current) => ({ ...current, [key]: !current[key] }));
    setPlatformSaved(false);
  }

  function togglePlatformPolicy(key: keyof typeof platformPolicies) {
    setPlatformPolicies((current) => ({ ...current, [key]: !current[key] }));
    setPlatformSaved(false);
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
            <p className="mb-3 text-sm font-medium text-slate-800">{t.theme}</p>
            <div className="mb-6 grid gap-3 sm:grid-cols-2" role="group" aria-label={t.theme}>
              {(["light", "dark"] as const).map((option) => {
                const Icon = option === "light" ? Sun : Moon;
                return <button key={option} type="button" aria-pressed={theme === option} onClick={() => setTheme(option)} className={`flex min-h-20 items-center gap-3 rounded-md border p-4 text-left transition-colors ${theme === option ? "border-emerald-700 bg-emerald-50 text-emerald-950" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                  <Icon size={19} aria-hidden="true" />
                  <span><span className="block text-sm font-semibold">{option === "light" ? t.lightTheme : t.darkTheme}</span><span className="mt-1 block text-xs opacity-75">{option === "light" ? t.lightThemeDescription : t.darkThemeDescription}</span></span>
                </button>;
              })}
            </div>
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

      {section === "platform" && (
        <SettingsPanel title={sectionNames.platform} description={t.platformDescription}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <p className="text-xs text-slate-500">{messages.common.sampleData}</p>
            <button type="button" onClick={() => setPlatformSaved(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"><Save size={16} />{t.savePlatform}</button>
          </div>
          <div className="grid gap-8 xl:grid-cols-2">
            <section aria-labelledby="platform-categories-title">
              <h3 id="platform-categories-title" className="text-sm font-semibold text-slate-900">{t.contentCategories}</h3>
              <p className="mt-1 text-sm text-slate-500">{t.categoriesDescription}</p>
              <form onSubmit={addCategory} className="mt-4 flex gap-2">
                <label className="sr-only" htmlFor="platform-category">{t.categoryPlaceholder}</label>
                <input id="platform-category" value={categoryDraft} onChange={(event) => { setCategoryDraft(event.target.value); setPlatformSaved(false); }} placeholder={t.categoryPlaceholder} className={`${inputClassName} min-w-0 flex-1`} />
                <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus size={16} />{t.addCategory}</button>
              </form>
              <ul className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200">
                {categories.map((category) => <li key={category} className="flex items-center justify-between gap-3 px-3 py-2.5"><span className="text-sm font-medium text-slate-700">{category}</span><button type="button" aria-label={t.removeCategory.replace("{category}", category)} title={t.removeCategory.replace("{category}", category)} onClick={() => { setCategories((current) => current.filter((item) => item !== category)); setPlatformSaved(false); }} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={15} /></button></li>)}
              </ul>
            </section>
            <section aria-labelledby="platform-ai-title">
              <h3 id="platform-ai-title" className="text-sm font-semibold text-slate-900">{t.aiServices}</h3>
              <p className="mt-1 text-sm text-slate-500">{t.aiServicesDescription}</p>
              <div className="mt-2 divide-y divide-slate-100">
                <NotificationToggle label={t.spaceMatching} checked={aiServices.spaceMatching} onChange={() => toggleAiService("spaceMatching")} />
                <NotificationToggle label={t.imageReview} checked={aiServices.imageReview} onChange={() => toggleAiService("imageReview")} />
              </div>
              <label htmlFor="image-review-threshold" className="mt-5 flex items-center justify-between gap-3 text-sm font-medium text-slate-700"><span>{t.confidenceThreshold}</span><span className="font-semibold tabular-nums">{confidenceThreshold}%</span></label>
              <input id="image-review-threshold" type="range" min="50" max="99" value={confidenceThreshold} onChange={(event) => { setConfidenceThreshold(Number(event.target.value)); setPlatformSaved(false); }} className="mt-3 w-full accent-emerald-700" />
            </section>
          </div>
          <section aria-labelledby="platform-policies-title" className="mt-8 border-t border-slate-200 pt-6">
            <h3 id="platform-policies-title" className="text-sm font-semibold text-slate-900">{t.systemPolicies}</h3>
            <div className="mt-2 divide-y divide-slate-100">
              <NotificationToggle label={t.providerVerification} checked={platformPolicies.providerVerification} onChange={() => togglePlatformPolicy("providerVerification")} />
              <NotificationToggle label={t.contentModeration} checked={platformPolicies.contentModeration} onChange={() => togglePlatformPolicy("contentModeration")} />
              <NotificationToggle label={t.disputeWindow} checked={platformPolicies.disputeWindow} onChange={() => togglePlatformPolicy("disputeWindow")} />
            </div>
          </section>
          {platformSaved && <p role="status" className="mt-4 text-sm text-emerald-700">{t.platformSaved}</p>}
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