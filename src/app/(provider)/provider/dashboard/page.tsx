"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/PageHeader";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";
import { listMyProviderSpaces } from "@/features/provider-space/api";
import { listMyProviderEquipment } from "@/features/equipment/api";
import { listProviderBookings } from "@/features/reservation/api";
import { listMyProviderServicePackages } from "@/features/service-package/api";
import { getMyProviderDashboard } from "@/features/provider-dashboard/api";
import type { ProviderDashboard } from "@/features/provider-dashboard/types";
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

const initialReservationStatus = [
	{ name: "Confirmed", value: 0 },
	{ name: "Pending", value: 0 },
	{ name: "Completed", value: 0 },
	{ name: "Cancelled", value: 0 },
];

const initialSpacePerformance: { name: string; bookings: number }[] = [];

const initialUpcomingReservations: {
	id: string;
	customer: string;
	space: string;
	date: string;
	time: string;
	status: "Confirmed" | "Pending";
}[] = [];

export default function DashboardPage() {
	const [period, setPeriod] = useState<ProviderPeriod>("30d");
	const { messages } = useProviderLanguage();
	const t = messages.dashboard;

	const [dashboardSummary, setDashboardSummary] = useState<ProviderDashboard | null>(null);
	const [liveTotals, setLiveTotals] = useState<{
		totalSpaces: number;
		activeSpaces: number;
		totalEquipment: number;
		activeEquipment: number;
		totalBookings: number;
		liveRevenue: number;
		activePackages: number;
	} | null>(null);
	const [liveStatusDist, setLiveStatusDist] = useState(initialReservationStatus);
	const [liveUpcoming, setLiveUpcoming] = useState(initialUpcomingReservations);
	const [liveSpacePerf, setLiveSpacePerf] = useState(initialSpacePerformance);

	useEffect(() => {
		let cancelled = false;
		Promise.allSettled([
			getMyProviderDashboard(),
			listMyProviderSpaces({ page: 1, pageSize: 50 }),
			listMyProviderEquipment({ page: 1, pageSize: 50 }),
			listProviderBookings({ page: 1, pageSize: 50 }),
			listMyProviderServicePackages({ status: "ACTIVE", page: 1, pageSize: 1 }),
		]).then(([dashRes, spacesRes, eqRes, bookingsRes, pkgRes]) => {
			if (cancelled) return;
			const dash = dashRes.status === "fulfilled" ? dashRes.value : null;
			const spaces = spacesRes.status === "fulfilled" ? spacesRes.value : null;
			const eq = eqRes.status === "fulfilled" ? eqRes.value : null;
			const bookings = bookingsRes.status === "fulfilled" ? bookingsRes.value : null;
			const pkgs = pkgRes.status === "fulfilled" ? pkgRes.value : null;

			if (dash) {
				setDashboardSummary(dash);
			}

			const activeSpaces = dash?.activeSpaces ?? (spaces?.items.filter((s) => s.status.toUpperCase() === "ACTIVE").length ?? 0);
			const activeEq = dash?.activeEquipment ?? (eq?.items.filter((e) => e.status.toUpperCase() === "ACTIVE").length ?? 0);
			const bookingItems = bookings?.items ?? [];
			const revenue = dash?.revenue ?? bookingItems
				.filter((b) => b.status.toUpperCase() !== "CANCELLED")
				.reduce((sum, b) => sum + b.totalAmount, 0);

			setLiveTotals({
				totalSpaces: dash?.totalSpaces ?? (spaces?.totalItems ?? 0),
				activeSpaces,
				totalEquipment: dash?.totalEquipment ?? (eq?.totalItems ?? 0),
				activeEquipment: activeEq,
				totalBookings: bookings?.totalItems ?? ((dash?.pendingBookings ?? 0) + (dash?.confirmedBookings ?? 0)),
				liveRevenue: revenue,
				activePackages: pkgs?.totalItems ?? 0,
			});

			const bySpace = new Map<string, number>();
			for (const s of spaces?.items ?? []) {
				bySpace.set(s.name, 0);
			}

			const counts = { Confirmed: 0, Pending: 0, Completed: 0, Cancelled: 0 };
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
					id: b.bookingId,
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
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const displayRevenue = liveTotals?.liveRevenue ?? 0;
	const displayBookings = liveTotals?.totalBookings ?? 0;

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
					delay={0}
					href="/provider/reservations"
				/>

				<ProviderMetricCard
					label={t.metrics.reservations}
					value={displayBookings.toLocaleString()}
					delay={80}
					href="/provider/reservations"
				/>

				<ProviderMetricCard
					label={t.metrics.creativeSpaces}
					value={String(liveTotals?.totalSpaces ?? 0)}
					change={`${liveTotals?.activeSpaces ?? 0} ${t.metrics.activeSpaces}`}
					delay={160}
					href="/provider/creative-spaces"
				/>

				<ProviderMetricCard
					label={t.metrics.equipment}
					value={String(liveTotals?.totalEquipment ?? 0)}
					change={`${liveTotals?.activeEquipment ?? 0} ${t.metrics.availableEquipment}`}
					delay={240}
					href="/provider/equipment"
				/>
			</section>

			{dashboardSummary && (
				<section
					aria-label="Operational utilization and maintenance"
					className="mt-3 grid gap-3 sm:grid-cols-3"
				>
					<div className="rounded-xl border border-[#e2e4dd] bg-white p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
							Space Occupancy Rate
						</p>
						<p className="mt-1.5 text-2xl font-bold text-[#20221f]">
							{dashboardSummary.occupancyRate.toFixed(1)}%
						</p>
						<p className="mt-1 text-xs text-[#686a64]">
							{dashboardSummary.confirmedBookings} confirmed · {dashboardSummary.pendingBookings} pending
						</p>
					</div>
					<div className="rounded-xl border border-[#e2e4dd] bg-white p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
							Equipment Utilization Rate
						</p>
						<p className="mt-1.5 text-2xl font-bold text-[#20221f]">
							{dashboardSummary.equipmentUtilizationRate.toFixed(1)}%
						</p>
						<p className="mt-1 text-xs text-[#686a64]">
							{dashboardSummary.activeEquipment} / {dashboardSummary.totalEquipment} active units
						</p>
					</div>
					<div className="rounded-xl border border-[#e2e4dd] bg-white p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
							Scheduled Maintenance
						</p>
						<p className="mt-1.5 text-2xl font-bold text-[#20221f]">
							{dashboardSummary.scheduledMaintenance}
						</p>
						<p className="mt-1 text-xs text-[#686a64]">
							Scheduled or in-progress maintenance jobs
						</p>
					</div>
				</section>
			)}

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
					href="/provider/creative-spaces"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						{messages.nav.creativeSpaces}
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						Manage studios, darkrooms, images, and availability slots.
					</p>
				</Link>

				<Link
					href="/provider/equipment"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						{messages.nav.equipment}
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						Manage equipment, darkroom chemicals, and maintenance schedules.
					</p>
				</Link>

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
					href="/provider/reservations"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						{messages.nav.reservations}
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						Review booking requests and manage resource slot allocations.
					</p>
				</Link>
			</section>
		</div>
	);
}
