"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminPagination } from "@/shared/components/AdminPagination";
import { showAdminToast } from "@/features/admin-notification/toast";
import { ActivityHeatmap, AreaTrendChart, LollipopChart, RadialRings } from "@/shared/components/AdminCharts";
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
	{ key: "registrations", values: [18, 24, 20, 31, 26, 39, 34], color: "#39724b" },
	{ key: "repeatBookings", values: [12, 16, 18, 21, 24, 28, 25], color: "#d4a33b" },
	{ key: "providerReviews", values: [4, 6, 5, 8, 7, 9, 11], color: "#647c98" },
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
	const previousRevenueValues = revenueValues.map((value, index) => Math.round(value * [0.86, 0.92, 0.84, 0.9, 0.95, 0.82, 0.88][index % 7]));
	const healthRings = [
		{ key: "confirmed", percentage: 88, color: "#39724b" },
		{ key: "completed", percentage: Math.round(parseFloat(current.completion)), color: "#647c98" },
		{ key: "repeat", percentage: 41, color: "#d4a33b" },
		{ key: "response", percentage: 92, color: "#bf6a59" },
	] as const;
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
					<button type="button" onClick={() => { exportReport(period, messages); showAdminToast({ title: messages.toast.exported, message: messages.toast.exportedDetail, tone: "info" }); }} className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">{messages.common.exportCsv}</button>
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
						<div className="flex items-center gap-4 text-xs text-[#686a64]"><span className="flex items-center gap-2"><span className="h-0.5 w-4 rounded-full bg-[#39724b]" />{t.currentPeriod}</span><span className="flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-[#9a9b94]" />{t.previousPeriodLabel}</span></div>
					</div>
					<AreaTrendChart
						animationKey={`reports-${period}`}
						ariaLabel={t.bookingTrend}
						labels={t.chartLabels[periodKeys[period]]}
						series={[
							{ key: "previous", label: t.previousPeriodLabel, values: previousRevenueValues, color: "#9a9b94", dashed: true, format: (value) => formatChartCurrency(value, locale) },
							{ key: "current", label: t.currentPeriod, values: revenueValues, color: "#39724b", area: true, format: (value) => formatChartCurrency(value, locale) },
							{ key: "reservations", label: t.legendReservations, values: reservationValues, color: "#d4a33b", plot: false, format: (value) => formatChartNumber(value, locale) },
						]}
					/>
					<div className="mt-5 flex flex-wrap gap-8"><div><p className="text-xs text-[#777973]">{t.metricRevenue}</p><p className="mt-1 text-lg font-semibold text-[#20221f]">{current.revenue}</p></div><div><p className="text-xs text-[#777973]">{t.metricReservations}</p><p className="mt-1 text-lg font-semibold text-[#20221f]">{current.reservations}</p></div></div>
				</article>

				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<h2 className="text-base font-semibold text-[#20221f]">{t.funnel}</h2>
					<p className="mt-1 text-sm text-[#777973]">{t.funnelDescription}</p>
					<RadialRings animationKey={`health-${period}`} centerLabel={t.metricCompletion} centerValue={current.completion} items={healthRings.map((ring) => ({ label: t.health[ring.key], percentage: ring.percentage, color: ring.color, detail: `${ring.percentage}%` }))} />
					<div className="mt-7 border-t border-[#e8e8e2] pt-5"><p className="text-xs font-semibold uppercase tracking-widest text-[#777973]">{t.insight}</p><p className="mt-2 text-sm leading-6 text-[#4c4e48]">{t.insightDescription}</p></div>
				</article>
			</section>

			<section className="mt-4 grid gap-4 xl:grid-cols-2">
				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<h2 className="text-base font-semibold text-[#20221f]">{t.userActivity}</h2>
					<p className="mt-1 text-sm text-[#777973]">{t.userActivityDescription}</p>
					<ActivityHeatmap animationKey={`activity-${period}`} columns={t.chartLabels[periodKeys[period]].map((label) => label.replace("Wk ", ""))} rows={accountActivity.map((metric) => ({ key: metric.key, label: t[metric.key], values: [...metric.values], color: metric.color }))} />
				</article>
				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<h2 className="text-base font-semibold text-[#20221f]">{t.servicePerformance}</h2>
					<p className="mt-1 text-sm text-[#777973]">{t.servicePerformanceDescription}</p>
					<LollipopChart color="#39724b" items={servicePerformance.map((service) => ({ key: service.key, label: t.services[service.key], value: service.value, display: formatChartCurrency(service.value, locale), note: `${formatChartNumber(service.bookings, locale)} ${t.metricReservations.toLowerCase()}` }))} />
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
