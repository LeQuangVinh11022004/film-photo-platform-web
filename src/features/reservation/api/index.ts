import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type { ProviderBooking, ProviderBookingDecision } from "../types";

export const reservationEndpoint = endpoints.reservations;

export async function listProviderBookings(params: { status?: string; page?: number; pageSize?: number } = {}) {
	const response = await httpClient.get<PagedResponse<ProviderBooking>>(endpoints.provider.bookings, { params });
	return response.data;
}

export async function getProviderBooking(bookingId: string) {
	const response = await httpClient.get<ProviderBooking>(`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}`);
	return response.data;
}

export async function reviewProviderBooking(bookingId: string, decision: ProviderBookingDecision) {
	const response = await httpClient.patch<ProviderBooking>(
		`${endpoints.provider.bookings}/${encodeURIComponent(bookingId)}/decision`,
		{ decision },
	);
	return response.data;
}