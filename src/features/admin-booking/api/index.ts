import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type { AdminBooking, AdminBookingDetail, ListAdminBookingsParams } from "../types";

export async function listAdminBookings(params: ListAdminBookingsParams = {}) {
	const response = await httpClient.get<PagedResponse<AdminBooking>>(endpoints.admin.bookings, { params });
	return response.data;
}

export async function getAdminBookingById(bookingId: string) {
	const response = await httpClient.get<AdminBookingDetail>(`${endpoints.admin.bookings}/${encodeURIComponent(bookingId)}`);
	return response.data;
}
