"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Ban, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { showAdminToast } from "@/features/admin-notification/toast";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import type { AdminMessages } from "@/shared/i18n/adminMessages";
import { createAdminUser, deleteAdminUser, listAdminUsers, updateAdminUser, updateAdminUserStatus } from "@/features/admin-user/api";
import { getAdminDashboard } from "@/features/admin-dashboard/api";
import type { AdminUser } from "@/features/admin-user/types";

type AccountRole = "Provider" | "Customer" | "Moderator" | "Admin" | string;
type AccountStatus = "Active" | "Inactive";
type AccountActivity = "noActivity";
type Account = {
	id: string;
	name: string;
	email: string;
	role: AccountRole;
	status: AccountStatus;
	joined: string;
	activity: AccountActivity;
};
type AccountDraft = Pick<Account, "name" | "email" | "role" | "status"> & { password: string };

const fieldClassName = "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";
const pageSize = 20;

function mapAdminUser(user: AdminUser): Account {
	return {
		id: user.userId,
		name: user.fullName,
		email: user.email,
		role: user.role.toLowerCase().replace(/(^|_)([a-z])/g, (_, separator: string, letter: string) => `${separator ? " " : ""}${letter.toUpperCase()}`),
		status: user.status.toUpperCase() === "ACTIVE" ? "Active" : "Inactive",
		joined: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(user.createdAt)),
		activity: "noActivity",
	};
}

function apiErrorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? (error.response ? "Request failed. Please check the submitted data." : "Cannot reach the backend. Check that the API is running.");
	}
	return "Something went wrong. Please try again.";
}

function roleLabel(messages: AdminMessages["users"], role: AccountRole) {
	return role in messages.roles ? messages.roles[role as keyof typeof messages.roles] : role;
}

function statusLabel(status: AccountStatus) {
	return status === "Active" ? "Active" : "Inactive";
}

function exportAccounts(rows: Account[], messages: AdminMessages["users"]) {
	const header = [messages.id, messages.columns.account, messages.email, messages.columns.role, messages.columns.status, messages.columns.joined];
	const csv = [header, ...rows.map((account) => [account.id, account.name, account.email, roleLabel(messages, account.role), statusLabel(account.status), account.joined])]
		.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
		.join("\n");
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = "film-photo-users.csv";
	link.click();
	URL.revokeObjectURL(url);
}

function statusClass(status: AccountStatus) {
	if (status === "Active") return "bg-[#e5f0e8] text-[#39724b]";
	return "bg-[#f5e4e1] text-[#a34d42]";
}

export default function UsersPage() {
	const { messages } = useAdminLanguage();
	const t = messages.users;
	const [query, setQuery] = useState("");
	const [role, setRole] = useState("");
	const [status, setStatus] = useState("");
	const [accountRows, setAccountRows] = useState<Account[]>([]);
	const [totalAccounts, setTotalAccounts] = useState(0);
	const [activeAccounts, setActiveAccounts] = useState(0);
	const [pendingProviders, setPendingProviders] = useState(0);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState("");
	const [page, setPage] = useState(1);
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
	const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
	const [accountDraft, setAccountDraft] = useState<AccountDraft>({ name: "", email: "", role: "Customer", status: "Active", password: "" });
	const [accountError, setAccountError] = useState("");
	const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
	const [deletingAccount, setDeletingAccount] = useState(false);

	useEffect(() => {
		let cancelled = false;
		const roleFilter = role ? role.toUpperCase() : undefined;
		const statusFilter = status ? status.toUpperCase() : undefined;
		Promise.allSettled([
			listAdminUsers({ role: roleFilter, status: statusFilter, page, pageSize }),
			getAdminDashboard(),
		]).then(([usersResult, dashboardResult]) => {
			if (cancelled) return;
			if (usersResult.status === "rejected") throw usersResult.reason;
			const result = usersResult.value;
			setLoadError("");
			setAccountRows(result.items.map((user) => mapAdminUser(user)));
			setTotalAccounts(result.totalItems);
			if (dashboardResult.status === "fulfilled") {
				setActiveAccounts(dashboardResult.value.activeUsers);
				setPendingProviders(dashboardResult.value.pendingProviders);
			}
		}).catch((error: unknown) => {
			if (!cancelled) setLoadError(apiErrorMessage(error));
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => { cancelled = true; };
	}, [page, role, status]);

	const normalizedQuery = query.trim().toLowerCase();
	const filteredAccounts = accountRows.filter((account) => {
		const matchesQuery = `${account.name} ${account.email} ${account.id}`.toLowerCase().includes(normalizedQuery);
		return matchesQuery;
	});
	const currentPage = page;
	const visibleAccounts = filteredAccounts;

	async function refreshAccounts() {
		const result = await listAdminUsers({ role: role ? role.toUpperCase() : undefined, status: status ? status.toUpperCase() : undefined, page, pageSize });
		setAccountRows(result.items.map((user) => mapAdminUser(user)));
		setTotalAccounts(result.totalItems);
	}

	async function updateAccountStatus(account: Account, nextStatus: AccountStatus) {
		try {
			const updated = await updateAdminUserStatus(account.id, nextStatus.toUpperCase() as "ACTIVE" | "INACTIVE");
			const mapped = mapAdminUser(updated);
			setAccountRows((current) => current.map((item) => item.id === account.id ? mapped : item));
			setSelectedAccount(mapped);
			showAdminToast({ title: messages.toast.accountStatusChanged, message: `${account.name} · ${statusLabel(nextStatus)}`, tone: nextStatus === "Inactive" ? "warning" : "success" });
		} catch (error) {
			setAccountError(apiErrorMessage(error));
		}
	}

	function openCreateDialog() {
		setAccountDraft({ name: "", email: "", role: "Customer", status: "Active", password: "" });
		setAccountError("");
		setEditorMode("create");
	}

	function openEditDialog(account: Account) {
		setAccountDraft({ name: account.name, email: account.email, role: account.role, status: account.status, password: "" });
		setAccountError("");
		setEditorMode("edit");
	}

	async function saveAccount(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalized = { ...accountDraft, name: accountDraft.name.trim(), email: accountDraft.email.trim(), password: accountDraft.password.trim() };
		if (!normalized.name || !normalized.email) return;
		setAccountError("");
		try {
			const payload = {
				fullName: normalized.name,
				email: normalized.email,
				role: normalized.role.toUpperCase(),
				status: normalized.status.toUpperCase() as "ACTIVE" | "INACTIVE",
			};
			if (editorMode === "create") {
				if (normalized.password.length < 8) {
					setAccountError("Password must be at least 8 characters.");
					return;
				}
				await createAdminUser({ ...payload, password: normalized.password });
				showAdminToast({ title: messages.toast.accountCreated, message: normalized.name });
				if (page !== 1) setPage(1);
				else await refreshAccounts();
			} else if (selectedAccount) {
				const updated = await updateAdminUser(selectedAccount.id, { ...payload, ...(normalized.password ? { password: normalized.password } : {}) });
				setSelectedAccount(mapAdminUser(updated));
				showAdminToast({ title: messages.toast.accountUpdated, message: normalized.name });
			}
			if (editorMode === "edit") await refreshAccounts();
			setEditorMode(null);
		} catch (error) {
			setAccountError(apiErrorMessage(error));
		}
	}

	async function deleteSelectedAccount() {
		if (!selectedAccount) return;
		setDeletingAccount(true);
		try {
			await deleteAdminUser(selectedAccount.id);
			showAdminToast({ title: messages.toast.accountDeleted, message: selectedAccount.name, tone: "warning" });
			setSelectedAccount(null);
			setDeleteConfirmationOpen(false);
			if (page !== 1 && accountRows.length === 1) setPage((current) => current - 1);
			else await refreshAccounts();
		} catch (error) {
			setAccountError(apiErrorMessage(error));
		} finally {
			setDeletingAccount(false);
		}
	}

	return (
		<div className="mx-auto max-w-375">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div className="min-w-0 flex-1"><PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} /></div>
				<div className="flex shrink-0 items-center gap-2 sm:pt-2">
					<button type="button" onClick={openCreateDialog} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]"><Plus size={16} />{t.createAccount}</button>
					<button type="button" onClick={() => { exportAccounts(filteredAccounts, t); showAdminToast({ title: messages.toast.exported, message: messages.toast.exportedDetail, tone: "info" }); }} className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">{messages.common.exportCsv}</button>
				</div>
			</div>

			<section aria-label="Account summary" className="-mt-2 grid gap-3 sm:grid-cols-3">
				{[
					{ label: t.totalAccounts, value: totalAccounts.toString(), helper: t.allRolesHelper, percentage: 100, color: "bg-[#647c98]" },
					{ label: t.activeAccounts, value: activeAccounts.toString(), helper: t.accessEnabled, percentage: totalAccounts ? (activeAccounts / totalAccounts) * 100 : 0, color: "bg-[#39724b]" },
					{ label: t.providerReviews, value: pendingProviders.toString(), helper: t.providersInSample, percentage: 0, color: "bg-[#d4a33b]" },
				].map((metric, metricIndex) => (
					<article key={metric.label} style={{ animationDelay: `${metricIndex * 100}ms` }} className="admin-metric rounded-lg border border-[#e0e0da] bg-white p-4">
						<p className="text-sm text-[#686a64]">{metric.label}</p>
						<p className="mt-2 text-2xl font-semibold text-[#20221f]">{metric.value}</p>
						<p className="mt-1 text-xs text-[#858680]">{metric.helper}</p>
						<div className="admin-meter-track mt-4 h-1.5 overflow-hidden rounded-full bg-[#eeeee9]" role="img" aria-label={`${metric.label}: ${Math.round(metric.percentage)}%`}><div className={`admin-meter h-full rounded-full ${metric.color}`} style={{ width: `${metric.percentage}%`, animationDelay: `${metricIndex * 120 + 180}ms` }} /></div>
					</article>
				))}
			</section>
			{loadError && <p role="alert" className="mt-4 rounded-md border border-[#f0d3cf] bg-[#fdf1ef] px-4 py-3 text-sm text-[#7d372f]">{loadError}</p>}

			<section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
					<div>
						<h2 className="text-base font-semibold text-[#20221f]">{t.allAccounts}</h2>
						<p className="mt-1 text-sm text-[#777973]">{t.accountCount.replace("{shown}", filteredAccounts.length.toString()).replace("{total}", totalAccounts.toString())}</p>
					</div>
					<div className="grid gap-2 sm:grid-cols-[minmax(180px,250px)_150px_155px]">
						<label className="sr-only" htmlFor="account-search">{messages.common.search}</label>
						<input id="account-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={t.searchPlaceholder} className={fieldClassName} />
						<label className="sr-only" htmlFor="role-filter">{t.columns.role}</label>
						<select id="role-filter" value={role} onChange={(event) => { setLoading(true); setLoadError(""); setRole(event.target.value); setPage(1); }} className={fieldClassName}>
							<option value="">{t.allRoles}</option><option value="Provider">{t.roles.Provider}</option><option value="Customer">{t.roles.Customer}</option><option value="Moderator">{t.roles.Moderator}</option><option value="Admin">{t.roles.Admin}</option>
						</select>
						<label className="sr-only" htmlFor="status-filter">{t.columns.status}</label>
						<select id="status-filter" value={status} onChange={(event) => { setLoading(true); setLoadError(""); setStatus(event.target.value); setPage(1); }} className={fieldClassName}>
							<option value="">{t.allStatuses}</option><option value="Active">{t.statuses.Active}</option><option value="Inactive">{t.statuses.Inactive}</option>
						</select>
					</div>
				</div>

				<div className="overflow-x-auto">
					  <table className="w-full min-w-195 border-collapse text-left">
						<thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
							<tr><th className="px-5 py-3">{t.columns.account}</th><th className="px-4 py-3">{t.columns.role}</th><th className="px-4 py-3">{t.columns.status}</th><th className="px-4 py-3">{t.columns.joined}</th><th className="px-4 py-3">{t.columns.activity}</th><th className="px-5 py-3 text-right">{t.columns.details}</th></tr>
						</thead>
						<tbody className="divide-y divide-[#eeeeea]">
							{visibleAccounts.map((account) => (
								<tr key={account.id} className="transition-colors hover:bg-[#fcfcfa]">
									<td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] text-xs font-semibold text-[#45644a]">{account.name.split(" ").map((part) => part[0]).join("")}</span><div><p className="text-sm font-semibold text-[#292b27]">{account.name}</p><p className="mt-0.5 text-xs text-[#777973]">{account.email}</p></div></div></td>
									<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{roleLabel(t, account.role)}</td>
									<td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(account.status)}`}>{t.statuses[account.status]}</span></td>
									<td className="px-4 py-3.5 text-sm text-[#686a64]">{account.joined}</td>
									<td className="px-4 py-3.5 text-sm text-[#686a64]">{t.activity[account.activity]}</td>
									<td className="px-5 py-3.5 text-right"><button type="button" onClick={() => setSelectedAccount(account)} className="text-sm font-semibold text-[#39724b] hover:underline">{t.view}</button></td>
								</tr>
							))}
							{!loading && filteredAccounts.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">{t.noMatches}</td></tr>}
							{loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">{messages.common.loading}</td></tr>}
						</tbody>
					</table>
				</div>
				<AdminPagination page={currentPage} pageSize={pageSize} total={totalAccounts} onPageChange={(nextPage) => { setLoading(true); setLoadError(""); setPage(nextPage); }} messages={messages.common} />
			</section>

			{selectedAccount && !editorMode && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4" onClick={() => { setSelectedAccount(null); setDeleteConfirmationOpen(false); }}>
						<section role="dialog" aria-modal="true" aria-labelledby="account-detail-title" className="w-full max-w-md rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
						<div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">{selectedAccount.id}</p><h2 id="account-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">{selectedAccount.name}</h2></div><button type="button" onClick={() => { setSelectedAccount(null); setDeleteConfirmationOpen(false); }} aria-label="Close account details" className="rounded-md px-2 py-1 text-lg text-[#777973] hover:bg-[#f0f0ec]">×</button></div>
						<dl className="mt-6 divide-y divide-[#eeeeea] text-sm">
							{[ [t.id, selectedAccount.id], [t.email, selectedAccount.email], [t.columns.role, roleLabel(t, selectedAccount.role)], [t.columns.status, t.statuses[selectedAccount.status]], [t.columns.joined, selectedAccount.joined], [t.columns.activity, t.activity[selectedAccount.activity]] ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}
						</dl>
						<div className="mt-6 flex flex-wrap gap-2">
							<button type="button" onClick={() => { setDeleteConfirmationOpen(false); openEditDialog(selectedAccount); }} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#343630] hover:bg-[#f7f7f3]"><Pencil size={15} />{t.editAccount}</button>
							{selectedAccount.status === "Inactive" ? <button type="button" onClick={() => updateAccountStatus(selectedAccount, "Active")} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#39724b] px-3 text-sm font-semibold text-white hover:bg-[#315f3e]"><RotateCcw size={16} />{t.activateAccount}</button> : <button type="button" onClick={() => updateAccountStatus(selectedAccount, "Inactive")} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#a34d42] hover:bg-[#f5e4e1]"><Ban size={16} />{t.suspendAccount}</button>}
							<button type="button" onClick={() => { setAccountError(""); setDeleteConfirmationOpen(true); }} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#f0d3cf] px-3 text-sm font-semibold text-[#a34d42] hover:bg-[#fdf1ef]"><Trash2 size={15} />{t.deleteAccount}</button>
						</div>
						{accountError && !deleteConfirmationOpen && <p role="alert" className="mt-4 text-sm text-[#a34d42]">{accountError}</p>}
					</section>
				</div>
			)}
			{selectedAccount && deleteConfirmationOpen && <ConfirmDeleteDialog title={t.deleteAccount} description={`${t.deleteConfirmation} ${selectedAccount.name}`} confirmLabel={t.confirmDelete} cancelLabel={t.cancel} error={accountError || undefined} confirming={deletingAccount} onCancel={() => { if (!deletingAccount) { setDeleteConfirmationOpen(false); setAccountError(""); } }} onConfirm={() => void deleteSelectedAccount()} />}
			{editorMode && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4" onClick={() => setEditorMode(null)}>
				<section role="dialog" aria-modal="true" aria-labelledby="account-editor-title" className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
					<header className="flex items-start justify-between gap-4 border-b border-[#e8e8e2] px-5 py-4"><div><h2 id="account-editor-title" className="text-lg font-semibold text-[#20221f]">{editorMode === "create" ? t.createAccount : t.editAccount}</h2><p className="mt-1 text-sm text-[#777973]">{t.editorDescription}</p></div><button type="button" aria-label={messages.common.close} onClick={() => setEditorMode(null)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"><X size={17} /></button></header>
					<form onSubmit={saveAccount} className="space-y-4 p-5">
						<label className="block text-sm font-medium text-[#4c4e48]">{t.columns.account}<input required autoFocus value={accountDraft.name} onChange={(event) => { setAccountDraft((draft) => ({ ...draft, name: event.target.value })); setAccountError(""); }} className={`${fieldClassName} mt-1.5 w-full`} /></label>
						<label className="block text-sm font-medium text-[#4c4e48]">{t.email}<input required type="email" value={accountDraft.email} onChange={(event) => { setAccountDraft((draft) => ({ ...draft, email: event.target.value })); setAccountError(""); }} className={`${fieldClassName} mt-1.5 w-full`} /></label>
						<label className="block text-sm font-medium text-[#4c4e48]">Password {editorMode === "edit" ? "(leave blank to keep current)" : ""}<input type="password" minLength={8} required={editorMode === "create"} value={accountDraft.password} onChange={(event) => setAccountDraft((draft) => ({ ...draft, password: event.target.value }))} className={`${fieldClassName} mt-1.5 w-full`} /></label>
						<div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-[#4c4e48]">{t.columns.role}<select value={accountDraft.role} onChange={(event) => setAccountDraft((draft) => ({ ...draft, role: event.target.value as AccountRole }))} className={`${fieldClassName} mt-1.5 w-full`}>{(Object.keys(t.roles) as AccountRole[]).map((option) => <option key={option} value={option}>{t.roles[option as keyof typeof t.roles]}</option>)}</select></label><label className="block text-sm font-medium text-[#4c4e48]">{t.columns.status}<select value={accountDraft.status} onChange={(event) => setAccountDraft((draft) => ({ ...draft, status: event.target.value as AccountStatus }))} className={`${fieldClassName} mt-1.5 w-full`}>{(Object.keys(t.statuses) as AccountStatus[]).map((option) => <option key={option} value={option}>{t.statuses[option]}</option>)}</select></label></div>
						{accountError && <p role="alert" className="text-sm text-[#a34d42]">{accountError}</p>}
						<div className="flex justify-end gap-2 border-t border-[#e8e8e2] pt-4"><button type="button" onClick={() => setEditorMode(null)} className="h-10 rounded-md border border-[#d8d8d1] px-4 text-sm font-semibold text-[#454741] hover:bg-[#f7f7f3]">{t.cancel}</button><button type="submit" className="h-10 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]">{t.saveAccount}</button></div>
					</form>
				</section>
			</div>}
		</div>
	);
}
