"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { PageHeader } from "@/shared/components/PageHeader";
import { listAdminProviders, updateAdminProviderApproval } from "@/features/admin-provider/api";
import type { AdminProvider, AdminProviderApprovalStatus } from "@/features/admin-provider/types";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import type { PagedResponse } from "@/types";

const pageSize = 20;
const fieldClassName = "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function errorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? (error.response ? "The request failed. Please try again." : "Cannot reach the backend. Check that the API is running.");
	}
	return "Something went wrong. Please try again.";
}

function approvalLabel(status: string) {
	return status.toLowerCase().replace(/(^|_)([a-z])/g, (_, separator: string, letter: string) => `${separator ? " " : ""}${letter.toUpperCase()}`);
}

function statusTone(status: string) {
	const normalized = status.toUpperCase();
	if (normalized === "APPROVED") return "bg-[#e5f0e8] text-[#39724b]";
	if (normalized === "REJECTED") return "bg-[#f5e4e1] text-[#a34d42]";
	return "bg-[#f8edd9] text-[#93651e]";
}

export default function ProvidersPage() {
	const { messages } = useAdminLanguage();
	const [result, setResult] = useState<PagedResponse<AdminProvider> | null>(null);
	const [page, setPage] = useState(1);
	const [approvalStatus, setApprovalStatus] = useState("");
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		listAdminProviders({ approvalStatus: approvalStatus || undefined, page, pageSize })
			.then((data) => { if (!cancelled) { setResult(data); setError(""); } })
			.catch((requestError: unknown) => { if (!cancelled) setError(errorMessage(requestError)); })
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [approvalStatus, page]);

	const items = (result?.items ?? []).filter((provider) =>
		`${provider.businessName} ${provider.email} ${provider.address}`.toLowerCase().includes(query.trim().toLowerCase()),
	);

	async function changeApproval(provider: AdminProvider, status: AdminProviderApprovalStatus) {
		setUpdatingId(provider.providerId);
		setError("");
		try {
			const updated = await updateAdminProviderApproval(provider.providerId, status);
			setResult((current) => current ? {
				...current,
				items: current.items.map((item) => item.providerId === updated.providerId ? updated : item),
			} : current);
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setUpdatingId(null);
		}
	}

	return (
		<div className="mx-auto max-w-375">
			<PageHeader eyebrow={messages.common.adminWorkspace} title={messages.nav.providers} description="Review provider accounts and update their approval status." />
			{error && <p role="alert" className="mt-4 rounded-md border border-[#f0d3cf] bg-[#fdf1ef] px-4 py-3 text-sm text-[#7d372f]">{error}</p>}
			<section className="mt-5 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
					<div><h2 className="text-base font-semibold text-[#20221f]">{messages.nav.providers}</h2><p className="mt-1 text-sm text-[#777973]">{result?.totalItems ?? 0} providers</p></div>
					<div className="grid gap-2 sm:grid-cols-2">
						<label className="sr-only" htmlFor="provider-search">{messages.common.search}</label>
						<input id="provider-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, address" className={fieldClassName} />
						<label className="sr-only" htmlFor="provider-status">Approval status</label>
						<select id="provider-status" value={approvalStatus} onChange={(event) => { setLoading(true); setError(""); setApprovalStatus(event.target.value); setPage(1); }} className={fieldClassName}>
							<option value="">All approval statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option>
						</select>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-220 border-collapse text-left">
						<thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]"><tr><th className="px-5 py-3">Business</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Approval</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
						<tbody className="divide-y divide-[#eeeeea]">
							{items.map((provider) => <tr key={provider.providerId} className="hover:bg-[#fcfcfa]">
								<td className="px-5 py-3.5"><p className="text-sm font-semibold text-[#292b27]">{provider.businessName}</p><p className="mt-1 max-w-sm text-xs text-[#777973]">{provider.description}</p></td>
								<td className="px-4 py-3.5 text-sm text-[#4c4e48]"><a href={`mailto:${provider.email}`} className="hover:underline">{provider.email}</a><p className="mt-1 text-xs text-[#777973]">{provider.phone}</p></td>
								<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{provider.address}</td>
								<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{approvalLabel(provider.accountStatus)}</td>
								<td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(provider.approvalStatus)}`}>{approvalLabel(provider.approvalStatus)}</span></td>
								<td className="px-5 py-3.5"><div className="flex justify-end gap-2">{provider.approvalStatus.toUpperCase() !== "APPROVED" && <button type="button" disabled={updatingId === provider.providerId} onClick={() => void changeApproval(provider, "APPROVED")} aria-label="Approve provider" title="Approve provider" className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e5f0e8] text-[#39724b] disabled:opacity-50"><Check size={16} /></button>}{provider.approvalStatus.toUpperCase() !== "REJECTED" && <button type="button" disabled={updatingId === provider.providerId} onClick={() => void changeApproval(provider, "REJECTED")} aria-label="Reject provider" title="Reject provider" className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f5e4e1] text-[#a34d42] disabled:opacity-50"><X size={16} /></button>}</div></td>
							</tr>)}
							{loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">{messages.common.loading}</td></tr>}
							{!loading && items.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">No providers found.</td></tr>}
						</tbody>
					</table>
				</div>
				<AdminPagination page={page} pageSize={pageSize} total={result?.totalItems ?? 0} onPageChange={(nextPage) => { setLoading(true); setError(""); setPage(nextPage); }} messages={messages.common} />
			</section>
		</div>
	);
}
