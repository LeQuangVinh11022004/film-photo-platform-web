"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Moon, Palette, Shield, Sun, UserRound } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { useAdminTheme } from "@/shared/layouts/AdminWorkspaceShell";
import { useAdminProfile } from "@/shared/providers/AdminProfileProvider";
import type { AdminLocale } from "@/shared/i18n/adminMessages";
import { useAuthStore } from "@/store/authStore";
import { showAdminToast } from "@/features/admin-notification/toast";

export type SettingsSection = "profile" | "appearance" | "account";

const sectionIcons = {
  profile: UserRound,
  appearance: Palette,
  account: Shield,
};

const inputClassName = "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

export function AdminSettingsPage({ section }: { section: SettingsSection }) {
  const { locale, messages, setLocale } = useAdminLanguage();
  const { theme, setTheme } = useAdminTheme();
  const t = messages.settings;
  const { displayName, setDisplayName } = useAdminProfile();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const [saved, setSaved] = useState(false);

  const sectionNames = t.sections;
  const sectionItems: { key: SettingsSection; label: string; icon: typeof UserRound }[] = [
    { key: "profile", label: sectionNames.profile, icon: sectionIcons.profile },
    { key: "appearance", label: sectionNames.appearance, icon: sectionIcons.appearance },
    { key: "account", label: sectionNames.account, icon: sectionIcons.account },
  ];

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = displayName.trim();
    if (!nextName) return;
    setDisplayName(nextName);
    if (token && user) setSession(token, { ...user, name: nextName });
    setSaved(true);
    showAdminToast({ title: messages.toast.profileSaved, message: messages.toast.savedOnDevice });
  }

  function chooseLanguage(nextLocale: AdminLocale) {
    setLocale(nextLocale);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} />
      <nav aria-label={t.title} className="mt-5 mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {sectionItems.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={`/settings/${key}`}
            aria-current={section === key ? "page" : undefined}
            className={`flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              section === key
                ? "border-slate-300 bg-slate-100 text-slate-950 font-semibold"
                : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Icon size={16} strokeWidth={1.8} className="shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {section === "profile" && (
        <SettingsPanel title={sectionNames.profile} description={t.profileDescription}>
          <form onSubmit={saveProfile} className="grid gap-5 sm:grid-cols-2">
            {saved && (
              <p role="status" className="rounded-md border border-[#c9dfcd] bg-[#eef6ef] px-4 py-3 text-sm text-[#39724b] sm:col-span-2">
                {t.savedLocally}
              </p>
            )}
            <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
              {t.displayName}
              <input
                required
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setSaved(false);
                }}
                className={inputClassName}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
              {t.email}
              <input value={user?.email ?? t.emailUnavailable} readOnly className={`${inputClassName} bg-[#f8f8f5] text-[#777973]`} />
            </label>
            <div className="flex justify-end border-t border-[#eeeeea] pt-4 sm:col-span-2">
              <button type="submit" className="h-10 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">
                {t.saveChanges}
              </button>
            </div>
          </form>
        </SettingsPanel>
      )}

      {section === "appearance" && (
        <SettingsPanel title={sectionNames.appearance} description={t.appearanceDescription}>
          <div className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-slate-800">{t.theme}</p>
            <div className="mb-6 grid gap-3 sm:grid-cols-2" role="group" aria-label={t.theme}>
              {(["light", "dark"] as const).map((option) => {
                const Icon = option === "light" ? Sun : Moon;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={theme === option}
                    onClick={() => setTheme(option)}
                    className={`flex min-h-20 items-center gap-3 rounded-md border p-4 text-left transition-colors ${
                      theme === option
                        ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={19} aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold">{option === "light" ? t.lightTheme : t.darkTheme}</span>
                      <span className="mt-1 block text-xs opacity-75">
                        {option === "light" ? t.lightThemeDescription : t.darkThemeDescription}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mb-3 text-sm font-medium text-slate-800">{t.language}</p>
            <div role="group" aria-label={t.language} className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
              {(["en", "vi"] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  lang={language}
                  aria-pressed={locale === language}
                  onClick={() => chooseLanguage(language)}
                  className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                    locale === language ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {messages.common.languages[language]}
                </button>
              ))}
            </div>
          </div>
        </SettingsPanel>
      )}

      {section === "account" && (
        <SettingsPanel title={sectionNames.account} description={t.accountDescription}>
          <dl className="max-w-xl divide-y divide-slate-100 text-sm">
            <SettingsRow label={t.role} value={user?.role ? t.adminRole : t.adminRole} />
            <SettingsRow label={t.authStatus} value={token ? "Connected" : t.notConnected} />
            <SettingsRow label={t.email} value={user?.email ?? t.emailUnavailable} />
          </dl>
        </SettingsPanel>
      )}
    </div>
  );
}

function SettingsPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
      <header className="border-b border-[#e8e8e2] px-5 py-4">
        <h2 className="text-base font-semibold text-[#20221f]">{title}</h2>
        <p className="mt-1 text-sm text-[#777973]">{description}</p>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
