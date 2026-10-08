"use client";

import { useState } from "react";
import Link from "next/link";

import { PageHeader } from "@/shared/components/PageHeader";

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

const reservationStatus = [
	{ name: "Confirmed", value: 82 },
	{ name: "Pending", value: 18 },
	{ name: "Completed", value: 21 },
	{ name: "Cancelled", value: 7 },
];

const spacePerformance = [
	{ name: "North Light Studio", bookings: 42 },
	{ name: "Darkroom Studio", bookings: 34 },
	{ name: "Film Lab", bookings: 27 },
	{ name: "Portrait Room", bookings: 19 },
	{ name: "Product Studio", bookings: 13 },
];

const upcomingReservations = [
	{
		id: "RES-1001",
		customer: "Nguyen Minh Anh",
		space: "North Light Studio",
		date: "Today",
		time: "10:00 AM – 12:00 PM",
		status: "Confirmed" as const,
	},
	{
		id: "RES-1002",
		customer: "Tran Hoang Nam",
		space: "Darkroom Studio",
		date: "Today",
		time: "02:00 PM – 04:00 PM",
		status: "Confirmed" as const,
	},
	{
		id: "RES-1003",
		customer: "Le Gia Han",
		space: "Film Lab",
		date: "Tomorrow",
		time: "09:00 AM – 11:00 AM",
		status: "Pending" as const,
	},
	{
		id: "RES-1004",
		customer: "Pham Duc Minh",
		space: "Portrait Room",
		date: "Tomorrow",
		time: "01:00 PM – 03:00 PM",
		status: "Confirmed" as const,
	},
];

const metricTrends = {
	revenue: [24, 31, 28, 39, 42, 51, 58],
	reservations: [18, 22, 19, 28, 32, 36, 41],
	spaces: [11, 14, 13, 18, 21, 22, 25],
	equipment: [30, 27, 32, 34, 38, 40, 43],
};

export default function DashboardPage() {
	const [period, setPeriod] = useState<ProviderPeriod>("30d");

	const currentPerformance = performanceData[period];

	const totalReservations = currentPerformance.reduce(
		(total, item) => total + item.reservations,
		0,
	);

	const totalRevenue = currentPerformance.reduce(
		(total, item) => total + item.revenue,
		0,
	);

	return (
		<div className="mx-auto w-full max-w-375">
			<PageHeader
				eyebrow="Provider workspace"
				title="Dashboard"
				description="Monitor your creative services, reservations and business performance."
			/>

			{/* Metrics */}
			<section
				aria-label="Provider metrics"
				className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
			>
				<ProviderMetricCard
					label="Revenue"
					value={`₫${new Intl.NumberFormat("vi-VN").format(totalRevenue)}`}
					change="+12.4%"
					trend={metricTrends.revenue}
					delay={0}
					href="/provider/transaction"
				/>

				<ProviderMetricCard
					label="Reservations"
					value={totalReservations.toLocaleString()}
					change="+8.7%"
					trend={metricTrends.reservations}
					delay={80}
					href="/provider/reservations"
				/>

				<ProviderMetricCard
					label="Creative spaces"
					value="8"
					change="7 active"
					trend={metricTrends.spaces}
					delay={160}
					href="/provider/creative-spaces"
				/>

				<ProviderMetricCard
					label="Equipment"
					value="42"
					change="36 available"
					trend={metricTrends.equipment}
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
					data={reservationStatus}
					total={reservationStatus.reduce(
						(total, item) => total + item.value,
						0,
					)}
				/>
			</section>

			{/* Space performance + upcoming reservations */}
			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.65fr)]">
				<ProviderSpacePerformance data={spacePerformance} />

				<ProviderUpcomingReservations
					data={upcomingReservations}
				/>
			</section>

			{/* Quick links */}
			<section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<Link
					href="/provider/packages"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						Manage packages
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						Update services and package availability.
					</p>
				</Link>

				<Link
					href="/provider/rating-feedback"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						Review feedback
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						See customer ratings and feedback.
					</p>
				</Link>

				<Link
					href="/provider/pricing-policy"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						Pricing policy
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						Manage pricing rules and service rates.
					</p>
				</Link>

				<Link
					href="/provider/transaction"
					className="rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md"
				>
					<p className="text-sm font-semibold text-[#20221f]">
						Transactions
					</p>
					<p className="mt-1 text-xs leading-5 text-[#777973]">
						Track payments and transaction history.
					</p>
				</Link>
			</section>
		</div>
	);
}