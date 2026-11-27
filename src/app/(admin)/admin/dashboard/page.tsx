"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { PageHeader } from "@/shared/components/PageHeader";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";
import { getAdminDashboard } from "@/features/admin-dashboard/api";
import type { AdminDashboardStats } from "@/features/admin-dashboard/types";
import {
	loadAdminDashboardCharts,
	type AdminDashboardCharts,
	type TrendPoint,
} from "@/features/admin-dashboard/aggregates";
import { ProviderMetricCard } from "@/shared/components/provider-dashboard";

type ChartMetric = "bookings" | "revenue";

const CHART_COLORS = ["#4d875d", "#c89b42", "#647c98", "#bf6a59", "#7b6d8d"];

const formatCompactCurrency = (value: number) =>
	new Intl.NumberFormat("vi-VN", {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);

const formatFullCurrency = (value: number) =>
	`₫${new Intl.NumberFormat("vi-VN").format(value)}`;

const formatNumber = (value: number) =>
	new Intl.NumberFormat("vi-VN").format(value);

export default function AdminDashboardPage() {
	const [metric, setMetric] = useState<ChartMetric>("bookings");
	const [dashboard, setDashboard] = useState<AdminDashboardStats | null>(null);
	const [charts, setCharts] = useState<AdminDashboardCharts | null>(null);
	const [chartsLoading, setChartsLoading] = useState(true);
	const [dashboardError, setDashboardError] = useState("");

	const { locale, messages } = useAdminLanguage();
	const t = messages.dashboard;

	useEffect(() => {
		let cancelled = false;

		getAdminDashboard()
			.then((data) => {
				if (!cancelled) setDashboard(data);
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				if (axios.isAxiosError(error)) {
					const data = error.response?.data as { message?: string } | undefined;
					setDashboardError(
						data?.message ??
							(error.response
								? "Could not load dashboard data."
								: "Cannot reach the backend. Check that the API is running."),
					);
				} else {
					setDashboardError("Could not load dashboard data.");
				}
			});

		loadAdminDashboardCharts()
			.then((data) => {
				if (!cancelled) setCharts(data);
			})
			.catch(() => {
				if (!cancelled) setDashboardError((prev) => prev || t.chartsError);
			})
			.finally(() => {
				if (!cancelled) setChartsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [t.chartsError]);

	const isRevenue = metric === "revenue";
	const trendData = charts?.bookingTrend ?? [];
	const bookingStatusData = charts?.bookingStatus ?? [];
	const totalBookingsCount = bookingStatusData.reduce((acc, item) => acc + item.count, 0);
	const usersByRoleData = charts?.usersByRole ?? [];
	const totalUsersCount = usersByRoleData.reduce((acc, item) => acc + item.count, 0);
	const spacesByStatusData = charts?.spacesByStatus ?? [];
	const totalSpacesCount = spacesByStatusData.reduce((acc, item) => acc + item.count, 0);
	const topProvidersData = charts?.topProviders ?? [];
	const recentBookings = charts?.recentBookings ?? [];

	const formatStatusLabel = (rawKey: string) => {
		const upper = rawKey.toUpperCase();
		if (upper === "CONFIRMED" || upper === "APPROVED") return t.statuses.confirmed;
		if (upper === "PENDING") return t.statuses.pending;
		if (upper === "COMPLETED") return t.statuses.completed;
		if (upper === "CANCELLED" || upper === "REJECTED") return t.statuses.cancelled;
		return rawKey;
	};

	const statusBadgeStyle = (rawStatus: string) => {
		const upper = rawStatus.toUpperCase();
		if (upper === "CONFIRMED" || upper === "COMPLETED" || upper === "APPROVED") {
			return "bg-[#e6f0e8] text-[#39724b]";
		}
		if (upper === "CANCELLED" || upper === "REJECTED") {
			return "bg-[#f5e4e1] text-[#a34d42]";
		}
		return "bg-[#f8edd9] text-[#9a6a20]";
	};

	return (
		<div className="mx-auto w-full max-w-375">
			<PageHeader
				eyebrow={messages.common.adminWorkspace}
				title={t.title}
				description={t.description}
			/>

			{dashboardError && (
				<p
					role="alert"
					className="mb-4 rounded-md border border-[#f0d3cf] bg-[#fdf1ef] px-4 py-3 text-sm text-[#7d372f]"
				>
					{dashboardError}
				</p>
			)}

			{/* Top KPI Metrics from GET /api/admin/dashboard & /api/admin/bookings */}
			<section
				aria-label="Platform metrics"
				className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
			>
				<ProviderMetricCard
					label={t.metricRevenue}
					value={charts ? `${charts.partial ? "~" : ""}${formatFullCurrency(charts.totalRevenue)}` : "—"}
					delay={0}
					href="/transactions"
				/>

				<ProviderMetricCard
					label={t.liveTotalBookings}
					value={dashboard ? dashboard.totalBookings.toLocaleString(locale === "vi" ? "vi-VN" : "en-US") : "—"}
					change={dashboard ? `${dashboard.pendingBookings} ${t.statuses.pending.toLowerCase()}` : undefined}
					delay={80}
					href="/transactions"
				/>

				<ProviderMetricCard
					label={t.metricStudios}
					value={dashboard ? String(dashboard.totalSpaces) : "—"}
					change={dashboard ? `${dashboard.activeSpaces} ${locale === "vi" ? "hoạt động" : "active"}` : undefined}
					delay={160}
					href="/spaces"
				/>

				<ProviderMetricCard
					label={t.liveTotalUsers}
					value={dashboard ? dashboard.totalUsers.toLocaleString(locale === "vi" ? "vi-VN" : "en-US") : "—"}
					change={dashboard ? `${dashboard.activeUsers} ${locale === "vi" ? "hoạt động" : "active"}` : undefined}
					delay={240}
					href="/users"
				/>
			</section>

			{/* Row 1: 30-Day Live Booking & Revenue BarChart + Booking Status Donut */}
			<section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
				{/* Live Booking & Revenue Trend BarChart */}
				<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0 flex-1">
							<h2 className="text-base font-semibold text-[#20221f]">
								{t.performanceTitle}
							</h2>
							<p className="mt-0.5 truncate text-xs text-[#777973] sm:text-sm">
								{isRevenue ? t.chartRevenueTrend : t.chartBookingTrend}
							</p>
						</div>

						<div className="flex shrink-0 items-center gap-2">
							<div
								className="inline-flex shrink-0 rounded-lg border border-[#dfe1da] bg-[#f8f9f5] p-1"
								role="group"
								aria-label="Chart metric"
							>
								{(["bookings", "revenue"] as ChartMetric[]).map((item) => (
									<button
										key={item}
										type="button"
										aria-pressed={metric === item}
										onClick={() => setMetric(item)}
										className={`w-28 rounded-md py-1.5 text-center text-xs font-semibold transition-colors duration-150 ${
											metric === item
												? "bg-[#20221f] text-white shadow-sm"
												: "text-[#70736c] hover:bg-white hover:text-[#20221f]"
										}`}
									>
										{item === "bookings" ? t.chartLegendBookings : t.chartLegendRevenue}
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="mt-6 h-70 w-full min-w-0 sm:h-80">
						{chartsLoading ? (
							<div className="flex h-full items-center justify-center text-sm text-[#777973]">
								{t.chartsLoading}
							</div>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={trendData}
									margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
								>
									<CartesianGrid
										stroke="#eceee8"
										strokeDasharray="3 3"
										vertical={false}
									/>
									<XAxis
										dataKey="label"
										axisLine={false}
										tickLine={false}
										interval={3}
										tick={{ fontSize: 11, fill: "#858880" }}
										dy={8}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										width={52}
										allowDecimals={false}
										tick={{ fontSize: 11, fill: "#858880" }}
										tickFormatter={isRevenue ? formatCompactCurrency : formatNumber}
										dx={-4}
									/>
									<Tooltip
										cursor={{ fill: "rgba(77, 135, 93, 0.06)" }}
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const point = payload[0].payload as TrendPoint;
											return (
												<div className="rounded-xl border border-[#dedfd9] bg-white p-3 shadow-xl">
													<p className="text-xs font-medium text-[#70736c]">
														{point.date}
													</p>
													<p className="mt-1 text-sm font-semibold text-[#20221f]">
														{isRevenue
															? formatFullCurrency(point.revenue)
															: `${formatNumber(point.bookings)} ${t.chartLegendBookings}`}
													</p>
												</div>
											);
										}}
									/>
									<Bar
										dataKey={metric}
										fill="#4d875d"
										radius={[6, 6, 0, 0]}
										maxBarSize={32}
										animationDuration={650}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</article>

				{/* Live Booking Status Donut Chart */}
				<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-base font-semibold text-[#20221f]">
								{t.statusTitle}
							</h2>
							<p className="mt-1 text-sm text-[#777973]">
								{t.statusDescription}
							</p>
						</div>
						<Link
							href="/transactions"
							className="shrink-0 text-xs font-semibold text-[#4d875d] transition-colors hover:text-[#376844]"
						>
							{t.viewAll}
						</Link>
					</div>

					<div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
						<div className="relative h-44 w-44 shrink-0">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={bookingStatusData.map((s) => ({
											name: formatStatusLabel(s.key),
											value: s.count,
										}))}
										dataKey="value"
										nameKey="name"
										innerRadius={57}
										outerRadius={78}
										paddingAngle={2}
										stroke="none"
										animationDuration={700}
									>
										{bookingStatusData.map((item, index) => (
											<Cell
												key={item.key}
												fill={CHART_COLORS[index % CHART_COLORS.length]}
												className="cursor-pointer opacity-90 transition-opacity duration-200 hover:opacity-70"
											/>
										))}
									</Pie>
									<Tooltip
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const item = payload[0];
											return (
												<div className="rounded-lg border border-[#dedfd9] bg-white px-3 py-2 shadow-lg">
													<p className="text-xs font-medium text-[#70736c]">
														{item.name}
													</p>
													<p className="mt-1 text-sm font-semibold text-[#20221f]">
														{item.value}
													</p>
												</div>
											);
										}}
									/>
								</PieChart>
							</ResponsiveContainer>

							<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-2xl font-semibold text-[#20221f]">
									{totalBookingsCount}
								</span>
								<span className="mt-1 text-[10px] uppercase tracking-wider text-[#858880]">
									{t.metricReservations}
								</span>
							</div>
						</div>

						<ul className="w-full max-w-xs space-y-3">
							{bookingStatusData.length === 0 && !chartsLoading && (
								<li className="text-xs text-[#777973]">{t.chartNoData}</li>
							)}
							{bookingStatusData.map((item, index) => {
								const percentage =
									totalBookingsCount > 0
										? Math.round((item.count / totalBookingsCount) * 100)
										: 0;
								return (
									<li
										key={item.key}
										className="flex items-center justify-between text-xs"
									>
										<div className="flex items-center gap-2">
											<span
												className="h-2.5 w-2.5 rounded-full"
												style={{
													backgroundColor:
														CHART_COLORS[index % CHART_COLORS.length],
												}}
											/>
											<span className="font-medium text-[#20221f]">
												{formatStatusLabel(item.key)}
											</span>
										</div>
										<div className="flex items-center gap-2 text-[#70736c]">
											<span className="font-semibold text-[#20221f]">
												{item.count}
											</span>
											<span className="text-[11px] text-[#858880]">
												({percentage}%)
											</span>
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				</article>
			</section>

			{/* Row 2: Users by Role Donut + Spaces by Status Donut + Top Providers BarChart */}
			<section className="mt-4 grid gap-4 xl:grid-cols-3">
				{/* Users by Role */}
				<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-base font-semibold text-[#20221f]">
								{t.chartUsersByRole}
							</h2>
							<p className="mt-1 text-sm text-[#777973]">
								{t.liveTotalUsers}: {totalUsersCount}
							</p>
						</div>
						<Link
							href="/users"
							className="shrink-0 text-xs font-semibold text-[#4d875d] hover:text-[#376844]"
						>
							{t.viewAll}
						</Link>
					</div>

					<div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
						<div className="relative h-36 w-36 shrink-0">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={usersByRoleData.map((r) => ({
											name: r.key,
											value: r.count,
										}))}
										dataKey="value"
										nameKey="name"
										innerRadius={45}
										outerRadius={64}
										paddingAngle={2}
										stroke="none"
										animationDuration={700}
									>
										{usersByRoleData.map((item, index) => (
											<Cell
												key={item.key}
												fill={CHART_COLORS[index % CHART_COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
							<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-xl font-semibold text-[#20221f]">
									{totalUsersCount}
								</span>
								<span className="text-[10px] uppercase tracking-wider text-[#858880]">
									{t.chartLegendUsers}
								</span>
							</div>
						</div>

						<ul className="w-full space-y-2.5">
							{usersByRoleData.map((item, index) => {
								const pct =
									totalUsersCount > 0
										? Math.round((item.count / totalUsersCount) * 100)
										: 0;
								return (
									<li
										key={item.key}
										className="flex items-center justify-between text-xs"
									>
										<div className="flex items-center gap-2">
											<span
												className="h-2.5 w-2.5 rounded-full"
												style={{
													backgroundColor:
														CHART_COLORS[index % CHART_COLORS.length],
												}}
											/>
											<span className="font-medium text-[#20221f]">
												{item.key}
											</span>
										</div>
										<span className="font-semibold text-[#20221f]">
											{item.count}{" "}
											<span className="font-normal text-[#858880]">({pct}%)</span>
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				</article>

				{/* Spaces by Status */}
				<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-base font-semibold text-[#20221f]">
								{t.chartSpacesByStatus}
							</h2>
							<p className="mt-1 text-sm text-[#777973]">
								{t.metricStudios}: {totalSpacesCount}
							</p>
						</div>
						<Link
							href="/spaces"
							className="shrink-0 text-xs font-semibold text-[#4d875d] hover:text-[#376844]"
						>
							{t.viewAll}
						</Link>
					</div>

					<div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
						<div className="relative h-36 w-36 shrink-0">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={spacesByStatusData.map((s) => ({
											name: s.key,
											value: s.count,
										}))}
										dataKey="value"
										nameKey="name"
										innerRadius={45}
										outerRadius={64}
										paddingAngle={2}
										stroke="none"
										animationDuration={700}
									>
										{spacesByStatusData.map((item, index) => (
											<Cell
												key={item.key}
												fill={CHART_COLORS[index % CHART_COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
							<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-xl font-semibold text-[#20221f]">
									{totalSpacesCount}
								</span>
								<span className="text-[10px] uppercase tracking-wider text-[#858880]">
									Spaces
								</span>
							</div>
						</div>

						<ul className="w-full space-y-2.5">
							{spacesByStatusData.map((item, index) => {
								const pct =
									totalSpacesCount > 0
										? Math.round((item.count / totalSpacesCount) * 100)
										: 0;
								return (
									<li
										key={item.key}
										className="flex items-center justify-between text-xs"
									>
										<div className="flex items-center gap-2">
											<span
												className="h-2.5 w-2.5 rounded-full"
												style={{
													backgroundColor:
														CHART_COLORS[index % CHART_COLORS.length],
												}}
											/>
											<span className="font-medium text-[#20221f]">
												{item.key}
											</span>
										</div>
										<span className="font-semibold text-[#20221f]">
											{item.count}{" "}
											<span className="font-normal text-[#858880]">({pct}%)</span>
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				</article>

				{/* Top Providers / Studios by Bookings */}
				<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-base font-semibold text-[#20221f]">
								{t.chartTopProviders}
							</h2>
							<p className="mt-1 text-sm text-[#777973]">
								{t.serviceMixDescription}
							</p>
						</div>
						<Link
							href="/providers"
							className="shrink-0 text-xs font-semibold text-[#4d875d] hover:text-[#376844]"
						>
							{t.viewAll}
						</Link>
					</div>

					<div className="mt-5 h-44 w-full min-w-0">
						{topProvidersData.length === 0 ? (
							<div className="flex h-full items-center justify-center text-sm text-[#777973]">
								{chartsLoading ? t.chartsLoading : t.chartNoData}
							</div>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={topProvidersData}
									layout="vertical"
									margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
								>
									<XAxis
										type="number"
										allowDecimals={false}
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 11, fill: "#858880" }}
									/>
									<YAxis
										type="category"
										dataKey="name"
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 11, fill: "#343631" }}
										width={120}
									/>
									<Tooltip
										cursor={{ fill: "rgba(77, 135, 93, 0.06)" }}
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const item = payload[0].payload as {
												name: string;
												bookings: number;
												revenue: number;
											};
											return (
												<div className="rounded-xl border border-[#dedfd9] bg-white p-3 shadow-xl">
													<p className="text-xs font-medium text-[#70736c]">
														{item.name}
													</p>
													<p className="mt-1 text-sm font-semibold text-[#20221f]">
														{item.bookings} {t.chartLegendBookings.toLowerCase()} ·{" "}
														{formatFullCurrency(item.revenue)}
													</p>
												</div>
											);
										}}
									/>
									<Bar
										dataKey="bookings"
										fill="#4d875d"
										radius={[0, 6, 6, 0]}
										barSize={16}
										animationDuration={650}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</article>
			</section>

			{/* Row 3: Live Recent Bookings from /api/admin/bookings */}
			<section className="mt-4">
				<article className="rounded-xl border border-[#e2e4dd] bg-white">
					<div className="flex items-start justify-between gap-4 border-b border-[#eeeeea] px-5 py-5 sm:px-6">
						<div>
							<h2 className="text-base font-semibold text-[#20221f]">
								{t.recentTitle}
							</h2>
							<p className="mt-1 text-sm text-[#777973]">
								{t.recentDescription}
							</p>
						</div>
						<Link
							href="/transactions"
							className="shrink-0 text-xs font-semibold text-[#4d875d] hover:text-[#376844]"
						>
							{t.viewAll}
						</Link>
					</div>

					<div className="divide-y divide-[#eeeeea]">
						{recentBookings.length === 0 && (
							<p className="px-5 py-8 text-center text-sm text-[#777973] sm:px-6">
								{chartsLoading ? t.chartsLoading : t.chartNoData}
							</p>
						)}
						{recentBookings.map((booking, index) => (
							<div
								key={`${booking.bookingId}-${index}`}
								className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#fafbf8] sm:flex-row sm:items-center sm:px-6"
							>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="truncate text-sm font-semibold text-[#292b27]">
											{booking.photographerName}
										</p>
										<span
											className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeStyle(
												booking.status,
											)}`}
										>
											{formatStatusLabel(booking.status)}
										</span>
									</div>
									<p className="mt-1 truncate text-xs text-[#70736c]">
										{booking.spaceName}
										{booking.providerName ? ` · ${booking.providerName}` : ""}
									</p>
								</div>

								<div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
									<span className="text-xs font-semibold text-[#20221f]">
										{formatFullCurrency(booking.totalAmount)}
									</span>
									<span className="text-[11px] text-[#858880]">
										{booking.bookingDate} · {booking.startTime.slice(0, 5)} –{" "}
										{booking.endTime.slice(0, 5)}
									</span>
								</div>
							</div>
						))}
					</div>
				</article>
			</section>
		</div>
	);
}
