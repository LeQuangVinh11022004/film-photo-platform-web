"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { PageHeader } from "@/shared/components/PageHeader";
import { createMyProviderProfile, getMyProviderProfile, updateMyProviderProfile } from "@/features/provider-profile/api";
import type { ProviderProfileRequest } from "@/features/provider-profile/types";
import { useProviderProfile } from "@/shared/providers/ProviderProfileProvider";
import { useAuthStore } from "@/store/authStore";

const fieldClassName = "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";
const blankProfile: ProviderProfileRequest = { businessName: "", description: "", address: "", phone: "" };

function errorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? (error.response ? "The request failed. Please try again." : "Cannot reach the backend. Check that the API is running.");
	}
	return "Something went wrong. Please try again.";
}

export default function ProviderProfilePage() {
	const { setDisplayName } = useProviderProfile();
	const accountEmail = useAuthStore((state) => state.user?.email ?? "");
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
			setSuccess("Provider profile saved.");
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="mx-auto max-w-4xl">
			<PageHeader eyebrow="Provider workspace" title="Business profile" description="Manage the provider details connected to your account." />
			<section className="mt-5 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e2] px-5 py-4"><div><h2 className="text-base font-semibold text-[#20221f]">Provider details</h2><p className="mt-1 text-sm text-[#777973]">Your approval status controls whether spaces can be activated.</p></div>{approvalStatus && <span className="rounded-full bg-[#f0f0ec] px-3 py-1 text-xs font-semibold text-[#555750]">{approvalStatus}</span>}</div>
				{loading ? <p className="px-5 py-12 text-center text-sm text-[#777973]">Loading profile…</p> : <form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:grid-cols-2">
					{error && <p role="alert" className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339] sm:col-span-2">{error}</p>}
					{success && <p role="status" className="rounded-md border border-[#c9dfcd] bg-[#eef6ef] px-4 py-3 text-sm text-[#39724b] sm:col-span-2">{success}</p>}
					<label className="grid gap-1.5 text-sm font-medium text-[#454741]">Business name<input required maxLength={150} value={form.businessName} onChange={(event) => setField("businessName", event.target.value)} className={fieldClassName} /></label>
					<label className="grid gap-1.5 text-sm font-medium text-[#454741]">Account email<input value={email || accountEmail} readOnly className={`${fieldClassName} bg-[#f8f8f5] text-[#777973]`} /></label>
					<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">Address<input required maxLength={300} value={form.address} onChange={(event) => setField("address", event.target.value)} className={fieldClassName} /></label>
					<label className="grid gap-1.5 text-sm font-medium text-[#454741]">Phone<input type="tel" maxLength={30} value={form.phone} onChange={(event) => setField("phone", event.target.value)} className={fieldClassName} /></label>
					<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">Description<textarea rows={4} maxLength={2000} value={form.description} onChange={(event) => setField("description", event.target.value)} className="w-full rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15" /></label>
					<div className="flex justify-end border-t border-[#eeeeea] pt-4 sm:col-span-2"><button type="submit" disabled={saving} className="h-10 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : profileExists ? "Save profile" : "Create profile"}</button></div>
				</form>}
			</section>
		</div>
	);
}
