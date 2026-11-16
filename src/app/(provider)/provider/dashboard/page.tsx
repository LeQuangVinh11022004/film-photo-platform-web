"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/PageHeader";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";
import { listMyProviderSpaces } from "@/features/provider-space/api";
import { listMyProviderEquipment } from "@/features/equipment/api";
import { listProviderBookings } from "@/features/reservation/api";
import { listMyProviderServicePackages } from "@/features/service-package/api";
import {
	ProviderMetricCard,
	ProviderPerformanceChart,
	ProviderReservationStatus,
	ProviderSpacePerformance,
	ProviderUpcomingReservations,
	type ProviderPeriod,
} from "@/shared/components/provider-dashboard";

const performanceData = {
	"7d": [
		{ label: "02/10", reservations: 8, revenue: 920000 },
		{ label: "03/10", reservations: 12, revenue: 1350000 },
		{ label: "04/10", reservations: 7, revenue: 760000 },
		{ label: "05/10", reservations: 15, revenue: 1680000 },
		{ label: "06/10", reservations: 18, revenue: 2140000 },
		{ label: "07/10", reservations: 24, revenue: 2890000 },
		{ label: "08/10", reservations: 20, revenue: 2310000 },
	],

	"30d": [
		{ label: "W1", reservations: 48, revenue: 6200000 },
		{ label: "W2", reservations: 61, revenue: 7850000 },
		{ label: "W3", reservations: 54, revenue: 7100000 },
		{ label: "W4", reservations: 72, revenue: 9480000 },
	],

	"90d": [
		{ label: "Jan", reservations: 148, revenue: 18200000 },
		{ label: "Feb", reservations: 176, revenue: 22100000 },
		{ label: "Mar", reservations: 194, revenue: 24600000 },
		{ label: "Apr", reservations: 218, revenue: 27900000 },
		{ label: "May", reservations: 236, revenue: 30200000 },
		{ label: "Jun", reservations: 251, revenue: 32800000 },
	],
} satisfies Record<
	ProviderPeriod,
	{ label: string; reservations: number; revenue: number }[]
>;

const fallbackReservationStatus = [
	{ name: "Confirmed", value: 82 },
	{ name: "Pending", value: 18 },
	{ name: "Completed", value: 21 },
	{ name: "Cancelled", value: 7 },
];

const fallbackSpacePerformance = [
	{ name: "North Light Studio", bookings: 42 },
	{ name: "Darkroom Studio", bookings: 34 },
	{ name: "Film Lab", bookings: 27 },
	{ name: "Portrait Room", bookings: 19 },
	{ name: "Product Studio", bookings: 13 },
];

const fallbackUpcomingReservations: {
	id: string;
	customer: string;
	space: string;
	date: string;
	time: string;
	status: "Confirmed" | "Pending";
}[] = [
	{
		id: "RES-1001",
		customer: "Nguyen Minh Anh",
		space: "North Light Studio",
		date: "Today",
		time: "10:00 AM – 12:00 PM",
		status: "Confirmed",
	},
	{
		id: "RES-1002",
		customer: "Tran Hoang Nam",
		space: "Darkroom Studio",
		date: "Today",
		time: "02:00 PM – 04:00 PM",
		status: "Confirmed",
	},
];

export default function DashboardPage() {
	const [period, setPeriod] = useState<ProviderPeriod>("30d");
	const { messages } = useProviderLanguage();
	const t = messages.dashboard;

	const [liveTotals, setLiveTotals] = useState<{
		totalSpaces: number;
		activeSpaces: number;
		totalEquipment: number;
		activeEquipment: number;
		totalBookings: number;
		liveRevenue: number;
		activePackages: number;
	} | null>(null);
	const [liveStatusDist, setLiveStatusDist] = useState(fallbackReservationStatus);
	const [liveUpcoming, setLiveUpcoming] = useState(fallbackUpcomingReservations);
	const [liveSpacePerf, setLiveSpacePerf] = useState(fallbackSpacePerformance);

	useEffect(() => {
		let cancelled = false;
		Promise.allSettled([
			listMyProviderSpaces({ page: 1, pageSize: 50 }),
			listMyProviderEquipment({ page: 1, pageSize: 50 }),
			listProviderBookings({ page: 1, pageSize: 50 }),
			listMyProviderServicePackages({ status: "ACTIVE", page: 1, pageSize: 1 }),
		]).then(([spacesRes, eqRes, bookingsRes, pkgRes]) => {
			if (cancelled) return;
			const spaces = spacesRes.status === "fulfilled" ? spacesRes.value : null;
			const eq = eqRes.status === "fulfilled" ? eqRes.value : null;
			const bookings = bookingsRes.status === "fulfilled" ? bookingsRes.value : null;
			const pkgs = pkgRes.status === "fulfilled" ? pkgRes.value : null;

			const activeSpaces = spaces?.items.filter((s) => s.status.toUpperCase() === "ACTIVE").length ?? 0;
			const activeEq = eq?.items.filter((e) => e.status.toUpperCase() === "ACTIVE").length ?? 0;
			const bookingItems = bookings?.items ?? [];
			const revenue = bookingItems
				.filter((b) => b.status.toUpperCase() !== "CANCELLED")
				.reduce((sum, b) => sum + b.totalAmount, 0);

			setLiveTotals({
				totalSpaces: spaces?.totalItems ?? 0,
				activeSpaces,
				totalEquipment: eq?.totalItems ?? 0,
				activeEquipment: activeEq,
				totalBookings: bookings?.totalItems ?? 0,
				liveRevenue: revenue,
				activePackages: pkgs?.totalItems ?? 0,
			});

			if (bookingItems.length > 0) {
				const counts = { Confirmed: 0, Pending: 0, Completed: 0, Cancelled: 0 };
				const bySpace = new Map<string, number>();
				for (const b of bookingItems) {
					const st = b.status.toUpperCase();
					if (st === "CONFIRMED") counts.Confirmed += 1;
					else if (st === "COMPLETED") counts.Completed += 1;
					else if (st === "CANCELLED") counts.Cancelled += 1;
					else counts.Pending += 1;

					bySpace.set(b.spaceName, (bySpace.get(b.spaceName) ?? 0) + 1);
				}
				setLiveStatusDist([
					{ name: "Confirmed", value: counts.Confirmed },
					{ name: "Pending", value: counts.Pending },
					{ name: "Completed", value: counts.Completed },
					{ name: "Cancelled", value: counts.Cancelled },
				]);
				setLiveSpacePerf(
					[...bySpace.entries()]
						.map(([name, bk]) => ({ name, bookings: bk }))
						.sort((a, b) => b.bookings - a.bookings)
						.slice(0, 5),
				);
				setLiveUpcoming(
					bookingItems.slice(0, 4).map((b) => ({
						id: b.bookingId.slice(0, 8).toUpperCase(),
						customer: b.photographerName,
						space: b.spaceName,
						date: b.bookingDate,
						time: `${b.startTime.slice(0, 5)} – ${b.endTime.slice(0, 5)}`,
						status:
							b.status.toUpperCase() === "CONFIRMED"
								? ("Confirmed" as const)
								: ("Pending" as const),
					})),
				);
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const currentPerformance = performanceData[period];
	const fallbackRevenue = currentPerformance.reduce((total, item) => total + item.revenue, 0);
	const displayRevenue = liveTotals ? liveTotals.liveRevenue : fallbackRevenue;
	const displayBookings = liveTotals
		? liveTotals.totalBookings
		: currentPerformance.reduce((total, item) => total + item.reservations, 0);

	return (
		<div className="mx-auto w-full max-w-375">
			<PageHeader
				eyebrow={messages.common.providerWorkspace}
				title={t.title}
				description={t.description}
			/>

			{/* Metrics */}
			<section
				aria-label="Provider metrics"
				className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
			>
				<ProviderMetricCard
					label={t.metrics.revenue}
					value={`₫${new Intl.NumberFormat("vi-VN").format(displayRevenue)}`}
					change={liveTotals ? `${liveTotals.activePackages} active pkgs` : "+12.4%"}
					changeLabel={liveTotals ? "live bookings total" : t.metrics.vsPrevious}
					delay={0}
					href="/provider/transaction"
				/>

				<ProviderMetricCard
					label={t.metrics.reservations}
					value={displayBookings.toLocaleString()}
					change={liveTotals ? "Live API" : "+8.7%"}
					changeLabel={liveTotals ? "from /provider/bookings" : t.metrics.vsPrevious}
					delay={80}
					href="/provider/reservations"
				/>

				<ProviderMetricCard
					label={t.metrics.creativeSpaces}
					value={String(liveTotals?.totalSpaces ?? 8)}
					change={`${liveTotals?.activeSpaces ?? 7} ${t.metrics.activeSpaces}`}
					delay={160}
					href="/provider/creative-spaces"
				/>

				<ProviderMetricCard
					label={t.metrics.equipment}
					value={String(liveTotals?.totalEquipment ?? 42)}
					change={`${liveTotals?.activeEquipment ?? 36} ${t.metrics.availableEquipment}`}
					delay={240}
					href="/provider/equipment"
				/>
			</section>

			{/* Main analytics */}
			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
				<ProviderPerformanceChart
					period={period}
					onPeriodChange={setPeriod}
					data={performanceData}
				/>

				<ProviderReservationStatus
					data={liveStatusDist}
					total={liveStatusDist.reduce((total, item) => total + item.value, 0)}
				/>
			</section>

			{/* Space performance + upcoming reservations */}
			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.65fr)]">
				<ProviderSpacePerformance data={liveSpacePerf} />

				<ProviderUpcomingReservations data={liveUpcoming} />
			</section>

			{/* Quick links */}
			<section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<Link
					href="/provider/packages"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						{t.quickLinks.packages}
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						{t.quickLinks.packagesDetail}
					</p>
				</Link>

				<Link
					href="/provider/rating-feedback"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						{t.quickLinks.feedback}
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						{t.quickLinks.feedbackDetail}
					</p>
				</Link>

				<Link
					href="/provider/pricing-policy"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						{t.quickLinks.pricing}
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						{t.quickLinks.pricingDetail}
					</p>
				</Link>

				<Link
					href="/provider/transaction"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						{t.quickLinks.transactions}
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						{t.quickLinks.transactionsDetail}
					</p>
				</Link>
			</section>
		</div>
	);
}
