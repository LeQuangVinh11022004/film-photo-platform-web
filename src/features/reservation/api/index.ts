import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type { ProviderBooking, ProviderBookingAllocation, ProviderBookingCancellation } from "../types";

export const reservationEndpoint = endpoints.reservations;

export async function listProviderBookings(params: { status?: string; page?: number; pageSize?: number } = {}) {
	const response = await httpClient.get<PagedResponse<ProviderBooking>>(endpoints.provider.bookings, { params });
	return response.data;
}

export async function getProviderBooking(bookingId: string) {
	const response = await httpClient.get<ProviderBooking>(`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}`);
	return response.data;
}

export async function checkInProviderBooking(bookingId: string) {
	await httpClient.post(`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/check-in`);
}

export async function checkOutProviderBooking(bookingId: string) {
	await httpClient.post(`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/check-out`);
}

export async function checkInProviderBookingSegment(bookingId: string, scheduleId: string) {
	await httpClient.post(`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/allocations/${encodeURIComponent(scheduleId)}/check-in`);
}

export async function checkOutProviderBookingSegment(bookingId: string, scheduleId: string) {
	await httpClient.post(`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/allocations/${encodeURIComponent(scheduleId)}/check-out`);
}

export async function cancelProviderBooking(bookingId: string) {
	const response = await httpClient.patch<ProviderBookingCancellation>(`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/cancel`);
	return response.data;
}

export async function listProviderBookingAllocations(bookingId: string) {
	const response = await httpClient.get<ProviderBookingAllocation[]>(
		`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/allocations`,
	);
	return response.data;
}

export async function reallocateProviderBookingSchedule(
	bookingId: string,
	scheduleId: string,
	availabilityId: string,
) {
	const response = await httpClient.patch<ProviderBooking>(
		`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/allocations/${encodeURIComponent(scheduleId)}`,
		{ availabilityId },
	);
	return response.data;
}