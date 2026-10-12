import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { AdminNotification, CreateAdminNotificationInput, UpdateAdminNotificationInput } from "../types";

export async function listAdminNotifications() {
	const response = await httpClient.get<AdminNotification[]>(endpoints.adminNotifications);
	return response.data;
}

export async function createAdminNotification(input: CreateAdminNotificationInput) {
	const response = await httpClient.post<AdminNotification>(endpoints.adminNotifications, input);
	return response.data;
}

export async function updateAdminNotification(id: string, input: UpdateAdminNotificationInput) {
	const response = await httpClient.patch<AdminNotification>(`${endpoints.adminNotifications}/${encodeURIComponent(id)}`, input);
	return response.data;
}

export async function deleteAdminNotification(id: string) {
	await httpClient.delete(`${endpoints.adminNotifications}/${encodeURIComponent(id)}`);
}