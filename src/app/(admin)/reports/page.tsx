"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { distributeTotal, formatChartCurrency, formatChartNumber } from "@/shared/utils/adminCharts";
import type { AdminMessages } from "@/shared/i18n/adminMessages";

type Period = "7d" | "30d" | "90d";

const periods: Record<Period, { revenue: string; reservations: string; average: string; completion: string; values: number[] }> = {
	"7d": { revenue: "$12,840", reservations: "326", average: "$39.39", completion: "91.4%", values: [35, 48, 42, 68, 58, 92, 72] },
	"30d": { revenue: "$48,290", reservations: "1,284", average: "$37.61", completion: "93.2%", values: [42, 59, 48, 74, 63, 92, 78] },
	"90d": { revenue: "$138,760", reservations: "3,642", average: "$38.10", completion: "92.6%", values: [38, 52, 66, 50, 74, 82, 96] },
};

const reportTrends = [[18, 23, 20, 32, 28, 40, 46], [20, 18, 29, 25, 37, 34, 45], [16, 21, 19, 26, 30, 34, 41], [12, 19, 23, 25, 34, 39, 47]];

const periodKeys: Record<Period, "d7" | "d30" | "d90"> = { "7d": "d7", "30d": "d30", "90d": "d90" };

const studioPerformance = [
	{ name: "Northlight Studio", city: "Copenhagen", bookings: 148, value: "$8,920", change: "+18.2%" },
	{ name: "The Slate Room", city: "Amsterdam", bookings: 126, value: "$7,480", change: "+12.6%" },
	{ name: "Goodlight Collective", city: "Berlin", bookings: 104, value: "$6,240", change: "+9.4%" },
	{ name: "Form & Frame", city: "Stockholm", bookings: 92, value: "$5,860", change: "+6.1%" },
	{ name: "Studio No. 8", city: "London", bookings: 87, value: "$5,110", change: "+4.8%" },
];

const accountActivity = [
	{ key: "registrations", values: [18, 24, 20, 31, 26, 39, 34], color: "bg-[#39724b]" },
	{ key: "repeatBookings", values: [12, 16, 18, 21, 24, 28, 25], color: "bg-[#d4a33b]" },
	{ key: "providerReviews", values: [4, 6, 5, 8, 7, 9, 11], color: "bg-[#647c98]" },
] as const;

const servicePerformance = [
	{ key: "portrait", bookings: 286, value: 18640 },
	{ key: "commercial", bookings: 194, value: 24820 },
	{ key: "events", bookings: 158, value: 14280 },
	{ key: "editorial", bookings: 112, value: 8960 },
] as const;

const studioPageSize = 3;

function exportReport(period: Period, messages: AdminMessages) {
	const current = periods[period];
	const t = messages.reports;
	const reportCurrency = new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
	const header = [t.columns.studio, t.columns.city, t.columns.reservations, t.columns.value, t.columns.change];
	const rows: (string | number)[][] = [
		[`${t.reportingPeriod} ${messages.common.periods[periodKeys[period]]}`],
		header,
		...studioPerformance.map((studio) => [studio.name, studio.city, studio.bookings, studio.value, studio.change]),
		[],
		[t.userActivity],
		[t.chartLabels[periodKeys[period]][0], t.registrations, t.repeatBookings, t.providerReviews],
		...t.chartLabels[periodKeys[period]].map((label, index) => [label, accountActivity[0].values[index], accountActivity[1].values[index], accountActivity[2].values[index]]),
		[],
		[t.servicePerformance],
		[t.columns.studio, t.columns.reservations, t.columns.value],
		...servicePerformance.map((service) => [t.services[service.key], service.bookings, reportCurrency.format(service.value)]),
	];
	const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
	const url = URL.createObjectURL(new Blob([`${csv}\n\n${t.metricRevenue},${current.revenue}\n${t.metricReservations},${current.reservations}`], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = `film-photo-report-${period}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}

const fieldClassName = "rounded-md border border-[#d8d8d1] bg-white p-1";

export default function ReportsPage() {
	const [period, setPeriod] = useState<Period>("30d");
	const [studioPage, setStudioPage] = useState(1);
	const { locale, messages } = useAdminLanguage();
	const t = messages.reports;
	const current = periods[period];
	const reservationValues = distributeTotal(Number(current.reservations.replaceAll(",", "")), current.values);
	const revenueValues = distributeTotal(Number(current.revenue.replace(/[^\d]/g, "")), current.values);
	const visibleStudios = studioPerformance.slice((studioPage - 1) * studioPageSize, studioPage * studioPageSize);
	const metrics = [
		{ label: t.metricRevenue, value: current.revenue, change: "+8.6%", trend: reportTrends[0] },
		{ label: t.metricReservations, value: current.reservations, change: "+12.8%", trend: reportTrends[1] },
		{ label: t.metricAverage, value: current.average, change: "+3.1%", trend: reportTrends[2] },
		{ label: t.metricCompletion, value: current.completion, change: "+1.4 pts", trend: reportTrends[3] },
	];

	return (
		<div className="mx-auto max-w-375">
			<PageHeader eyebrow={messages.common.adminWorkspace} title={t.title} description={t.description} />

			<div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
				<div className="flex items-center gap-2"><span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">{messages.common.sampleData}</span><span className="text-sm text-[#777973]">{t.reportingPeriod} {messages.common.periods[periodKeys[period]]}</span></div>
				<div className="flex flex-wrap items-center gap-2">
					<div className={fieldClassName} role="group" aria-label={t.reportingPeriod}>
						{(Object.keys(periods) as Period[]).map((item) => <button key={item} type="button" aria-pressed={period === item} onClick={() => setPeriod(item)} className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${period === item ? "bg-[#20221f] text-white" : "text-[#686a64] hover:bg-[#f0f0ec]"}`}>{messages.common.periods[periodKeys[item]]}</button>)}
					</div>
					<button type="button" onClick={() => exportReport(period, messages)} className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">{messages.common.exportCsv}</button>
				</div>
			</div>

			<section aria-label="Report metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric, metricIndex) => (
					<article key={metric.label} style={{ animationDelay: `${metricIndex * 90}ms` }} className="admin-metric group relative overflow-hidden rounded-lg border border-[#e0e0da] bg-white p-5 transition-transform hover:-translate-y-0.5 hover:shadow-md">
						<p className="text-sm font-medium text-[#686a64]">{metric.label}</p>
						<p className="mt-3 text-[28px] font-semibold leading-none text-[#20221f]">{metric.value}</p>
						<p className="mt-3 max-w-[72%] text-xs"><span className="mr-1.5 font-semibold text-[#39724b]">{metric.change}</span><span className="text-[#777973]">{t.previousPeriod}</span></p>
						<svg aria-hidden="true" viewBox="0 0 100 36" className="admin-sparkline pointer-events-none absolute bottom-4 right-4 h-9 w-20 opacity-60 transition-opacity group-hover:opacity-100"><polyline points={metric.trend.map((point, index) => `${index * 16.5},${34 - point * 0.62}`).join(" ")} fill="none" stroke="#39724b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
					</article>
				))}
			</section>

			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,1fr)]">
				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div><h2 className="text-base font-semibold text-[#20221f]">{t.bookingTrend}</h2><p className="mt-1 text-sm text-[#777973]">{t.bookingTrendDescription}</p></div>
						<div className="flex items-center gap-4 text-xs text-[#686a64]"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#39724b]" />{t.legendValue}</span><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#d4a33b]" />{t.legendReservations}</span></div>
					</div>
					<div className="admin-chart-grid relative mt-7 grid h-52 grid-cols-7 items-end gap-2 border-b border-[#e8e8e2] px-1 sm:gap-4">
						{current.values.map((height, index) => <div key={`${period}-${index}`} className="flex h-full min-w-0 flex-col items-center justify-end gap-1"><div className="flex h-[68%] w-full max-w-12 items-end justify-center gap-1"><span title={`${t.legendReservations}: ${formatChartNumber(reservationValues[index], locale)}`} className="admin-chart-bar w-2/5 rounded-t-sm bg-[#39724b]" style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }} /><span title={`${t.legendValue}: ${formatChartCurrency(revenueValues[index], locale)}`} className="admin-chart-bar w-2/5 rounded-t-sm bg-[#d4a33b]" style={{ height: `${Math.max(18, height - 16)}%`, animationDelay: `${index * 70 + 45}ms` }} /></div><div className="flex min-h-10 w-full flex-col items-center justify-end leading-tight"><span title={`${t.legendReservations}: ${formatChartNumber(reservationValues[index], locale)}`} className="max-w-full truncate text-[9px] font-semibold text-[#39724b]">{formatChartNumber(reservationValues[index], locale)}</span><span title={`${t.legendValue}: ${formatChartCurrency(revenueValues[index], locale)}`} className="max-w-full truncate text-[9px] font-semibold text-[#9a6a20]">{formatChartCurrency(revenueValues[index], locale)}</span><span className="mt-0.5 max-w-full truncate text-[10px] text-[#82837d] sm:text-xs">{t.chartLabels[periodKeys[period]][index]}</span></div></div>)}
						<svg aria-hidden="true" viewBox="0 0 700 180" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-[68%] w-full overflow-visible"><polyline points={current.values.map((value, index) => `${35 + index * 105},${165 - value * 1.3}`).join(" ")} fill="none" stroke="#d4a33b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="admin-trend-line" />{current.values.map((value, index) => <circle key={`${period}-point-${index}`} cx={35 + index * 105} cy={165 - value * 1.3} r="4" fill="#d4a33b" stroke="white" strokeWidth="2" />)}</svg>
					</div>
					<div className="mt-5 flex flex-wrap gap-8"><div><p className="text-xs text-[#777973]">{t.metricRevenue}</p><p className="mt-1 text-lg font-semibold text-[#20221f]">{current.revenue}</p></div><div><p className="text-xs text-[#777973]">{t.metricReservations}</p><p className="mt-1 text-lg font-semibold text-[#20221f]">{current.reservations}</p></div></div>
				</article>

				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<h2 className="text-base font-semibold text-[#20221f]">{t.funnel}</h2>
					<p className="mt-1 text-sm text-[#777973]">{t.funnelDescription}</p>
					<div className="mt-6 space-y-5">
						{[
							{ name: t.statuses.confirmed, amount: "68%", width: "68%", count: "874", color: "bg-[#39724b]" },
							{ name: t.statuses.pending, amount: "19%", width: "19%", count: "244", color: "bg-[#d4a33b]" },
							{ name: t.statuses.completed, amount: "10%", width: "10%", count: "128", color: "bg-[#647c98]" },
							{ name: t.statuses.cancelled, amount: "3%", width: "3%", count: "38", color: "bg-[#bf6a59]" },
						].map((status) => <div key={status.name}><div className="mb-2 flex items-center justify-between text-sm"><span className="text-[#4c4e48]">{status.name}<span className="ml-2 text-xs text-[#858680]">{status.count}</span></span><span className="font-semibold text-[#292b27]">{status.amount}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#eeeee9]"><div className={`h-full rounded-full ${status.color}`} style={{ width: status.width }} /></div></div>)}
					</div>
					<div className="mt-7 border-t border-[#e8e8e2] pt-5"><p className="text-xs font-semibold uppercase tracking-widest text-[#777973]">{t.insight}</p><p className="mt-2 text-sm leading-6 text-[#4c4e48]">{t.insightDescription}</p></div>
				</article>
			</section>

			<section className="mt-4 grid gap-4 xl:grid-cols-2">
				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<h2 className="text-base font-semibold text-[#20221f]">{t.userActivity}</h2>
					<p className="mt-1 text-sm text-[#777973]">{t.userActivityDescription}</p>
					<div className="mt-6 grid gap-5 sm:grid-cols-3">
						{accountActivity.map((metric) => {
							const label = t[metric.key];
							const total = metric.values.reduce((sum, value) => sum + value, 0);
							const peak = Math.max(...metric.values);
							return <div key={metric.key}><p className="truncate text-xs font-medium text-[#686a64]">{label}</p><p className="mt-1 text-xl font-semibold text-[#20221f]">{formatChartNumber(total, locale)}</p><div className="admin-chart-grid mt-3 flex h-16 items-end gap-1 border-b border-[#e8e8e2] px-1">{metric.values.map((value, index) => <span key={`${metric.key}-${index}`} title={`${t.chartLabels[periodKeys[period]][index]}: ${value}`} className={`admin-chart-bar min-w-0 flex-1 rounded-t-sm ${metric.color}`} style={{ height: `${Math.max(10, (value / peak) * 100)}%`, animationDelay: `${index * 60}ms` }} />)}</div><div className="mt-2 flex justify-between gap-1 text-[9px] text-[#82837d]">{t.chartLabels[periodKeys[period]].map((labelText) => <span key={`${metric.key}-${labelText}`}>{labelText.replace("Wk ", "")}</span>)}</div></div>;
						})}
					</div>
				</article>
				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<h2 className="text-base font-semibold text-[#20221f]">{t.servicePerformance}</h2>
					<p className="mt-1 text-sm text-[#777973]">{t.servicePerformanceDescription}</p>
					<div className="mt-5 space-y-4">{servicePerformance.map((service) => <div key={service.key}><div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><span className="text-sm font-medium text-[#4c4e48]">{t.services[service.key]}</span><span className="text-xs text-[#777973]">{formatChartNumber(service.bookings, locale)} {t.metricReservations.toLowerCase()} · <strong className="text-[#292b27]">{formatChartCurrency(service.value, locale)}</strong></span></div><div className="h-2 overflow-hidden rounded-full bg-[#eeeee9]"><div className="admin-meter h-full rounded-full bg-[#39724b]" style={{ width: `${(service.value / Math.max(...servicePerformance.map((item) => item.value))) * 100}%`, animationDelay: `${service.bookings}ms` }} /></div></div>)}</div>
				</article>
			</section>

			<section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e2] px-5 py-4 sm:px-6">
					<div><h2 className="text-base font-semibold text-[#20221f]">{t.topStudios}</h2><p className="mt-1 text-sm text-[#777973]">{t.topStudiosDescription}</p></div>
					<span className="text-xs font-medium text-[#777973]">{t.studiosShown}</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-160 border-collapse text-left">
						<thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]"><tr><th className="px-5 py-3">{t.columns.studio}</th><th className="px-4 py-3">{t.columns.city}</th><th className="px-4 py-3">{t.columns.reservations}</th><th className="px-4 py-3">{t.columns.value}</th><th className="px-5 py-3 text-right">{t.columns.change}</th></tr></thead>
						<tbody className="divide-y divide-[#eeeeea]">{visibleStudios.map((studio, index) => <tr key={studio.name} className="hover:bg-[#fcfcfa]"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#edf2eb] text-xs font-semibold text-[#39724b]">{(studioPage - 1) * studioPageSize + index + 1}</span><span className="text-sm font-semibold text-[#292b27]">{studio.name}</span></div></td><td className="px-4 py-3.5 text-sm text-[#686a64]">{studio.city}</td><td className="px-4 py-3.5 text-sm text-[#4c4e48]">{studio.bookings}</td><td className="px-4 py-3.5 text-sm font-semibold text-[#292b27]">{studio.value}</td><td className="px-5 py-3.5 text-right text-sm font-semibold text-[#39724b]">{studio.change}</td></tr>)}</tbody>
					</table>
				</div>
				<AdminPagination page={studioPage} pageSize={studioPageSize} total={studioPerformance.length} onPageChange={setStudioPage} messages={messages.common} />
			</section>
		</div>
	);
}
