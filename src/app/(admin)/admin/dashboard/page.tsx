"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { distributeTotal, formatChartCurrency, formatChartNumber } from "@/shared/utils/adminCharts";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { AdminNotificationCenter, type DashboardNotification } from "@/shared/components/AdminNotificationCenter";
import { AreaTrendChart, ProportionTiles } from "@/shared/components/AdminCharts";
import { getAdminDashboard } from "@/features/admin-dashboard/api";
import type { AdminDashboardStats } from "@/features/admin-dashboard/types";

type Period = "7d" | "30d" | "90d";

const periodData: Record<Period, { bookings: string; revenue: string; bars: number[] }> = {
	"7d": {
		bookings: "326",
		revenue: "$12,840",
		bars: [42, 61, 47, 73, 56, 88, 68],
	},
	"30d": {
		bookings: "1,284",
		revenue: "$48,290",
		bars: [48, 68, 54, 79, 63, 92, 74],
	},
	"90d": {
		bookings: "3,642",
		revenue: "$138,760",
		bars: [38, 54, 62, 48, 72, 84, 96],
	},
};

const activity = [
	{ initials: "MC", name: "Maya Chen", detail: "booking", time: 0, tone: "bg-[#e5f0e8] text-[#39724b]" },
	{ initials: "JL", name: "Jonas Lee", detail: "provider", time: 1, tone: "bg-[#f8edd9] text-[#9a6a20]" },
	{ initials: "AS", name: "Amara Singh", detail: "cancelled", time: 2, tone: "bg-[#f5e4e1] text-[#a34d42]" },
	{ initials: "RP", name: "Rory Patel", detail: "equipment", time: 3, tone: "bg-[#e6ebf2] text-[#526784]" },
];

const operationsQueue = [
	{ id: "provider-review", title: "providerReview", detail: "providerReviewDetail", age: "19h", href: "/users", priority: "high" },
	{ id: "open-disputes", title: "openDisputes", detail: "openDisputesDetail", age: "4h", href: "/disputes", priority: "urgent" },
	{ id: "pending-payments", title: "pendingPayments", detail: "pendingPaymentsDetail", age: "2h", href: "/transactions", priority: "normal" },
] as const;

const serviceMix = [
	{ key: "studios", share: 54, color: "#39724b" },
	{ key: "equipment", share: 29, color: "#d4a33b" },
	{ key: "packages", share: 17, color: "#647c98" },
] as const;

const priorityStyles = {
	urgent: "border-l-[#bf6a59] bg-[#f5e4e1]",
	high: "border-l-[#d4a33b] bg-[#f8edd9]",
	normal: "border-l-[#647c98] bg-[#e6ebf2]",
};

function donutSegmentPath(startPercentage: number, endPercentage: number) {
	const center = 90;
	const outerRadius = 80;
	const innerRadius = 56;
	const startAngle = (startPercentage / 100) * 360 - 90;
	const endAngle = (endPercentage / 100) * 360 - 90;
	const point = (radius: number, angle: number) => {
		const radians = (angle * Math.PI) / 180;
		return { x: center + radius * Math.cos(radians), y: center + radius * Math.sin(radians) };
	};
	const outerStart = point(outerRadius, startAngle);
	const outerEnd = point(outerRadius, endAngle);
	const innerEnd = point(innerRadius, endAngle);
	const innerStart = point(innerRadius, startAngle);
	const largeArc = endPercentage - startPercentage > 50 ? 1 : 0;

	return [
		`M ${outerStart.x} ${outerStart.y}`,
		`A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
		`L ${innerEnd.x} ${innerEnd.y}`,
		`A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
		"Z",
	].join(" ");
}

export default function AdminDashboardPage() {
	const [period, setPeriod] = useState<Period>("30d");
	const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
	const [dashboard, setDashboard] = useState<AdminDashboardStats | null>(null);
	const [dashboardError, setDashboardError] = useState("");
	const { locale, messages } = useAdminLanguage();
	const t = messages.dashboard;
	useEffect(() => {
		let cancelled = false;
		getAdminDashboard()
			.then((data) => { if (!cancelled) setDashboard(data); })
			.catch((error: unknown) => {
				if (cancelled) return;
				if (axios.isAxiosError(error)) {
					const data = error.response?.data as { message?: string } | undefined;
					setDashboardError(data?.message ?? (error.response ? "Could not load dashboard data." : "Cannot reach the backend. Check that the API is running."));
				} else setDashboardError("Could not load dashboard data.");
			});
		return () => { cancelled = true; };
	}, []);
	const periodKey = period === "7d" ? "d7" : period === "30d" ? "d30" : "d90";
	const current = periodData[period];
	const reservationValues = distributeTotal(Number(current.bookings.replaceAll(",", "")), current.bars);
	const revenueValues = distributeTotal(Number(current.revenue.replace(/[^\d]/g, "")), current.bars);
	const totalRevenue = Number(current.revenue.replace(/[^\d]/g, ""));
	const liveMetrics = [
		{ label: t.liveTotalUsers, value: dashboard?.totalUsers },
		{ label: t.liveActiveUsers, value: dashboard?.activeUsers },
		{ label: t.liveTotalBookings, value: dashboard?.totalBookings },
		{ label: t.livePendingBookings, value: dashboard?.pendingBookings },
	];
	const dashboardNotifications: DashboardNotification[] = [
		{ id: "dispute", title: t.alertDisputeTitle, detail: t.alertDisputeDetail, time: t.alertDisputeTime, href: "/disputes" },
		{ id: "provider", title: t.alertProviderTitle, detail: t.alertProviderDetail, time: t.alertProviderTime, href: "/users" },
		{ id: "payment", title: t.alertPaymentTitle, detail: t.alertPaymentDetail, time: t.alertPaymentTime, href: "/transactions" },
	];
	const statusSegments = [
		{ label: t.statuses.confirmed, percentage: 68, color: "#39724b" },
		{ label: t.statuses.pending, percentage: 19, color: "#d4a33b" },
		{ label: t.statuses.completed, percentage: 10, color: "#647c98" },
		{ label: t.statuses.cancelled, percentage: 3, color: "#bf6a59" },
	];
	const totalReservations = Number(current.bookings.replaceAll(",", ""));
	const statusCounts = statusSegments.map((segment) => Math.floor((totalReservations * segment.percentage) / 100));
	const remainingReservations = totalReservations - statusCounts.reduce((total, count) => total + count, 0);
	const roundingOrder = statusSegments
		.map((segment, index) => ({ index, remainder: (totalReservations * segment.percentage) % 100 }))
		.sort((first, second) => second.remainder - first.remainder);
	for (let index = 0; index < remainingReservations; index += 1) {
		statusCounts[roundingOrder[index].index] += 1;
	}
	let statusOffset = 0;
	const chartSegments = statusSegments.map((segment, index) => {
		const start = statusOffset;
		statusOffset += segment.percentage;
		return { ...segment, count: statusCounts[index], start, end: statusOffset };
	});
	const hoveredSegment = chartSegments.find((segment) => segment.label === hoveredStatus);

	return (
		<div className="mx-auto max-w-375">
			<header className="mb-7 flex flex-col justify-between gap-5 border-b border-[#deded8] pb-6 xl:flex-row xl:items-end">
				<div>
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#72736d]">{messages.common.adminWorkspace}</p>
					<h1 className="text-3xl font-semibold text-[#20221f]">{t.title}</h1>
					<p className="mt-2 text-sm text-[#6b6d67]">{t.description}</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<span className="rounded-full border border-[#cfe1d4] bg-[#edf5ef] px-3 py-1.5 text-xs font-medium text-[#39724b]">{dashboard ? t.liveStats : messages.common.loading}</span>
					<AdminNotificationCenter notifications={dashboardNotifications} />
					<div className="inline-flex rounded-lg border border-[#d8d8d1] bg-white p-1" role="group" aria-label={t.periodLabel}>
						{(["7d", "30d", "90d"] as Period[]).map((item) => (
							<button
								key={item}
								type="button"
								aria-pressed={period === item}
								onClick={() => setPeriod(item)}
								className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${period === item ? "bg-[#20221f] text-white" : "text-[#686a64] hover:bg-[#f0f0ec]"}`}
							>
								{messages.common.periods[item === "7d" ? "d7" : item === "30d" ? "d30" : "d90"]}
							</button>
						))}
					</div>
				</div>
			</header>

			{dashboardError && <p role="alert" className="mb-4 rounded-md border border-[#f0d3cf] bg-[#fdf1ef] px-4 py-3 text-sm text-[#7d372f]">{dashboardError}</p>}
			<section aria-label="Platform metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{liveMetrics.map((metric, metricIndex) => (
					<article key={metric.label} style={{ animationDelay: `${metricIndex * 90}ms` }} className="admin-metric rounded-lg border border-[#e0e0da] bg-white p-5">
						<p className="text-sm font-medium text-[#686a64]">{metric.label}</p>
						<p className="mt-3 text-[28px] font-semibold leading-none text-[#20221f]">{metric.value?.toLocaleString(locale === "vi" ? "vi-VN" : "en-US") ?? "—"}</p>
						<p className="mt-4 text-xs leading-5 text-[#777973]">{t.liveStatsNote}</p>
					</article>
				))}
			</section>

			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,1fr)]">
				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
								<h2 className="text-base font-semibold text-[#20221f]">{t.performanceTitle}</h2>
								<p className="mt-1 text-sm text-[#777973]">{t.performanceDescription} · {messages.common.periods[periodKey]}</p>
						</div>
						<div className="flex items-center gap-4 text-xs text-[#686a64]">
								<span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#39724b]" />{t.legendValue}</span>
						</div>
					</div>
					<AreaTrendChart
						animationKey={`dashboard-${period}`}
						ariaLabel={t.performanceTitle}
						labels={t.chartLabels[periodKey]}
						series={[
							{ key: "value", label: t.legendValue, values: revenueValues, color: "#39724b", area: true, format: (value) => formatChartCurrency(value, locale) },
							{ key: "reservations", label: t.legendReservations, values: reservationValues, color: "#d4a33b", plot: false, format: (value) => formatChartNumber(value, locale) },
						]}
					/>
				</article>

				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<div className="flex items-start justify-between gap-3">
						<div><h2 className="text-base font-semibold text-[#20221f]">{t.statusTitle}</h2><p className="mt-1 text-sm text-[#777973]">{t.statusDescription}</p></div>
						<Link href="/reports" className="text-xs font-semibold text-[#39724b] hover:underline">{messages.nav.reports}</Link>
					</div>
					<div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center xl:gap-4">
						<div className="relative h-40 w-40 shrink-0">
							<svg key={period} viewBox="0 0 180 180" role="group" aria-label={t.statusTitle} className="admin-donut-chart h-full w-full overflow-visible">
								{chartSegments.map((segment, index) => (
									<path
										key={segment.label}
										d={donutSegmentPath(segment.start, segment.end)}
										fill={segment.color}
										stroke="white"
										strokeWidth="2"
										role="img"
										tabIndex={0}
										aria-label={`${segment.label}: ${segment.count} ${t.metricReservations.toLowerCase()}, ${segment.percentage}%`}
										className="admin-donut-segment cursor-pointer outline-none transition-opacity hover:opacity-80 focus:opacity-80"
										style={{ animationDelay: `${index * 90}ms` }}
										onPointerEnter={() => setHoveredStatus(segment.label)}
										onPointerLeave={() => setHoveredStatus(null)}
										onFocus={() => setHoveredStatus(segment.label)}
										onBlur={() => setHoveredStatus(null)}
									>
										<title>{`${segment.label}: ${segment.count} · ${segment.percentage}%`}</title>
									</path>
								))}
							</svg>
							<div aria-live="polite" className="pointer-events-none absolute inset-[20%] flex flex-col items-center justify-center rounded-full bg-white text-center">
								<span className="max-w-full truncate px-1 text-[10px] font-medium text-[#777973]">{hoveredSegment?.label ?? t.metricReservations}</span>
								<span className="mt-1 text-lg font-semibold leading-none text-[#20221f]">{hoveredSegment?.count.toLocaleString() ?? current.bookings}</span>
								{hoveredSegment && <span className="mt-1 text-[10px] text-[#777973]">{hoveredSegment.percentage}%</span>}
							</div>
						</div>
						<ul className="grid w-full max-w-xs grid-cols-2 gap-x-4 gap-y-3 sm:max-w-none xl:grid-cols-1">
							{chartSegments.map((segment) => (
								<li key={segment.label} className="flex min-w-0 items-center gap-2 text-sm">
									<span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: segment.color }} />
									<span className="min-w-0 flex-1 truncate text-[#4c4e48]">{segment.label}</span>
									<span className="font-semibold text-[#292b27]">{segment.percentage}%</span>
								</li>
							))}
						</ul>
					</div>
					<div className="mt-7 border-t border-[#e8e8e2] pt-5">
						<p className="text-xs font-semibold uppercase tracking-widest text-[#777973]">{t.platformHealth}</p>
						<div className="mt-3 flex items-center justify-between text-sm"><span className="text-[#4c4e48]">{t.servicesOperational}</span><span className="inline-flex items-center gap-2 font-semibold text-[#39724b]"><span className="h-2 w-2 rounded-full bg-[#55a16c]" />{t.allSystems}</span></div>
					</div>
				</article>
			</section>

			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(230px,0.8fr)_minmax(280px,1fr)]">
				<article className="min-w-0 rounded-lg border border-[#e0e0da] bg-white">
					<div className="flex items-center justify-between gap-3 border-b border-[#e8e8e2] px-5 py-4 sm:px-6">
						<div><h2 className="text-base font-semibold text-[#20221f]">{t.recentTitle}</h2><p className="mt-1 text-sm text-[#777973]">{t.recentDescription}</p></div>
						<Link href="/reports" className="text-sm font-semibold text-[#39724b] hover:underline">{t.viewAll}</Link>
					</div>
					<ul className="divide-y divide-[#eeeeea]">
						{activity.map((item) => (
							<li key={item.name} className="flex items-center gap-3 px-5 py-4 sm:px-6">
								<span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${item.tone}`}>{item.initials}</span>
								<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#292b27]">{item.name}</p><p className="mt-0.5 truncate text-xs text-[#777973]">{t.activity[item.detail as keyof typeof t.activity]}</p></div>
								<time className="shrink-0 text-xs text-[#858680]">{t.activity.times[item.time]}</time>
							</li>
						))}
					</ul>
				</article>

				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<div><h2 className="text-base font-semibold text-[#20221f]">{t.serviceMixTitle}</h2><p className="mt-1 text-sm text-[#777973]">{t.serviceMixDescription}</p></div>
					<ProportionTiles items={serviceMix.map((service) => ({ label: t.serviceMix[service.key], share: service.share, value: formatChartCurrency(Math.round(totalRevenue * service.share / 100), locale), color: service.color }))} key={period} />
					<p className="mt-5 border-t border-[#e8e8e2] pt-4 text-xs text-[#777973]">{messages.common.sampleData} · {messages.common.periods[periodKey]}</p>
				</article>

				<article className="overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
					<div className="flex items-start justify-between gap-3 border-b border-[#e8e8e2] px-5 py-4 sm:px-6">
						<div><h2 className="text-base font-semibold text-[#20221f]">{t.opsTitle}</h2><p className="mt-1 text-sm text-[#777973]">{t.opsDescription}</p></div>
						<span className="shrink-0 rounded-md bg-[#f5e4e1] px-2 py-1 text-xs font-semibold text-[#a34d42]">{operationsQueue.length} {t.openItems}</span>
					</div>
					<ol className="space-y-3 p-4 sm:p-5">
						{operationsQueue.map((item, index) => <li key={item.id}>
							<div className={`rounded-r-md border-l-[3px] p-3.5 ${priorityStyles[item.priority]}`}>
								<div className="flex items-start justify-between gap-3">
									<div className="flex min-w-0 items-start gap-2.5">
										<span className="mt-0.5 text-xs font-bold tabular-nums opacity-70">0{index + 1}</span>
										<div className="min-w-0"><p className="text-sm font-semibold text-[#292b27]">{t[item.title]}</p><p className="mt-1 text-xs leading-5 text-[#686a64]">{t[item.detail]}</p></div>
									</div>
									<span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#686a64]"><Clock3 size={12} />{item.age}</span>
								</div>
								<Link href={item.href} className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#20221f] hover:underline">{t.reviewItem}<ArrowUpRight size={13} /></Link>
							</div>
						</li>)}
					</ol>
					<div className="flex items-center justify-between gap-3 border-t border-[#e8e8e2] px-5 py-3 sm:px-6">
						<span className="text-xs text-[#777973]">{messages.common.sampleData}</span>
						<Link href="/reports" className="inline-flex items-center gap-1 text-xs font-semibold text-[#39724b] hover:underline">{t.openReports}<ArrowUpRight size={13} /></Link>
					</div>
				</article>
			</section>
		</div>
	);
}
