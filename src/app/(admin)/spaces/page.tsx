"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createAdminSpace, deleteAdminSpace, listAdminSpaces, updateAdminSpace } from "@/features/admin-space/api";
import type { AdminSpace, AdminSpaceRequest } from "@/features/admin-space/types";
import { listAdminProviders } from "@/features/admin-provider/api";
import type { AdminProvider } from "@/features/admin-provider/types";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { PageHeader } from "@/shared/components/PageHeader";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import type { PagedResponse } from "@/types";

const pageSize = 20;
const fieldClassName = "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";
const blankForm: AdminSpaceRequest = { providerId: "", name: "", type: "", description: "", address: "", capacity: null, status: "INACTIVE" };

function errorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? (error.response ? "The request failed. Please try again." : "Cannot reach the backend. Check that the API is running.");
	}
	return "Something went wrong. Please try again.";
}

function statusTone(status: string) {
	return status.toUpperCase() === "ACTIVE" ? "bg-[#e5f0e8] text-[#39724b]" : "bg-[#f0f0ec] text-[#686a64]";
}

export default function AdminSpacesPage() {
	const { messages } = useAdminLanguage();
	const [result, setResult] = useState<PagedResponse<AdminSpace> | null>(null);
	const [providers, setProviders] = useState<AdminProvider[]>([]);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState("");
	const [type, setType] = useState("");
	const [providerId, setProviderId] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingSpace, setEditingSpace] = useState<AdminSpace | null>(null);
	const [pendingDeleteSpace, setPendingDeleteSpace] = useState<AdminSpace | null>(null);
	const [deletingSpace, setDeletingSpace] = useState(false);
	const [form, setForm] = useState<AdminSpaceRequest>(blankForm);

	useEffect(() => {
		let cancelled = false;
		listAdminProviders({ page: 1, pageSize: 100 })
			.then((data) => { if (!cancelled) setProviders(data.items); })
			.catch((requestError: unknown) => { if (!cancelled) setError(errorMessage(requestError)); });
		return () => { cancelled = true; };
	}, []);

	useEffect(() => {
		let cancelled = false;
		listAdminSpaces({ status: status || undefined, type: type || undefined, providerId: providerId || undefined, page, pageSize })
			.then((data) => { if (!cancelled) { setResult(data); setError(""); } })
			.catch((requestError: unknown) => { if (!cancelled) setError(errorMessage(requestError)); })
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [page, providerId, status, type]);

	function startCreate() {
		setEditingSpace(null);
		setForm({ ...blankForm, providerId: providers[0]?.providerId ?? "" });
		setModalOpen(true);
	}

	function startEdit(space: AdminSpace) {
		setEditingSpace(space);
		setForm({ providerId: space.providerId, name: space.name, type: space.type, description: space.description, address: space.address, capacity: space.capacity, status: space.status.toUpperCase() === "ACTIVE" ? "ACTIVE" : "INACTIVE" });
		setModalOpen(true);
	}

	async function refresh() {
		const data = await listAdminSpaces({ status: status || undefined, type: type || undefined, providerId: providerId || undefined, page, pageSize });
		setResult(data);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setError("");
		try {
			if (editingSpace) await updateAdminSpace(editingSpace.spaceId, form);
			else await createAdminSpace(form);
			setModalOpen(false);
			await refresh();
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(space: AdminSpace) {
		setPendingDeleteSpace(space);
	}

	async function confirmDeleteSpace() {
		if (!pendingDeleteSpace) return;
		setError("");
		setDeletingSpace(true);
		try {
			await deleteAdminSpace(pendingDeleteSpace.spaceId);
			setPendingDeleteSpace(null);
			if (result?.items.length === 1 && page > 1) setPage(page - 1);
			else await refresh();
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setDeletingSpace(false);
		}
	}

	function handlePageChange(nextPage: number) {
		setLoading(true);
		setPage(nextPage);
	}

	const items = result?.items ?? [];
	const displayedItems = items.filter((space) => !type || space.type.toLowerCase().includes(type.trim().toLowerCase()));
	const setField = <K extends keyof AdminSpaceRequest>(key: K, value: AdminSpaceRequest[K]) => setForm((current) => ({ ...current, [key]: value }));

	return (
		<div className="mx-auto max-w-375">
			<PageHeader eyebrow="Admin workspace" title="Creative spaces" description="Review and manage provider space listings." />
			<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="grid gap-2 sm:grid-cols-3">
					<input aria-label="Filter by space type" value={type} onChange={(event) => { setLoading(true); setType(event.target.value); setPage(1); }} placeholder="Filter by type" className={fieldClassName} />
					<select aria-label="Filter by status" value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value); setPage(1); }} className={fieldClassName}>
						<option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
					</select>
					<select aria-label="Filter by provider" value={providerId} onChange={(event) => { setLoading(true); setProviderId(event.target.value); setPage(1); }} className={fieldClassName}>
						<option value="">All providers</option>{providers.map((provider) => <option key={provider.providerId} value={provider.providerId}>{provider.businessName || provider.email}</option>)}
					</select>
				</div>
				<button type="button" onClick={startCreate} disabled={!providers.length} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} />Add space</button>
			</div>
			{error && <p role="alert" className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">{error}</p>}
			<section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex items-center justify-between gap-3 border-b border-[#e8e8e2] px-4 py-3 sm:px-5"><h2 className="text-sm font-semibold text-[#20221f]">Space listings</h2><span className="text-xs text-[#777973]">{result?.totalItems ?? 0} total</span></div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-220 border-collapse text-left">
						<thead className="bg-[#f8f8f5] text-xs font-semibold uppercase text-[#777973]"><tr><th className="px-5 py-3">Space</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
						<tbody className="divide-y divide-[#eeeeea]">
							{loading ? <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#777973]">Loading spaces…</td></tr> : displayedItems.map((space) => (
								<tr key={space.spaceId} className="hover:bg-[#fcfcfa]"><td className="max-w-56 px-5 py-3.5"><p className="truncate text-sm font-semibold text-[#292b27]">{space.name}</p><p className="mt-0.5 truncate text-xs text-[#777973]">{space.spaceId}</p></td><td className="px-4 py-3.5 text-sm text-[#4c4e48]">{space.providerBusinessName || space.providerId}</td><td className="px-4 py-3.5 text-sm text-[#686a64]">{space.type}</td><td className="max-w-60 truncate px-4 py-3.5 text-sm text-[#686a64]">{space.address}</td><td className="px-4 py-3.5 text-sm text-[#686a64]">{space.capacity ?? "—"}</td><td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(space.status)}`}>{space.status}</span></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button type="button" title="Edit space" aria-label={`Edit ${space.name}`} onClick={() => startEdit(space)} className="flex h-9 w-9 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]"><Pencil size={16} /></button><button type="button" title="Delete space" aria-label={`Delete ${space.name}`} onClick={() => void handleDelete(space)} className="flex h-9 w-9 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]"><Trash2 size={16} /></button></div></td></tr>
							))}
							{!loading && displayedItems.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#777973]">No spaces found for these filters.</td></tr>}
						</tbody>
					</table>
				</div>
				<AdminPagination page={page} pageSize={pageSize} total={result?.totalItems ?? 0} onPageChange={handlePageChange} messages={messages.common} />
			</section>

			{modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="admin-space-form-title" className="my-auto w-full max-w-xl rounded-lg border border-[#e0e0da] bg-white shadow-xl"><div className="flex items-center justify-between border-b border-[#e8e8e2] px-5 py-4"><h2 id="admin-space-form-title" className="text-lg font-semibold text-[#20221f]">{editingSpace ? "Edit space" : "Add space"}</h2><button type="button" onClick={() => setModalOpen(false)} aria-label="Close form" className="flex h-8 w-8 items-center justify-center rounded-md text-[#686a64] hover:bg-[#f0f0ec]"><X size={18} /></button></div><form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
				<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">Provider<select required value={form.providerId} onChange={(event) => setField("providerId", event.target.value)} className={fieldClassName}><option value="" disabled>Select provider</option>{providers.map((provider) => <option key={provider.providerId} value={provider.providerId}>{provider.businessName || provider.email}</option>)}</select></label>
				<label className="grid gap-1.5 text-sm font-medium text-[#454741]">Name<input required maxLength={200} value={form.name} onChange={(event) => setField("name", event.target.value)} className={fieldClassName} /></label>
				<label className="grid gap-1.5 text-sm font-medium text-[#454741]">Type<input required maxLength={50} value={form.type} onChange={(event) => setField("type", event.target.value)} className={fieldClassName} /></label>
				<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">Address<input required maxLength={500} value={form.address} onChange={(event) => setField("address", event.target.value)} className={fieldClassName} /></label>
				<label className="grid gap-1.5 text-sm font-medium text-[#454741]">Capacity<input type="number" min="1" value={form.capacity ?? ""} onChange={(event) => setField("capacity", event.target.value === "" ? null : Number(event.target.value))} className={fieldClassName} /></label>
				<label className="grid gap-1.5 text-sm font-medium text-[#454741]">Status<select value={form.status} onChange={(event) => setField("status", event.target.value as AdminSpaceRequest["status"])} className={fieldClassName}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
				<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">Description<textarea rows={3} maxLength={1000} value={form.description ?? ""} onChange={(event) => setField("description", event.target.value)} className="rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15" /></label>
				<div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4 sm:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="h-10 rounded-md border border-[#d8d8d1] px-4 text-sm font-semibold text-[#454741] hover:bg-[#f7f7f3]">Cancel</button><button type="submit" disabled={saving} className="h-10 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">{saving ? "Saving…" : editingSpace ? "Save changes" : "Create space"}</button></div>
				</form></section></div>}
			{pendingDeleteSpace && <ConfirmDeleteDialog title="Delete this space?" description={`“${pendingDeleteSpace.name}” will be permanently deleted. This action cannot be undone.`} confirming={deletingSpace} error={error || undefined} onCancel={() => { if (!deletingSpace) { setPendingDeleteSpace(null); setError(""); } }} onConfirm={() => void confirmDeleteSpace()} />}
		</div>
	);
}
