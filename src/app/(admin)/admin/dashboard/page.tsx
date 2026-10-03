"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";

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

const attentionItems = [
	{ title: "providerReview", count: "08", href: "/users", tone: "text-[#9a6a20] bg-[#f8edd9]" },
	{ title: "reservationSupport", count: "12", href: "/reports", tone: "text-[#a34d42] bg-[#f5e4e1]" },
	{ title: "newStudios", count: "05", href: "/users", tone: "text-[#39724b] bg-[#e5f0e8]" },
];

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
	const { messages } = useAdminLanguage();
	const t = messages.dashboard;
	const periodKey = period === "7d" ? "d7" : period === "30d" ? "d30" : "d90";
	const current = periodData[period];

	const metrics = [
		{ label: t.metricRevenue, value: current.revenue, change: "+8.6%", note: t.previousPeriod, color: "text-[#39724b]" },
		{ label: t.metricReservations, value: current.bookings, change: "+12.8%", note: t.previousPeriod, color: "text-[#39724b]" },
		{ label: t.metricStudios, value: "86", change: "+5.2%", note: t.studiosAdded, color: "text-[#39724b]" },
		{ label: t.metricMembers, value: "2,408", change: "+16.4%", note: t.membersJoined, color: "text-[#39724b]" },
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
					<span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">{messages.common.sampleData}</span>
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

			<section aria-label="Platform metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric) => (
					<article key={metric.label} className="rounded-lg border border-[#e0e0da] bg-white p-5">
						<p className="text-sm font-medium text-[#686a64]">{metric.label}</p>
						<p className="mt-3 text-[28px] font-semibold leading-none text-[#20221f]">{metric.value}</p>
						<p className="mt-3 text-xs text-[#777973]"><span className={`mr-1.5 font-semibold ${metric.color}`}>{metric.change}</span>{metric.note}</p>
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
								<span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#39724b]" />{t.legendReservations}</span>
								<span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#d4a33b]" />{t.legendValue}</span>
						</div>
					</div>
					<div className="mt-7 grid h-48 grid-cols-7 items-end gap-2 border-b border-[#e8e8e2] px-1 sm:gap-4">
						{current.bars.map((height, index) => (
							<div key={`${period}-${index}`} className="flex h-full flex-col items-center justify-end gap-2">
								<div className="flex h-[86%] w-full max-w-12 items-end justify-center gap-1">
									<span className="w-2/5 rounded-t-sm bg-[#39724b]" style={{ height: `${height}%` }} />
									<span className="w-2/5 rounded-t-sm bg-[#d4a33b]" style={{ height: `${Math.max(16, height - 17)}%` }} />
								</div>
								<span className="h-6 text-[10px] text-[#82837d] sm:text-xs">{t.chartLabels[periodKey][index]}</span>
							</div>
						))}
					</div>
					<div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
							<div><p className="text-xs text-[#777973]">{t.metricRevenue}</p><p className="mt-1 text-lg font-semibold text-[#20221f]">{current.revenue}</p></div>
							<div><p className="text-xs text-[#777973]">{t.metricReservations}</p><p className="mt-1 text-lg font-semibold text-[#20221f]">{current.bookings}</p></div>
					</div>
				</article>

				<article className="rounded-lg border border-[#e0e0da] bg-white p-5 sm:p-6">
					<div className="flex items-start justify-between gap-3">
						<div><h2 className="text-base font-semibold text-[#20221f]">{t.statusTitle}</h2><p className="mt-1 text-sm text-[#777973]">{t.statusDescription}</p></div>
						<Link href="/reports" className="text-xs font-semibold text-[#39724b] hover:underline">{messages.nav.reports}</Link>
					</div>
					<div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center xl:gap-4">
						<div className="relative h-40 w-40 shrink-0">
							<svg viewBox="0 0 180 180" role="group" aria-label={t.statusTitle} className="h-full w-full overflow-visible">
								{chartSegments.map((segment) => (
									<path
										key={segment.label}
										d={donutSegmentPath(segment.start, segment.end)}
										fill={segment.color}
										stroke="white"
										strokeWidth="2"
										role="img"
										tabIndex={0}
										aria-label={`${segment.label}: ${segment.count} ${t.metricReservations.toLowerCase()}, ${segment.percentage}%`}
										className="cursor-pointer outline-none transition-opacity hover:opacity-80 focus:opacity-80"
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

			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,1fr)]">
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

				<article className="rounded-lg border border-[#e0e0da] bg-white">
					<div className="border-b border-[#e8e8e2] px-5 py-4 sm:px-6"><h2 className="text-base font-semibold text-[#20221f]">{t.needsTitle}</h2><p className="mt-1 text-sm text-[#777973]">{t.needsDescription}</p></div>
					<ul className="divide-y divide-[#eeeeea]">
						{attentionItems.map((item) => (
							<li key={item.title}>
								<Link href={item.href} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#fafaf8] sm:px-6">
									<span className="text-sm font-medium text-[#444640]">{t[item.title as "providerReview" | "reservationSupport" | "newStudios"]}</span>
									<span className={`flex h-8 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold ${item.tone}`}>{item.count}</span>
								</Link>
							</li>
						))}
					</ul>
					<div className="flex flex-wrap gap-2 p-5 sm:px-6">
						<Link href="/users" className="rounded-md bg-[#20221f] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#393b36]">{t.manageUsers}</Link>
						<Link href="/reports" className="rounded-md border border-[#d8d8d1] px-3.5 py-2 text-xs font-semibold text-[#454741] transition-colors hover:bg-[#f7f7f3]">{t.openReports}</Link>
					</div>
				</article>
			</section>
		</div>
	);
}
