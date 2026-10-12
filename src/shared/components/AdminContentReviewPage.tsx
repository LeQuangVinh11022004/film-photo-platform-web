"use client";

import { useState, type FormEvent } from "react";
import { Check, EyeOff, RotateCcw, X } from "lucide-react";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { PageHeader } from "@/shared/components/PageHeader";
import { showAdminToast } from "@/features/admin-notification/toast";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import type { AdminContentItem, AdminContentKind, AdminContentStatus } from "@/features/admin-content/types";

const sampleContent: AdminContentItem[] = [
	{ id: "FP-CT-2408", title: "Softlight Portrait Studio", provider: "Luna Vale Studio", kind: "CreativeSpace", category: "Portrait", submitted: "Feb 22, 2026", status: "Pending", summary: "A daylight portrait studio with north-facing windows, movable backdrops and a dedicated makeup area." },
	{ id: "FP-CT-2407", title: "35mm Film Camera Kit", provider: "Frame Supply Co.", kind: "Equipment", category: "Cameras", submitted: "Feb 21, 2026", status: "Pending", summary: "A serviced 35mm camera kit with two prime lenses, a light meter and a fresh test roll." },
	{ id: "FP-CT-2406", title: "Editorial Roll & Contact Sheet", provider: "Morrow Lab", kind: "ServicePackage", category: "Film processing", submitted: "Feb 20, 2026", status: "ChangesRequested", summary: "One color-negative roll developed and scanned, with a contact sheet included in the delivery." , moderationNote: "Clarify the scan resolution and expected delivery window." },
	{ id: "FP-CT-2405", title: "Cyclorama Daylight Room", provider: "Northlight Studio", kind: "CreativeSpace", category: "Commercial", submitted: "Feb 18, 2026", status: "Published", summary: "A white cyclorama studio with large windows, grip equipment and accessible loading." },
	{ id: "FP-CT-2404", title: "Vintage Flash Trigger Set", provider: "Frame Supply Co.", kind: "Equipment", category: "Lighting", submitted: "Feb 17, 2026", status: "Hidden", summary: "A wireless flash trigger set compatible with a range of studio strobes." , moderationNote: "Compatibility details are being verified." },
	{ id: "FP-CT-2403", title: "Darkroom Starter Session", provider: "Morrow Lab", kind: "ServicePackage", category: "Darkroom", submitted: "Feb 16, 2026", status: "Rejected", summary: "An introductory darkroom session with guided black-and-white film development." , moderationNote: "The listing did not include required safety and supervision information." },
];

const pageSize = 5;
const fieldClassName = "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function statusClass(status: AdminContentStatus) {
	if (status === "Published") return "bg-[#e5f0e8] text-[#39724b]";
	if (status === "Pending") return "bg-[#f8edd9] text-[#93651e]";
	if (status === "ChangesRequested") return "bg-[#e6ebf2] text-[#526784]";
	if (status === "Hidden") return "bg-[#eeeeea] text-[#686a64]";
	return "bg-[#f5e4e1] text-[#a34d42]";
}

export function AdminContentReviewPage() {
	const { messages } = useAdminLanguage();
	const t = messages.content;
	const [rows, setRows] = useState(sampleContent);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<AdminContentStatus | "">("");
	const [kind, setKind] = useState<AdminContentKind | "">("");
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<AdminContentItem | null>(null);
	const [noteAction, setNoteAction] = useState<"ChangesRequested" | "Rejected" | null>(null);
	const [moderationNote, setModerationNote] = useState("");
	const [noteError, setNoteError] = useState(false);
	const [hideConfirmationOpen, setHideConfirmationOpen] = useState(false);
	const filtered = rows.filter((row) => `${row.id} ${row.title} ${row.provider} ${row.category}`.toLowerCase().includes(query.trim().toLowerCase()) && (!status || row.status === status) && (!kind || row.kind === kind));
	const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
	const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	const metrics = [
		{ label: t.metrics.pending, value: rows.filter((row) => row.status === "Pending").length, color: "bg-[#d4a33b]" },
		{ label: t.metrics.published, value: rows.filter((row) => row.status === "Published").length, color: "bg-[#39724b]" },
		{ label: t.metrics.changes, value: rows.filter((row) => row.status === "ChangesRequested").length, color: "bg-[#647c98]" },
		{ label: t.metrics.hidden, value: rows.filter((row) => row.status === "Hidden").length, color: "bg-[#777973]" },
	];

	function openDetails(item: AdminContentItem) {
		setSelected(item);
		setNoteAction(null);
		setModerationNote("");
		setNoteError(false);
		setHideConfirmationOpen(false);
	}

	function closeDetails() {
		setSelected(null);
		setNoteAction(null);
		setHideConfirmationOpen(false);
	}

	function changeStatus(nextStatus: AdminContentStatus, note?: string) {
		if (!selected) return;
		const updated = { ...selected, status: nextStatus, moderationNote: note ?? selected.moderationNote };
		setRows((current) => current.map((item) => item.id === updated.id ? updated : item));
		setSelected(updated);
		setNoteAction(null);
		setModerationNote("");
		setNoteError(false);
		setHideConfirmationOpen(false);
		showAdminToast({ title: messages.toast.contentUpdated, message: `${updated.title} · ${t.statuses[nextStatus]}`, tone: nextStatus === "Rejected" || nextStatus === "Hidden" ? "warning" : "success" });
	}

	function submitModerationNote(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const note = moderationNote.trim();
		if (!note || !noteAction) {
			setNoteError(true);
			return;
		}
		changeStatus(noteAction, note);
	}

	return (
		<div className="mx-auto max-w-375">
			<div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} /></div><span className="mt-2 rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">{messages.common.sampleData}</span></div>
			<section aria-label={t.title} className="-mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric, index) => <article key={metric.label} style={{ animationDelay: `${index * 80}ms` }} className="admin-metric rounded-lg border border-[#e0e0da] bg-white p-4"><p className="text-sm text-[#686a64]">{metric.label}</p><p className="mt-2 text-2xl font-semibold text-[#20221f]">{metric.value}</p><div className={`mt-3 h-1.5 w-12 rounded-full ${metric.color}`} /></article>)}</section>
			<section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h2 className="text-base font-semibold text-[#20221f]">{t.title}</h2><p className="mt-1 text-sm text-[#777973]">{messages.common.paginationShowing.replace("{from}", (filtered.length ? (currentPage - 1) * pageSize + 1 : 0).toString()).replace("{to}", Math.min(currentPage * pageSize, filtered.length).toString()).replace("{total}", filtered.length.toString())}</p></div><div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_190px_190px]"><label className="sr-only" htmlFor="content-search">{messages.common.search}</label><input id="content-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={t.searchPlaceholder} className={fieldClassName} /><label className="sr-only" htmlFor="content-kind">{t.columns.kind}</label><select id="content-kind" value={kind} onChange={(event) => { setKind(event.target.value as AdminContentKind | ""); setPage(1); }} className={fieldClassName}><option value="">{t.allKinds}</option>{(Object.keys(t.kinds) as AdminContentKind[]).map((item) => <option key={item} value={item}>{t.kinds[item]}</option>)}</select><label className="sr-only" htmlFor="content-status">{t.columns.status}</label><select id="content-status" value={status} onChange={(event) => { setStatus(event.target.value as AdminContentStatus | ""); setPage(1); }} className={fieldClassName}><option value="">{t.allStatuses}</option>{(Object.keys(t.statuses) as AdminContentStatus[]).map((item) => <option key={item} value={item}>{t.statuses[item]}</option>)}</select></div></div>
				<div className="overflow-x-auto"><table className="w-full min-w-240 border-collapse text-left"><thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]"><tr><th className="px-5 py-3">{t.columns.title}</th><th className="px-4 py-3">{t.columns.provider}</th><th className="px-4 py-3">{t.columns.kind}</th><th className="px-4 py-3">{t.columns.category}</th><th className="px-4 py-3">{t.columns.submitted}</th><th className="px-4 py-3">{t.columns.status}</th><th className="px-5 py-3 text-right">{t.columns.details}</th></tr></thead><tbody className="divide-y divide-[#eeeeea]">{visible.map((item) => <tr key={item.id} className="hover:bg-[#fcfcfa]"><td className="min-w-52 px-5 py-3.5"><p className="text-sm font-semibold text-[#292b27]">{item.title}</p><p className="mt-0.5 text-xs text-[#777973]">{item.id}</p></td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#4c4e48]">{item.provider}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#4c4e48]">{t.kinds[item.kind]}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#686a64]">{item.category}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#686a64]">{item.submitted}</td><td className="whitespace-nowrap px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}>{t.statuses[item.status]}</span></td><td className="px-5 py-3.5 text-right"><button type="button" onClick={() => openDetails(item)} className="text-sm font-semibold text-[#39724b] hover:underline">{t.columns.details}</button></td></tr>)}{visible.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#777973]">{t.noMatches}</td></tr>}</tbody></table></div>
				<AdminPagination page={currentPage} pageSize={pageSize} total={filtered.length} onPageChange={setPage} messages={messages.common} />
			</section>
				{selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4" onClick={closeDetails}><section role="dialog" aria-modal="true" aria-labelledby="content-review-title" className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">{selected.id} · {t.kinds[selected.kind]}</p><h2 id="content-review-title" className="mt-1 text-xl font-semibold text-[#20221f]">{selected.title}</h2></div><button type="button" aria-label={messages.common.close} onClick={closeDetails} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"><X size={17} /></button></div><p className="mt-5 text-xs font-semibold uppercase tracking-widest text-[#777973]">{t.summary}</p><p className="mt-2 rounded-md bg-[#f8f8f5] p-4 text-sm leading-6 text-[#4c4e48]">{selected.summary}</p><dl className="mt-3 divide-y divide-[#eeeeea] text-sm">{[[t.columns.provider, selected.provider], [t.columns.category, selected.category], [t.columns.submitted, selected.submitted], [t.columns.status, t.statuses[selected.status]]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}</dl>{selected.moderationNote && <div className="mt-4 border-l-2 border-[#d4a33b] pl-3"><p className="text-xs font-semibold uppercase tracking-widest text-[#777973]">{t.moderationNote}</p><p className="mt-1 text-sm leading-5 text-[#4c4e48]">{selected.moderationNote}</p></div>}
					<div className="mt-5 flex flex-wrap gap-2">{(selected.status === "Pending" || selected.status === "ChangesRequested") && <button type="button" onClick={() => changeStatus("Published")} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#39724b] px-3 text-sm font-semibold text-white"><Check size={15} />{t.approve}</button>}{(selected.status === "Pending" || selected.status === "ChangesRequested") && <button type="button" onClick={() => { setNoteAction("ChangesRequested"); setModerationNote(""); setNoteError(false); }} className="h-9 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#343630]">{t.requestChanges}</button>}{(selected.status === "Pending" || selected.status === "ChangesRequested") && <button type="button" onClick={() => { setNoteAction("Rejected"); setModerationNote(""); setNoteError(false); }} className="h-9 rounded-md border border-[#f0d3cf] px-3 text-sm font-semibold text-[#a34d42]">{t.reject}</button>}{selected.status === "Published" && !hideConfirmationOpen && <button type="button" onClick={() => setHideConfirmationOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#a34d42]"><EyeOff size={15} />{t.hide}</button>}{selected.status === "Hidden" && <button type="button" onClick={() => changeStatus("Published")} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#39724b] px-3 text-sm font-semibold text-white"><RotateCcw size={15} />{t.restore}</button>}{selected.status === "Rejected" && <button type="button" onClick={() => changeStatus("Pending")} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#343630]"><RotateCcw size={15} />{t.reopen}</button>}</div>
					{noteAction && <form onSubmit={submitModerationNote} className="mt-4 rounded-md border border-[#e0e0da] bg-[#fafaf8] p-4"><label htmlFor="moderation-note" className="text-sm font-semibold text-[#343630]">{t.moderationNote}</label><textarea id="moderation-note" required autoFocus value={moderationNote} onChange={(event) => { setModerationNote(event.target.value); setNoteError(false); }} rows={3} placeholder={t.moderationNotePlaceholder} className="mt-2 w-full resize-y rounded-md border border-[#d8d8d1] bg-white p-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15" />{noteError && <p role="alert" className="mt-2 text-sm text-[#a34d42]">{t.noteRequired}</p>}<div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setNoteAction(null)} className="h-9 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#343630]">{t.cancel}</button><button type="submit" className="h-9 rounded-md bg-[#20221f] px-3 text-sm font-semibold text-white">{t.submitNote}</button></div></form>}
					{hideConfirmationOpen && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-[#f0d3cf] bg-[#fdf1ef] p-3"><p className="mr-auto text-sm text-[#7d372f]">{t.confirmHide}</p><button type="button" onClick={() => setHideConfirmationOpen(false)} className="h-8 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm font-semibold text-[#343630]">{t.cancel}</button><button type="button" onClick={() => changeStatus("Hidden")} className="h-8 rounded-md bg-[#a34d42] px-3 text-sm font-semibold text-white">{t.confirm}</button></div>}<p className="mt-4 text-xs text-[#858680]">{t.sampleNote}</p></section></div>}
		</div>
	);
}