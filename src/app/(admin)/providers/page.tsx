"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Check, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { PageHeader } from "@/shared/components/PageHeader";
import {
	createAdminProvider,
	deleteAdminProvider,
	getAdminProviderById,
	listAdminProviders,
	updateAdminProvider,
	updateAdminProviderApproval,
} from "@/features/admin-provider/api";
import type {
	AdminProvider,
	AdminProviderApprovalStatus,
	AdminProviderCreateRequest,
} from "@/features/admin-provider/types";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import type { PagedResponse } from "@/types";

const pageSize = 20;
const fieldClassName =
	"h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const blankForm: AdminProviderCreateRequest = {
	fullName: "",
	email: "",
	password: "",
	businessName: "",
	description: "",
	address: "",
	phone: "",
};

function errorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return (
			data?.message ??
			(error.response
				? "The request failed. Please try again."
				: "Cannot reach the backend. Check that the API is running.")
		);
	}
	return "Something went wrong. Please try again.";
}

function approvalLabel(status: string) {
	return status
		.toLowerCase()
		.replace(/(^|_)([a-z])/g, (_, separator: string, letter: string) => `${separator ? " " : ""}${letter.toUpperCase()}`);
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

	const [selectedProvider, setSelectedProvider] = useState<AdminProvider | null>(null);
	const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
	const [editingProvider, setEditingProvider] = useState<AdminProvider | null>(null);
	const [form, setForm] = useState<AdminProviderCreateRequest>(blankForm);
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState("");
	const [pendingDeleteProvider, setPendingDeleteProvider] = useState<AdminProvider | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		let cancelled = false;
		listAdminProviders({ approvalStatus: approvalStatus || undefined, page, pageSize })
			.then((data) => {
				if (!cancelled) {
					setResult(data);
					setError("");
				}
			})
			.catch((requestError: unknown) => {
				if (!cancelled) setError(errorMessage(requestError));
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [approvalStatus, page]);

	async function refresh() {
		const data = await listAdminProviders({ approvalStatus: approvalStatus || undefined, page, pageSize });
		setResult(data);
	}

	const items = (result?.items ?? []).filter((provider) =>
		`${provider.businessName} ${provider.email} ${provider.address}`
			.toLowerCase()
			.includes(query.trim().toLowerCase()),
	);

	async function changeApproval(provider: AdminProvider, status: AdminProviderApprovalStatus) {
		setUpdatingId(provider.providerId);
		setError("");
		try {
			const updated = await updateAdminProviderApproval(provider.providerId, status);
			setResult((current) =>
				current
					? {
							...current,
							items: current.items.map((item) => (item.providerId === updated.providerId ? updated : item)),
						}
					: current,
			);
			if (selectedProvider?.providerId === updated.providerId) {
				setSelectedProvider(updated);
			}
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setUpdatingId(null);
		}
	}

	async function viewDetails(provider: AdminProvider) {
		setError("");
		setSelectedProvider(provider);
		try {
			const latest = await getAdminProviderById(provider.providerId);
			setSelectedProvider(latest);
		} catch (requestError) {
			setError(errorMessage(requestError));
		}
	}

	function openCreateModal() {
		setEditingProvider(null);
		setForm(blankForm);
		setFormError("");
		setModalMode("create");
	}

	function openEditModal(provider: AdminProvider) {
		setEditingProvider(provider);
		setForm({
			fullName: provider.businessName,
			email: provider.email,
			password: "",
			businessName: provider.businessName,
			description: provider.description ?? "",
			address: provider.address,
			phone: provider.phone ?? "",
		});
		setFormError("");
		setModalMode("edit");
	}

	async function handleSaveProvider(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setFormError("");
		try {
			if (modalMode === "create") {
				await createAdminProvider({
					fullName: form.fullName.trim(),
					email: form.email.trim(),
					password: form.password,
					businessName: form.businessName.trim(),
					description: form.description?.trim() || null,
					address: form.address.trim(),
					phone: form.phone?.trim() || null,
				});
			} else if (editingProvider) {
				const updated = await updateAdminProvider(editingProvider.providerId, {
					businessName: form.businessName.trim(),
					description: form.description?.trim() || null,
					address: form.address.trim(),
					phone: form.phone?.trim() || null,
				});
				if (selectedProvider?.providerId === updated.providerId) {
					setSelectedProvider(updated);
				}
			}
			setModalMode(null);
			await refresh();
		} catch (requestError) {
			setFormError(errorMessage(requestError));
		} finally {
			setSaving(false);
		}
	}

	async function confirmDelete() {
		if (!pendingDeleteProvider) return;
		setDeleting(true);
		setError("");
		try {
			await deleteAdminProvider(pendingDeleteProvider.providerId);
			if (selectedProvider?.providerId === pendingDeleteProvider.providerId) {
				setSelectedProvider(null);
			}
			setPendingDeleteProvider(null);
			if (result?.items.length === 1 && page > 1) {
				setPage(page - 1);
			} else {
				await refresh();
			}
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setDeleting(false);
		}
	}

	return (
		<div className="mx-auto max-w-375">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div className="min-w-0 flex-1">
					<PageHeader
						eyebrow={messages.common.adminWorkspace}
						title={messages.nav.providers}
						description="Review provider accounts, create or edit business profiles, and update approval status."
					/>
				</div>
				<div className="flex shrink-0 items-center gap-2 sm:pt-2">
					<button
						type="button"
						onClick={openCreateModal}
						className="inline-flex h-10 items-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]"
					>
						<Plus size={16} />
						Add provider
					</button>
				</div>
			</div>

			{error && (
				<p role="alert" className="mt-4 rounded-md border border-[#f0d3cf] bg-[#fdf1ef] px-4 py-3 text-sm text-[#7d372f]">
					{error}
				</p>
			)}

			<section className="mt-5 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
					<div>
						<h2 className="text-base font-semibold text-[#20221f]">{messages.nav.providers}</h2>
						<p className="mt-1 text-sm text-[#777973]">{result?.totalItems ?? 0} providers</p>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<label className="sr-only" htmlFor="provider-search">
							{messages.common.search}
						</label>
						<input
							id="provider-search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search name, email, address"
							className={fieldClassName}
						/>
						<label className="sr-only" htmlFor="provider-status">
							Approval status
						</label>
						<select
							id="provider-status"
							value={approvalStatus}
							onChange={(event) => {
								setLoading(true);
								setError("");
								setApprovalStatus(event.target.value);
								setPage(1);
							}}
							className={fieldClassName}
						>
							<option value="">All approval statuses</option>
							<option value="PENDING">Pending</option>
							<option value="APPROVED">Approved</option>
							<option value="REJECTED">Rejected</option>
						</select>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-220 border-collapse text-left">
						<thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
							<tr>
								<th className="px-5 py-3">Business</th>
								<th className="px-4 py-3">Contact</th>
								<th className="px-4 py-3">Address</th>
								<th className="px-4 py-3">Account</th>
								<th className="px-4 py-3">Approval</th>
								<th className="px-5 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[#eeeeea]">
							{items.map((provider) => (
								<tr key={provider.providerId} className="hover:bg-[#fcfcfa]">
									<td className="px-5 py-3.5">
										<p className="text-sm font-semibold text-[#292b27]">{provider.businessName}</p>
										<p className="mt-1 max-w-sm text-xs text-[#777973]">{provider.description}</p>
									</td>
									<td className="px-4 py-3.5 text-sm text-[#4c4e48]">
										<a href={`mailto:${provider.email}`} className="hover:underline">
											{provider.email}
										</a>
										<p className="mt-1 text-xs text-[#777973]">{provider.phone}</p>
									</td>
									<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{provider.address}</td>
									<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{approvalLabel(provider.accountStatus)}</td>
									<td className="px-4 py-3.5">
										<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(provider.approvalStatus)}`}>
											{approvalLabel(provider.approvalStatus)}
										</span>
									</td>
									<td className="px-5 py-3.5">
										<div className="flex justify-end gap-1.5">
											<button
												type="button"
												onClick={() => void viewDetails(provider)}
												aria-label="View provider details"
												title="View details"
												className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]"
											>
												<Eye size={16} />
											</button>
											<button
												type="button"
												onClick={() => openEditModal(provider)}
												aria-label="Edit provider"
												title="Edit provider"
												className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]"
											>
												<Pencil size={16} />
											</button>
											{provider.approvalStatus.toUpperCase() !== "APPROVED" && (
												<button
													type="button"
													disabled={updatingId === provider.providerId}
													onClick={() => void changeApproval(provider, "APPROVED")}
													aria-label="Approve provider"
													title="Approve provider"
													className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e5f0e8] text-[#39724b] disabled:opacity-50"
												>
													<Check size={16} />
												</button>
											)}
											{provider.approvalStatus.toUpperCase() !== "REJECTED" && (
												<button
													type="button"
													disabled={updatingId === provider.providerId}
													onClick={() => void changeApproval(provider, "REJECTED")}
													aria-label="Reject provider"
													title="Reject provider"
													className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f5e4e1] text-[#a34d42] disabled:opacity-50"
												>
													<X size={16} />
												</button>
											)}
											<button
												type="button"
												onClick={() => setPendingDeleteProvider(provider)}
												aria-label="Delete provider"
												title="Delete provider"
												className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</td>
								</tr>
							))}
							{loading && (
								<tr>
									<td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">
										{messages.common.loading}
									</td>
								</tr>
							)}
							{!loading && items.length === 0 && (
								<tr>
									<td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">
										No providers found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<AdminPagination
					page={page}
					pageSize={pageSize}
					total={result?.totalItems ?? 0}
					onPageChange={(nextPage) => {
						setLoading(true);
						setError("");
						setPage(nextPage);
					}}
					messages={messages.common}
				/>
			</section>

			{selectedProvider && !modalMode && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4"
					onClick={() => setSelectedProvider(null)}
				>
					<section
						role="dialog"
						aria-modal="true"
						aria-labelledby="provider-detail-title"
						className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
									{selectedProvider.providerId}
								</p>
								<h2 id="provider-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">
									{selectedProvider.businessName}
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setSelectedProvider(null)}
								aria-label="Close provider details"
								className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"
							>
								<X size={18} />
							</button>
						</div>
						<dl className="mt-5 divide-y divide-[#eeeeea] text-sm">
							{[
								["Email", selectedProvider.email],
								["Phone", selectedProvider.phone || "—"],
								["Address", selectedProvider.address],
								["Description", selectedProvider.description || "—"],
								["Account Status", approvalLabel(selectedProvider.accountStatus)],
								["Approval Status", approvalLabel(selectedProvider.approvalStatus)],
							].map(([label, value]) => (
								<div key={label} className="flex justify-between gap-4 py-2.5">
									<dt className="text-[#777973]">{label}</dt>
									<dd className="text-right font-medium text-[#343630]">{value}</dd>
								</div>
							))}
						</dl>
						<div className="mt-5 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => openEditModal(selectedProvider)}
								className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#343630] hover:bg-[#f7f7f3]"
							>
								<Pencil size={15} />
								Edit provider
							</button>
							<button
								type="button"
								onClick={() => setPendingDeleteProvider(selectedProvider)}
								className="inline-flex h-9 items-center gap-2 rounded-md border border-[#f0d3cf] px-3 text-sm font-semibold text-[#a34d42] hover:bg-[#fdf1ef]"
							>
								<Trash2 size={15} />
								Delete
							</button>
						</div>
					</section>
				</div>
			)}

			{modalMode && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/40 p-4"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) setModalMode(null);
					}}
				>
					<section
						role="dialog"
						aria-modal="true"
						aria-labelledby="provider-form-title"
						className="my-auto w-full max-w-xl rounded-lg border border-[#e0e0da] bg-white shadow-xl"
					>
						<div className="flex items-center justify-between border-b border-[#e8e8e2] px-5 py-4">
							<h2 id="provider-form-title" className="text-lg font-semibold text-[#20221f]">
								{modalMode === "create" ? "Add provider" : "Edit provider"}
							</h2>
							<button
								type="button"
								onClick={() => setModalMode(null)}
								aria-label="Close form"
								className="flex h-8 w-8 items-center justify-center rounded-md text-[#686a64] hover:bg-[#f0f0ec]"
							>
								<X size={18} />
							</button>
						</div>
						<form onSubmit={handleSaveProvider} className="grid gap-4 p-5 sm:grid-cols-2">
							{modalMode === "create" && (
								<>
									<label className="grid gap-1.5 text-sm font-medium text-[#454741]">
										Owner Full Name
										<input
											required
											maxLength={200}
											value={form.fullName}
											onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
											className={fieldClassName}
										/>
									</label>
									<label className="grid gap-1.5 text-sm font-medium text-[#454741]">
										Email
										<input
											required
											type="email"
											maxLength={256}
											value={form.email}
											onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
											className={fieldClassName}
										/>
									</label>
									<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">
										Password
										<input
											required
											type="password"
											minLength={8}
											maxLength={100}
											value={form.password}
											onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
											className={fieldClassName}
										/>
									</label>
								</>
							)}
							<label className="grid gap-1.5 text-sm font-medium text-[#454741]">
								Business Name
								<input
									required
									maxLength={200}
									value={form.businessName}
									onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
									className={fieldClassName}
								/>
							</label>
							<label className="grid gap-1.5 text-sm font-medium text-[#454741]">
								Phone
								<input
									maxLength={30}
									value={form.phone ?? ""}
									onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
									className={fieldClassName}
								/>
							</label>
							<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">
								Address
								<input
									required
									maxLength={500}
									value={form.address}
									onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
									className={fieldClassName}
								/>
							</label>
							<label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">
								Description
								<textarea
									rows={3}
									maxLength={1000}
									value={form.description ?? ""}
									onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
									className="rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15"
								/>
							</label>
							{formError && (
								<p role="alert" className="text-sm text-[#a34d42] sm:col-span-2">
									{formError}
								</p>
							)}
							<div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4 sm:col-span-2">
								<button
									type="button"
									onClick={() => setModalMode(null)}
									className="h-10 rounded-md border border-[#d8d8d1] px-4 text-sm font-semibold text-[#454741] hover:bg-[#f7f7f3]"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={saving}
									className="h-10 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60"
								>
									{saving ? "Saving…" : modalMode === "create" ? "Create provider" : "Save changes"}
								</button>
							</div>
						</form>
					</section>
				</div>
			)}

			{pendingDeleteProvider && (
				<ConfirmDeleteDialog
					title="Delete this provider?"
					description={`“${pendingDeleteProvider.businessName}” will be permanently deleted if it has no linked spaces, equipment, packages, or bookings.`}
					confirming={deleting}
					error={error || undefined}
					onCancel={() => {
						if (!deleting) {
							setPendingDeleteProvider(null);
							setError("");
						}
					}}
					onConfirm={() => void confirmDelete()}
				/>
			)}
		</div>
	);
}
