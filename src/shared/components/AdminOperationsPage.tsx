"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";

type PaymentStatus = "Completed" | "Pending" | "Refunded" | "Failed";
type PaymentMethod = "Card" | "PayPal" | "Transfer";
type Transaction = { id: string; booking: string; customer: string; provider: string; amount: number; method: PaymentMethod; status: PaymentStatus; date: string };
type DisputeStatus = "Open" | "Reviewing" | "Resolved";
type DisputeReason = "cancellation" | "payment" | "quality" | "listing";
type Dispute = { id: string; booking: string; customer: string; provider: string; reason: DisputeReason; opened: string; status: DisputeStatus; summary: string };

const transactions: Transaction[] = [
  { id: "FP-TX-3008", booking: "FP-RS-1188", customer: "Noah Williams", provider: "Northlight Studio", amount: 300, method: "Card", status: "Completed", date: "Feb 21, 2026" },
  { id: "FP-TX-3007", booking: "FP-RS-1184", customer: "Maya Chen", provider: "The Slate Room", amount: 525, method: "PayPal", status: "Pending", date: "Feb 21, 2026" },
  { id: "FP-TX-3006", booking: "FP-RS-1179", customer: "Rory Patel", provider: "Goodlight Collective", amount: 415, method: "Transfer", status: "Failed", date: "Feb 20, 2026" },
  { id: "FP-TX-3005", booking: "FP-RS-1172", customer: "Elena Rossi", provider: "Form & Frame", amount: 760, method: "Card", status: "Completed", date: "Feb 20, 2026" },
  { id: "FP-TX-3004", booking: "FP-RS-1168", customer: "Amara Singh", provider: "Studio No. 8", amount: 210, method: "PayPal", status: "Refunded", date: "Feb 19, 2026" },
  { id: "FP-TX-3003", booking: "FP-RS-1161", customer: "Sofia Andersson", provider: "Northlight Studio", amount: 485, method: "Card", status: "Completed", date: "Feb 19, 2026" },
  { id: "FP-TX-3002", booking: "FP-RS-1157", customer: "Theo Martin", provider: "The Slate Room", amount: 340, method: "Transfer", status: "Pending", date: "Feb 18, 2026" },
  { id: "FP-TX-3001", booking: "FP-RS-1152", customer: "Jonas Lee", provider: "Goodlight Collective", amount: 620, method: "Card", status: "Completed", date: "Feb 18, 2026" },
];

const disputes: Dispute[] = [
  { id: "FP-DP-9008", booking: "FP-RS-1185", customer: "Noah Williams", provider: "Northlight Studio", reason: "quality", opened: "Feb 22, 2026", status: "Open", summary: "Customer reports that the lighting equipment was not available at the agreed time." },
  { id: "FP-DP-9007", booking: "FP-RS-1181", customer: "Maya Chen", provider: "The Slate Room", reason: "payment", opened: "Feb 21, 2026", status: "Reviewing", summary: "The customer reports a duplicate charge for one reservation." },
  { id: "FP-DP-9006", booking: "FP-RS-1178", customer: "Amara Singh", provider: "Goodlight Collective", reason: "cancellation", opened: "Feb 21, 2026", status: "Open", summary: "A refund is requested after the provider cancelled the booking." },
  { id: "FP-DP-9005", booking: "FP-RS-1174", customer: "Rory Patel", provider: "Form & Frame", reason: "listing", opened: "Feb 20, 2026", status: "Resolved", summary: "The delivered studio did not match the published listing details." },
  { id: "FP-DP-9004", booking: "FP-RS-1169", customer: "Elena Rossi", provider: "Studio No. 8", reason: "quality", opened: "Feb 20, 2026", status: "Reviewing", summary: "The customer reported a damaged backdrop after the session." },
  { id: "FP-DP-9003", booking: "FP-RS-1163", customer: "Sofia Andersson", provider: "Northlight Studio", reason: "payment", opened: "Feb 19, 2026", status: "Open", summary: "The payment receipt shows a different amount from the booking summary." },
  { id: "FP-DP-9002", booking: "FP-RS-1158", customer: "Theo Martin", provider: "The Slate Room", reason: "cancellation", opened: "Feb 18, 2026", status: "Resolved", summary: "The parties agreed on a partial refund after a late cancellation." },
  { id: "FP-DP-9001", booking: "FP-RS-1153", customer: "Jonas Lee", provider: "Goodlight Collective", reason: "listing", opened: "Feb 18, 2026", status: "Reviewing", summary: "The provider's equipment list did not match the confirmed reservation." },
];

const pageSize = 5;
const fieldClassName = "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function currency(value: number, locale: "en" | "vi") {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function paymentStatusClass(status: PaymentStatus) {
  if (status === "Completed") return "bg-[#e5f0e8] text-[#39724b]";
  if (status === "Pending") return "bg-[#f8edd9] text-[#93651e]";
  if (status === "Refunded") return "bg-[#e6ebf2] text-[#526784]";
  return "bg-[#f5e4e1] text-[#a34d42]";
}

function disputeStatusClass(status: DisputeStatus) {
  if (status === "Resolved") return "bg-[#e5f0e8] text-[#39724b]";
  if (status === "Reviewing") return "bg-[#f8edd9] text-[#93651e]";
  return "bg-[#f5e4e1] text-[#a34d42]";
}

export function AdminOperationsPage({ kind }: { kind: "transactions" | "disputes" }) {
  return kind === "transactions" ? <TransactionsPage /> : <DisputesPage />;
}

function TransactionsPage() {
  const { locale, messages } = useAdminLanguage();
  const t = messages.transactions;
  const [rows] = useState(transactions);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const filtered = rows.filter((row) => `${row.id} ${row.customer} ${row.provider} ${row.booking}`.toLowerCase().includes(query.trim().toLowerCase()) && (!status || row.status === status));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const completedRows = rows.filter((row) => row.status === "Completed");
  const metrics = [
    { label: t.metrics.volume, value: currency(completedRows.reduce((total, row) => total + row.amount, 0), locale) },
    { label: t.metrics.completed, value: completedRows.length.toString() },
    { label: t.metrics.pending, value: rows.filter((row) => row.status === "Pending").length.toString() },
    { label: t.metrics.refunds, value: rows.filter((row) => row.status === "Refunded").length.toString() },
  ];

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} /></div><span className="mt-2 rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">{messages.common.sampleData}</span></div>
      <section aria-label={t.title} className="-mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric, index) => <article key={metric.label} style={{ animationDelay: `${index * 80}ms` }} className="admin-metric rounded-lg border border-[#e0e0da] bg-white p-4"><p className="text-sm text-[#686a64]">{metric.label}</p><p className="mt-2 text-2xl font-semibold text-[#20221f]">{metric.value}</p><p className="mt-1 text-xs text-[#777973]">{t.sampleNote}</p></article>)}</section>
      <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h2 className="text-base font-semibold text-[#20221f]">{t.title}</h2><p className="mt-1 text-sm text-[#777973]">{messages.common.paginationShowing.replace("{from}", (filtered.length ? (currentPage - 1) * pageSize + 1 : 0).toString()).replace("{to}", Math.min(currentPage * pageSize, filtered.length).toString()).replace("{total}", filtered.length.toString())}</p></div><div className="grid gap-2 sm:grid-cols-[minmax(220px,300px)_210px]"><label className="sr-only" htmlFor="payment-search">{messages.common.search}</label><input id="payment-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={t.searchPlaceholder} className={fieldClassName} /><label className="sr-only" htmlFor="payment-status">{t.columns.status}</label><select id="payment-status" value={status} onChange={(event) => { setStatus(event.target.value as PaymentStatus | ""); setPage(1); }} className={fieldClassName}><option value="">{t.allStatuses}</option>{(Object.keys(t.statuses) as PaymentStatus[]).map((option) => <option key={option} value={option}>{t.statuses[option]}</option>)}</select></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-220 border-collapse text-left"><thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]"><tr><th className="px-5 py-3">{t.columns.id}</th><th className="px-4 py-3">{t.columns.customer}</th><th className="px-4 py-3">{t.columns.provider}</th><th className="px-4 py-3">{t.columns.amount}</th><th className="px-4 py-3">{t.columns.method}</th><th className="px-4 py-3">{t.columns.status}</th><th className="px-4 py-3">{t.columns.date}</th><th className="px-5 py-3 text-right">{t.columns.details}</th></tr></thead><tbody className="divide-y divide-[#eeeeea]">{visible.map((row) => <tr key={row.id} className="hover:bg-[#fcfcfa]"><td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-[#292b27]">{row.id}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#4c4e48]">{row.customer}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#4c4e48]">{row.provider}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-[#292b27]">{currency(row.amount, locale)}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#686a64]">{t.methods[row.method]}</td><td className="whitespace-nowrap px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusClass(row.status)}`}>{t.statuses[row.status]}</span></td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#686a64]">{row.date}</td><td className="px-5 py-3.5 text-right"><button type="button" onClick={() => setSelected(row)} className="text-sm font-semibold text-[#39724b] hover:underline">{t.columns.details}</button></td></tr>)}{visible.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#777973]">{t.noMatches}</td></tr>}</tbody></table></div>
        <AdminPagination page={currentPage} pageSize={pageSize} total={filtered.length} onPageChange={setPage} messages={messages.common} />
      </section>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">{selected.id}</p><h2 id="payment-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">{t.detailsTitle}</h2></div><button type="button" aria-label={messages.common.close} onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"><X size={17} /></button></div><dl className="mt-5 divide-y divide-[#eeeeea] text-sm">{[[t.reference, selected.booking], [t.columns.customer, selected.customer], [t.columns.provider, selected.provider], [t.columns.amount, currency(selected.amount, locale)], [t.columns.method, t.methods[selected.method]], [t.columns.status, t.statuses[selected.status]], [t.columns.date, selected.date]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}</dl><p className="mt-4 text-xs text-[#858680]">{t.sampleNote}</p></section></div>}
    </div>
  );
}

function DisputesPage() {
  const { messages } = useAdminLanguage();
  const t = messages.disputes;
  const [rows, setRows] = useState(disputes);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DisputeStatus | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const filtered = rows.filter((row) => `${row.id} ${row.booking} ${row.customer} ${row.provider}`.toLowerCase().includes(query.trim().toLowerCase()) && (!status || row.status === status));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const metrics = [
    { label: t.metrics.open, value: rows.filter((row) => row.status === "Open").length },
    { label: t.metrics.reviewing, value: rows.filter((row) => row.status === "Reviewing").length },
    { label: t.metrics.resolved, value: rows.filter((row) => row.status === "Resolved").length },
  ];

  function updateStatus(dispute: Dispute, nextStatus: DisputeStatus) {
    setRows((current) => current.map((row) => row.id === dispute.id ? { ...row, status: nextStatus } : row));
    setSelected({ ...dispute, status: nextStatus });
  }

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} /></div><span className="mt-2 rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">{messages.common.sampleData}</span></div>
      <section aria-label={t.title} className="-mt-2 grid gap-3 sm:grid-cols-3">{metrics.map((metric, index) => <article key={metric.label} style={{ animationDelay: `${index * 90}ms` }} className="admin-metric rounded-lg border border-[#e0e0da] bg-white p-4"><p className="text-sm text-[#686a64]">{metric.label}</p><p className="mt-2 text-2xl font-semibold text-[#20221f]">{metric.value}</p><p className="mt-1 text-xs text-[#777973]">{t.sampleNote}</p></article>)}</section>
      <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h2 className="text-base font-semibold text-[#20221f]">{t.title}</h2><p className="mt-1 text-sm text-[#777973]">{messages.common.paginationShowing.replace("{from}", (filtered.length ? (currentPage - 1) * pageSize + 1 : 0).toString()).replace("{to}", Math.min(currentPage * pageSize, filtered.length).toString()).replace("{total}", filtered.length.toString())}</p></div><div className="grid gap-2 sm:grid-cols-[minmax(220px,300px)_210px]"><label className="sr-only" htmlFor="dispute-search">{messages.common.search}</label><input id="dispute-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={t.searchPlaceholder} className={fieldClassName} /><label className="sr-only" htmlFor="dispute-status">{t.columns.status}</label><select id="dispute-status" value={status} onChange={(event) => { setStatus(event.target.value as DisputeStatus | ""); setPage(1); }} className={fieldClassName}><option value="">{t.allStatuses}</option>{(Object.keys(t.statuses) as DisputeStatus[]).map((option) => <option key={option} value={option}>{t.statuses[option]}</option>)}</select></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-220 border-collapse text-left"><thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]"><tr><th className="px-5 py-3">{t.columns.id}</th><th className="px-4 py-3">{t.columns.booking}</th><th className="px-4 py-3">{t.columns.customer}</th><th className="px-4 py-3">{t.columns.provider}</th><th className="px-4 py-3">{t.columns.reason}</th><th className="px-4 py-3">{t.columns.opened}</th><th className="px-4 py-3">{t.columns.status}</th><th className="px-5 py-3 text-right">{t.columns.details}</th></tr></thead><tbody className="divide-y divide-[#eeeeea]">{visible.map((row) => <tr key={row.id} className="hover:bg-[#fcfcfa]"><td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-[#292b27]">{row.id}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#4c4e48]">{row.booking}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#4c4e48]">{row.customer}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#4c4e48]">{row.provider}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#686a64]">{t.reasons[row.reason]}</td><td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#686a64]">{row.opened}</td><td className="whitespace-nowrap px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${disputeStatusClass(row.status)}`}>{t.statuses[row.status]}</span></td><td className="px-5 py-3.5 text-right"><button type="button" onClick={() => setSelected(row)} className="text-sm font-semibold text-[#39724b] hover:underline">{t.columns.details}</button></td></tr>)}{visible.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#777973]">{t.noMatches}</td></tr>}</tbody></table></div>
        <AdminPagination page={currentPage} pageSize={pageSize} total={filtered.length} onPageChange={setPage} messages={messages.common} />
      </section>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="dispute-detail-title" className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">{selected.id} · {selected.booking}</p><h2 id="dispute-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">{t.detailsTitle}</h2></div><button type="button" aria-label={messages.common.close} onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"><X size={17} /></button></div><p className="mt-5 rounded-md bg-[#f8f8f5] p-4 text-sm leading-6 text-[#4c4e48]">{selected.summary}</p><dl className="mt-3 divide-y divide-[#eeeeea] text-sm">{[[t.columns.customer, selected.customer], [t.columns.provider, selected.provider], [t.columns.reason, t.reasons[selected.reason]], [t.columns.opened, selected.opened], [t.columns.status, t.statuses[selected.status]]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}</dl><div className="mt-5 flex flex-wrap gap-2">{selected.status === "Open" && <button type="button" onClick={() => updateStatus(selected, "Reviewing")} className="h-9 rounded-md bg-[#20221f] px-3 text-sm font-semibold text-white">{t.startReview}</button>}{selected.status === "Reviewing" && <button type="button" onClick={() => updateStatus(selected, "Resolved")} className="h-9 rounded-md bg-[#39724b] px-3 text-sm font-semibold text-white">{t.resolve}</button>}{selected.status === "Resolved" && <button type="button" onClick={() => updateStatus(selected, "Open")} className="h-9 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#454741]">{t.reopen}</button>}</div><p className="mt-4 text-xs text-[#858680]">{t.sampleNote}</p></section></div>}
    </div>
  );
}