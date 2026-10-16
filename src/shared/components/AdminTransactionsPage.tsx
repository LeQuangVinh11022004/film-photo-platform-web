"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { listAdminBookings, getAdminBookingById } from "@/features/admin-booking/api";
import type { AdminBooking, AdminBookingDetail } from "@/features/admin-booking/types";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminPagination } from "@/shared/components/AdminPagination";
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

function humanize(value: string) {
	return value.toLowerCase().replace(/(^|_)([a-z])/g, (_, separator: string, letter: string) => `${separator ? " " : ""}${letter.toUpperCase()}`);
}

function currency(value: number, locale: "en" | "vi") {
	return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function dateLabel(value: string, locale: "en" | "vi") {
	const date = new Date(`${value.slice(0, 10)}T00:00:00`);
	return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium" }).format(date);
}

export function AdminTransactionsPage() {
	const { locale, messages } = useAdminLanguage();
	const t = messages.transactions;
	const [result, setResult] = useState<PagedResponse<AdminBooking> | null>(null);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState("");
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selected, setSelected] = useState<AdminBookingDetail | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;
		listAdminBookings({ status: status || undefined, page, pageSize })
			.then((data) => { if (!cancelled) { setResult(data); setError(""); } })
			.catch((requestError: unknown) => { if (!cancelled) setError(errorMessage(requestError)); })
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [page, status]);

	const rows = (result?.items ?? []).filter((booking) =>
		`${booking.bookingId} ${booking.photographerName} ${booking.providerName} ${booking.spaceName}`.toLowerCase().includes(query.trim().toLowerCase()),
	);

	async function openDetails(bookingId: string) {
		setSelected(null);
		setDetailLoading(true);
		setError("");
		try {
			setSelected(await getAdminBookingById(bookingId));
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setDetailLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-375">
			<PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} />
			<p className="mt-3 text-xs text-[#777973]">Booking records and payment details from the backend. Payment updates and refunds are not exposed by the current API.</p>
			{error && <p role="alert" className="mt-4 rounded-md border border-[#f0d3cf] bg-[#fdf1ef] px-4 py-3 text-sm text-[#7d372f]">{error}</p>}
			<section className="mt-5 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
					<div><h2 className="text-base font-semibold text-[#20221f]">{t.title}</h2><p className="mt-1 text-sm text-[#777973]">{result?.totalItems ?? 0} records</p></div>
					<div className="grid gap-2 sm:grid-cols-[minmax(220px,300px)_210px]">
						<label className="sr-only" htmlFor="booking-search">{messages.common.search}</label>
						<input id="booking-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} className={fieldClassName} />
						<label className="sr-only" htmlFor="booking-status">{t.columns.status}</label>
						<select id="booking-status" value={status} onChange={(event) => { setLoading(true); setError(""); setStatus(event.target.value); setPage(1); }} className={fieldClassName}>
							<option value="">{t.allStatuses}</option><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
						</select>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-220 border-collapse text-left">
						<thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]"><tr><th className="px-5 py-3">{t.columns.id}</th><th className="px-4 py-3">{t.columns.customer}</th><th className="px-4 py-3">{t.columns.provider}</th><th className="px-4 py-3">Space</th><th className="px-4 py-3">{t.columns.amount}</th><th className="px-4 py-3">{t.columns.status}</th><th className="px-4 py-3">{t.columns.date}</th><th className="px-5 py-3 text-right">{t.columns.details}</th></tr></thead>
						<tbody className="divide-y divide-[#eeeeea]">
							{rows.map((booking) => <tr key={booking.bookingId} className="hover:bg-[#fcfcfa]">
								<td className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold text-[#292b27]">{booking.bookingId}</td>
								<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{booking.photographerName}</td>
								<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{booking.providerName}</td>
								<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{booking.spaceName}</td>
								<td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-[#292b27]">{currency(booking.totalAmount, locale)}</td>
								<td className="px-4 py-3.5 text-sm text-[#4c4e48]">{humanize(booking.status)}</td>
								<td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#686a64]">{dateLabel(booking.bookingDate, locale)}</td>
								<td className="px-5 py-3.5 text-right"><button type="button" onClick={() => void openDetails(booking.bookingId)} className="text-sm font-semibold text-[#39724b] hover:underline">{t.columns.details}</button></td>
							</tr>)}
							{loading && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#777973]">{messages.common.loading}</td></tr>}
							{!loading && rows.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#777973]">{t.noMatches}</td></tr>}
						</tbody>
					</table>
				</div>
				<AdminPagination page={page} pageSize={pageSize} total={result?.totalItems ?? 0} onPageChange={(nextPage) => { setLoading(true); setError(""); setPage(nextPage); }} messages={messages.common} />
			</section>
			{detailLoading && <p role="status" className="mt-3 text-sm text-[#777973]">{messages.common.loading}</p>}
			{selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
				<div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">{selected.bookingId}</p><h2 id="booking-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">{selected.spaceName}</h2></div><button type="button" aria-label={messages.common.close} onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"><X size={17} /></button></div>
				<dl className="mt-5 divide-y divide-[#eeeeea] text-sm">{[[t.columns.customer, `${selected.photographerName} · ${selected.photographerEmail}`], [t.columns.provider, `${selected.providerName} · ${selected.providerEmail}`], ["Phone", selected.providerPhone], ["Address", selected.spaceAddress], ["Booking date", `${dateLabel(selected.bookingDate, locale)} · ${selected.startTime}–${selected.endTime}`], [t.columns.status, humanize(selected.status)], [t.columns.amount, currency(selected.totalAmount, locale)], ["Package", selected.packageName ? `${selected.packageName}${selected.packagePrice === null ? "" : ` · ${currency(selected.packagePrice, locale)}`}` : "—"]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}</dl>
				<div className="mt-5 border-t border-[#e8e8e2] pt-4"><h3 className="text-sm font-semibold text-[#292b27]">Payment</h3>{selected.payment ? <dl className="mt-2 divide-y divide-[#eeeeea] text-sm">{[["Amount", currency(selected.payment.amount, locale)], ["Method", humanize(selected.payment.paymentMethod)], ["Status", humanize(selected.payment.status)], ["Transaction code", selected.payment.transactionCode || "—"], ["Paid at", selected.payment.paidAt ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selected.payment.paidAt)) : "—"]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-2"><dt className="text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}</dl> : <p className="mt-2 text-sm text-[#777973]">No payment record.</p>}</div>
				{selected.equipment.length > 0 && <div className="mt-5 border-t border-[#e8e8e2] pt-4"><h3 className="text-sm font-semibold text-[#292b27]">Equipment</h3><ul className="mt-2 divide-y divide-[#eeeeea]">{selected.equipment.map((equipment) => <li key={equipment.equipmentId} className="flex justify-between gap-4 py-2 text-sm"><span>{equipment.name} × {equipment.quantity}</span><span>{currency(equipment.unitPrice, locale)}</span></li>)}</ul></div>}
			</section></div>}
		</div>
	);
}
