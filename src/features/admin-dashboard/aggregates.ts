import { listAdminBookings } from "@/features/admin-booking/api";
import type { AdminBooking } from "@/features/admin-booking/types";
import { listAdminSpaces } from "@/features/admin-space/api";
import type { AdminSpace } from "@/features/admin-space/types";
import { listAdminUsers } from "@/features/admin-user/api";
import type { AdminUser } from "@/features/admin-user/types";
import type { PagedResponse } from "@/types";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const TREND_DAYS = 30;
const VALUE_STATUSES = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"];

export type CountItem = { key: string; count: number };
export type TrendPoint = { date: string; label: string; bookings: number; revenue: number };
export type ProviderRevenue = { name: string; bookings: number; revenue: number };

export type AdminDashboardCharts = {
	bookingStatus: CountItem[];
	bookingTrend: TrendPoint[];
	topProviders: ProviderRevenue[];
	usersByRole: CountItem[];
	spacesByStatus: CountItem[];
	recentBookings: AdminBooking[];
	totalRevenue: number;
	/** True when a list had more rows than were fetched, so the charts are based on a partial sample. */
	partial: boolean;
};

async function fetchAll<T>(fetchPage: (page: number) => Promise<PagedResponse<T>>) {
	const items: T[] = [];
	let total = 0;
	for (let page = 1; page <= MAX_PAGES; page += 1) {
		const result = await fetchPage(page);
		items.push(...result.items);
		total = result.totalItems;
		if (result.items.length === 0 || items.length >= total) break;
	}
	return { items, partial: items.length < total };
}

function countBy<T>(rows: T[], keyOf: (row: T) => string): CountItem[] {
	const counts = new Map<string, number>();
	for (const row of rows) {
		const key = keyOf(row);
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return [...counts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

function dateKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function shortDateLabel(isoDate: string) {
	const parts = isoDate.split("-");
	if (parts.length < 3) return isoDate;
	return `${parts[2]}/${parts[1]}`;
}

function buildTrend(bookings: AdminBooking[]): TrendPoint[] {
	const points = new Map<string, TrendPoint>();
	const anchor = new Date();
	anchor.setHours(0, 0, 0, 0);

	for (let offset = TREND_DAYS - 1; offset >= 0; offset -= 1) {
		const date = new Date(anchor);
		date.setDate(anchor.getDate() - offset);
		const key = dateKey(date);
		points.set(key, { date: key, label: shortDateLabel(key), bookings: 0, revenue: 0 });
	}
	for (const booking of bookings) {
		const point = points.get(booking.bookingDate.slice(0, 10));
		if (!point) continue;
		point.bookings += 1;
		if (VALUE_STATUSES.includes(booking.status.toUpperCase())) {
			point.revenue += booking.totalAmount;
		}
	}
	return [...points.values()];
}

function buildTopProviders(bookings: AdminBooking[]): ProviderRevenue[] {
	const totals = new Map<string, ProviderRevenue>();
	for (const booking of bookings) {
		const name = booking.providerName?.trim();
		if (!name) continue;
		const entry = totals.get(name) ?? { name, bookings: 0, revenue: 0 };
		entry.bookings += 1;
		if (VALUE_STATUSES.includes(booking.status.toUpperCase())) {
			entry.revenue += booking.totalAmount;
		}
		totals.set(name, entry);
	}
	return [...totals.values()].sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings).slice(0, 5);
}

export async function loadAdminDashboardCharts(): Promise<AdminDashboardCharts> {
	const [bookings, users, spaces] = await Promise.all([
		fetchAll<AdminBooking>((page) => listAdminBookings({ page, pageSize: PAGE_SIZE })),
		fetchAll<AdminUser>((page) => listAdminUsers({ page, pageSize: PAGE_SIZE })),
		fetchAll<AdminSpace>((page) => listAdminSpaces({ page, pageSize: PAGE_SIZE })),
	]);

	const totalRevenue = bookings.items
		.filter((b) => VALUE_STATUSES.includes(b.status.toUpperCase()))
		.reduce((sum, b) => sum + b.totalAmount, 0);

	return {
		bookingStatus: countBy(bookings.items, (booking) => booking.status.toUpperCase()),
		bookingTrend: buildTrend(bookings.items),
		topProviders: buildTopProviders(bookings.items),
		usersByRole: countBy(users.items, (user) => user.role.toUpperCase()),
		spacesByStatus: countBy(spaces.items, (space) => space.status.toUpperCase()),
		recentBookings: bookings.items.slice(0, 5),
		totalRevenue,
		partial: bookings.partial || users.partial || spaces.partial,
	};
}
