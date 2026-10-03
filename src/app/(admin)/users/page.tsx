"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import type { AdminMessages } from "@/shared/i18n/adminMessages";

type AccountRole = "Provider" | "Customer" | "Moderator" | "Admin";
type AccountStatus = "Active" | "Pending" | "Suspended";
type AccountActivity = "twelveReservations" | "fourReservations" | "eightReservations" | "profileReview" | "twentyFourReviews" | "restricted" | "twoReservations";
type Account = {
	id: string;
	name: string;
	email: string;
	role: AccountRole;
	status: AccountStatus;
	joined: string;
	activity: AccountActivity;
};

const accounts: Account[] = [
	{ id: "FP-2048", name: "Maya Chen", email: "maya.chen@example.com", role: "Provider", status: "Active", joined: "Feb 18, 2026", activity: "twelveReservations" },
	{ id: "FP-2047", name: "Jonas Lee", email: "jonas.lee@example.com", role: "Provider", status: "Pending", joined: "Feb 18, 2026", activity: "profileReview" },
	{ id: "FP-2046", name: "Amara Singh", email: "amara.singh@example.com", role: "Customer", status: "Active", joined: "Feb 17, 2026", activity: "fourReservations" },
	{ id: "FP-2045", name: "Rory Patel", email: "rory.patel@example.com", role: "Provider", status: "Active", joined: "Feb 16, 2026", activity: "eightReservations" },
	{ id: "FP-2044", name: "Elena Rossi", email: "elena.rossi@example.com", role: "Moderator", status: "Active", joined: "Feb 15, 2026", activity: "twentyFourReviews" },
	{ id: "FP-2043", name: "Theo Martin", email: "theo.martin@example.com", role: "Customer", status: "Suspended", joined: "Feb 14, 2026", activity: "restricted" },
	{ id: "FP-2042", name: "Sofia Andersson", email: "sofia.andersson@example.com", role: "Provider", status: "Pending", joined: "Feb 13, 2026", activity: "profileReview" },
	{ id: "FP-2041", name: "Noah Williams", email: "noah.williams@example.com", role: "Customer", status: "Active", joined: "Feb 12, 2026", activity: "twoReservations" },
];

const fieldClassName = "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function exportAccounts(rows: Account[], messages: AdminMessages["users"]) {
	const header = [messages.id, messages.columns.account, messages.email, messages.columns.role, messages.columns.status, messages.columns.joined, messages.columns.activity];
	const csv = [header, ...rows.map((account) => [account.id, account.name, account.email, messages.roles[account.role], messages.statuses[account.status], account.joined, messages.activity[account.activity]])]
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
	if (status === "Pending") return "bg-[#f8edd9] text-[#93651e]";
	return "bg-[#f5e4e1] text-[#a34d42]";
}

export default function UsersPage() {
	const { messages } = useAdminLanguage();
	const t = messages.users;
	const [query, setQuery] = useState("");
	const [role, setRole] = useState("");
	const [status, setStatus] = useState("");
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
	const normalizedQuery = query.trim().toLowerCase();
	const filteredAccounts = accounts.filter((account) => {
		const matchesQuery = `${account.name} ${account.email} ${account.id}`.toLowerCase().includes(normalizedQuery);
		return matchesQuery && (!role || account.role === role) && (!status || account.status === status);
	});
	const activeCount = accounts.filter((account) => account.status === "Active").length;
	const pendingCount = accounts.filter((account) => account.status === "Pending").length;
	const providerCount = accounts.filter((account) => account.role === "Provider").length;

	return (
		<div className="mx-auto max-w-375">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div className="min-w-0 flex-1"><PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} /></div>
				<div className="flex shrink-0 items-center gap-2 sm:pt-2">
					<span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">{messages.common.sampleData}</span>
					<button type="button" onClick={() => exportAccounts(filteredAccounts, t)} className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">{messages.common.exportCsv}</button>
				</div>
			</div>

			<section aria-label="Account summary" className="-mt-2 grid gap-3 sm:grid-cols-3">
				{[
					{ label: t.totalAccounts, value: accounts.length.toString(), helper: t.allRolesHelper },
					{ label: t.activeAccounts, value: activeCount.toString(), helper: t.accessEnabled },
					{ label: t.providerReviews, value: pendingCount.toString(), helper: `${providerCount} ${t.providersInSample}` },
				].map((metric) => (
					<article key={metric.label} className="rounded-lg border border-[#e0e0da] bg-white p-4">
						<p className="text-sm text-[#686a64]">{metric.label}</p>
						<p className="mt-2 text-2xl font-semibold text-[#20221f]">{metric.value}</p>
						<p className="mt-1 text-xs text-[#858680]">{metric.helper}</p>
					</article>
				))}
			</section>

			<section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
					<div>
						<h2 className="text-base font-semibold text-[#20221f]">{t.allAccounts}</h2>
						<p className="mt-1 text-sm text-[#777973]">{t.accountCount.replace("{shown}", filteredAccounts.length.toString()).replace("{total}", accounts.length.toString())}</p>
					</div>
					<div className="grid gap-2 sm:grid-cols-[minmax(180px,250px)_150px_155px]">
						<label className="sr-only" htmlFor="account-search">{messages.common.search}</label>
						<input id="account-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} className={fieldClassName} />
						<label className="sr-only" htmlFor="role-filter">{t.columns.role}</label>
						<select id="role-filter" value={role} onChange={(event) => setRole(event.target.value)} className={fieldClassName}>
							<option value="">{t.allRoles}</option><option value="Provider">{t.roles.Provider}</option><option value="Customer">{t.roles.Customer}</option><option value="Moderator">{t.roles.Moderator}</option><option value="Admin">{t.roles.Admin}</option>
						</select>
						<label className="sr-only" htmlFor="status-filter">{t.columns.status}</label>
						<select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClassName}>
							<option value="">{t.allStatuses}</option><option value="Active">{t.statuses.Active}</option><option value="Pending">{t.statuses.Pending}</option><option value="Suspended">{t.statuses.Suspended}</option>
						</select>
					</div>
				</div>

				<div className="overflow-x-auto">
					  <table className="w-full min-w-195 border-collapse text-left">
						<thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
							<tr><th className="px-5 py-3">{t.columns.account}</th><th className="px-4 py-3">{t.columns.role}</th><th className="px-4 py-3">{t.columns.status}</th><th className="px-4 py-3">{t.columns.joined}</th><th className="px-4 py-3">{t.columns.activity}</th><th className="px-5 py-3 text-right">{t.columns.details}</th></tr>
						</thead>
						<tbody className="divide-y divide-[#eeeeea]">
							{filteredAccounts.map((account) => (
								<tr key={account.id} className="transition-colors hover:bg-[#fcfcfa]">
									<td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] text-xs font-semibold text-[#45644a]">{account.name.split(" ").map((part) => part[0]).join("")}</span><div><p className="text-sm font-semibold text-[#292b27]">{account.name}</p><p className="mt-0.5 text-xs text-[#777973]">{account.email}</p></div></div></td>
									<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{t.roles[account.role]}</td>
									<td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(account.status)}`}>{t.statuses[account.status]}</span></td>
									<td className="px-4 py-3.5 text-sm text-[#686a64]">{account.joined}</td>
									<td className="px-4 py-3.5 text-sm text-[#686a64]">{t.activity[account.activity]}</td>
									<td className="px-5 py-3.5 text-right"><button type="button" onClick={() => setSelectedAccount(account)} className="text-sm font-semibold text-[#39724b] hover:underline">{t.view}</button></td>
								</tr>
							))}
							{filteredAccounts.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">{t.noMatches}</td></tr>}
						</tbody>
					</table>
				</div>
			</section>

			{selectedAccount && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4" onClick={() => setSelectedAccount(null)}>
						<section role="dialog" aria-modal="true" aria-labelledby="account-detail-title" className="w-full max-w-md rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
						<div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">{selectedAccount.id}</p><h2 id="account-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">{selectedAccount.name}</h2></div><button type="button" onClick={() => setSelectedAccount(null)} aria-label="Close account details" className="rounded-md px-2 py-1 text-lg text-[#777973] hover:bg-[#f0f0ec]">×</button></div>
						<dl className="mt-6 divide-y divide-[#eeeeea] text-sm">
							{[ [t.id, selectedAccount.id], [t.email, selectedAccount.email], [t.columns.role, t.roles[selectedAccount.role]], [t.columns.status, t.statuses[selectedAccount.status]], [t.columns.joined, selectedAccount.joined], [t.columns.activity, t.activity[selectedAccount.activity]] ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}
						</dl>
						<p className="mt-4 text-xs text-[#858680]">{t.actionsUnavailable}</p>
					</section>
				</div>
			)}
		</div>
	);
}
