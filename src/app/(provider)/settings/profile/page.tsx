"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Moon, Palette, Shield, Sun, UserRound } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { createMyProviderProfile, getMyProviderProfile, updateMyProviderProfile } from "@/features/provider-profile/api";
import type { ProviderProfileRequest } from "@/features/provider-profile/types";
import { useProviderProfile } from "@/shared/providers/ProviderProfileProvider";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";
import { useProviderTheme } from "@/shared/layouts/ProviderWorkspaceShell";
import { useAuthStore } from "@/store/authStore";

const fieldClassName = "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";
const blankProfile: ProviderProfileRequest = { businessName: "", description: "", address: "", phone: "" };

type ProviderSettingsTab = "profile" | "appearance" | "account";

function errorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? (error.response ? "The request failed. Please try again." : "Cannot reach the backend. Check that the API is running.");
	}
	return "Something went wrong. Please try again.";
}

function ProviderProfileContent() {
	const searchParams = useSearchParams();
	const initialTab = (searchParams.get("tab") as ProviderSettingsTab) || "profile";
	const [activeTab, setActiveTab] = useState<ProviderSettingsTab>(
		initialTab === "appearance" || initialTab === "account" ? initialTab : "profile"
	);

	useEffect(() => {
		const tab = searchParams.get("tab") as ProviderSettingsTab;
		if (tab === "profile" || tab === "appearance" || tab === "account") {
			setActiveTab(tab);
		}
	}, [searchParams]);

	const { setDisplayName } = useProviderProfile();
	const { messages, locale, setLocale } = useProviderLanguage();
	const { theme, setTheme } = useProviderTheme();
	const t = messages.settings;

	const accountEmail = useAuthStore((state) => state.user?.email ?? "");
	const userRole = useAuthStore((state) => state.user?.role ?? "provider");
	const [form, setForm] = useState<ProviderProfileRequest>(blankProfile);
	const [email, setEmail] = useState("");
	const [approvalStatus, setApprovalStatus] = useState("");
	const [profileExists, setProfileExists] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		let cancelled = false;
		getMyProviderProfile()
			.then((profile) => {
				if (cancelled) return;
				setForm({ businessName: profile.businessName, description: profile.description, address: profile.address, phone: profile.phone });
				setEmail(profile.email);
				setApprovalStatus(profile.approvalStatus);
				setProfileExists(true);
				setDisplayName(profile.businessName);
			})
			.catch((requestError: unknown) => {
				if (cancelled) return;
				if (axios.isAxiosError(requestError) && requestError.response?.status === 404) setError("");
				else setError(errorMessage(requestError));
			})
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [setDisplayName]);

	function setField<K extends keyof ProviderProfileRequest>(key: K, value: ProviderProfileRequest[K]) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");
		try {
			const profile = profileExists ? await updateMyProviderProfile(form) : await createMyProviderProfile(form);
			setForm({ businessName: profile.businessName, description: profile.description, address: profile.address, phone: profile.phone });
			setEmail(profile.email);
			setApprovalStatus(profile.approvalStatus);
			setProfileExists(true);
			setDisplayName(profile.businessName);
			setSuccess(messages.common.savedOnDevice);
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setSaving(false);
		}
	}

	const tabs = [
		{ key: "profile" as const, label: t.sections.profile, icon: UserRound },
		{ key: "appearance" as const, label: t.sections.appearance, icon: Palette },
		{ key: "account" as const, label: t.sections.account, icon: Shield },
	];

	return (
		<div className="mx-auto max-w-4xl">
			<PageHeader
				eyebrow={messages.common.providerWorkspace}
				title={t.title}
				description={t.description}
			/>

			{/* Settings Tabs */}
			<nav aria-label={t.title} className="mt-5 mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
				{tabs.map(({ key, label, icon: Icon }) => (
					<button
						key={key}
						type="button"
						onClick={() => setActiveTab(key)}
						className={`flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === key
								? "border-slate-300 bg-slate-100 text-slate-950 font-semibold"
								: "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
						}`}
					>
						<Icon size={16} strokeWidth={1.8} className="shrink-0" />
						<span>{label}</span>
					</button>
				))}
			</nav>

			{/* Profile Tab */}
			{activeTab === "profile" && (
				<section className="overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e2] px-5 py-4">
						<div>
							<h2 className="text-base font-semibold text-[#20221f]">{t.businessProfile}</h2>
							<p className="mt-1 text-sm text-[#777973]">{t.businessProfileDesc}</p>
						</div>
						{approvalStatus && (
							<span className="rounded-full bg-[#f0f0ec] px-3 py-1 text-xs font-semibold text-[#555750]">
								{approvalStatus}
							</span>
						)}
					</div>
					{loading ? (
						<p className="px-5 py-12 text-center text-sm text-[#777973]">{messages.common.loading}</p>
					) : (
						<form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:grid-cols-2">
							{error && <p role="alert" className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339] sm:col-span-2">{error}</p>}
							{success && <p role="status" className="rounded-md border border-[#c9dfcd] bg-[#eef6ef] px-4 py-3 text-sm text-[#39724b] sm:col-span-2">{success}</p>}
							<label className="grid gap-1.5 text-sm font-medium text-[#454741]">
								{t.displayName}
								<input required maxLength={150} value={form.businessName} onChange={(event) => setField("businessName", event.target.value)} className={fieldClassName} />
							</label>
							<label className="grid gap-1.5 text-sm font-medium text-[#454741]">
								{t.email}
								<input value={email || accountEmail} readOnly className={`${fieldClassName} bg-[#f8f8f5] text-[#777973]`} />
							</label>
							<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">
								Address
								<input required maxLength={300} value={form.address} onChange={(event) => setField("address", event.target.value)} className={fieldClassName} />
							</label>
							<label className="grid gap-1.5 text-sm font-medium text-[#454741]">
								Phone
								<input type="tel" maxLength={30} value={form.phone} onChange={(event) => setField("phone", event.target.value)} className={fieldClassName} />
							</label>
							<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">
								Description
								<textarea rows={4} maxLength={2000} value={form.description} onChange={(event) => setField("description", event.target.value)} className="w-full rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15" />
							</label>
							<div className="flex justify-end border-t border-[#eeeeea] pt-4 sm:col-span-2">
								<button type="submit" disabled={saving} className="h-10 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e] disabled:cursor-not-allowed disabled:opacity-60">
									{saving ? messages.common.loading : profileExists ? t.saveChanges : "Create profile"}
								</button>
							</div>
						</form>
					)}
				</section>
			)}

			{/* Appearance Tab */}
			{activeTab === "appearance" && (
				<section className="overflow-hidden rounded-lg border border-[#e0e0da] bg-white p-6">
					<div>
						<h2 className="text-base font-semibold text-[#20221f]">{t.sections.appearance}</h2>
						<p className="mt-1 text-sm text-[#777973]">{t.appearanceDescription}</p>
					</div>

					<div className="mt-6 max-w-xl">
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
											<span className="block text-sm font-semibold">
												{option === "light" ? t.lightTheme : t.darkTheme}
											</span>
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
									onClick={() => setLocale(language)}
									className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
										locale === language ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
									}`}
								>
									{messages.common.languages[language]}
								</button>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Account Tab */}
			{activeTab === "account" && (
				<section className="overflow-hidden rounded-lg border border-[#e0e0da] bg-white p-6">
					<div>
						<h2 className="text-base font-semibold text-[#20221f]">{t.sections.account}</h2>
						<p className="mt-1 text-sm text-[#777973]">{t.accountDescription}</p>
					</div>

					<dl className="mt-6 max-w-xl divide-y divide-slate-100 text-sm">
						<div className="flex justify-between py-3">
							<dt className="text-slate-500">{t.role}</dt>
							<dd className="font-medium text-slate-900">{t.providerRole || userRole}</dd>
						</div>
						<div className="flex justify-between py-3">
							<dt className="text-slate-500">{t.authStatus}</dt>
							<dd className="font-medium text-slate-900">{approvalStatus || t.connected}</dd>
						</div>
						<div className="flex justify-between py-3">
							<dt className="text-slate-500">{t.email}</dt>
							<dd className="font-medium text-slate-900">{email || accountEmail || t.emailUnavailable}</dd>
						</div>
					</dl>
				</section>
			)}
		</div>
	);
}

export default function ProviderProfilePage() {
	return (
		<Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading settings…</div>}>
			<ProviderProfileContent />
		</Suspense>
	);
}
