import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { AdminUser, CreateAdminUserInput, UpdateAdminUserInput } from "../types";

export async function listAdminUsers() {
	const response = await httpClient.get<AdminUser[]>(endpoints.users);
	return response.data;
}

export async function createAdminUser(input: CreateAdminUserInput) {
	const response = await httpClient.post<AdminUser>(endpoints.users, input);
	return response.data;
}

export async function updateAdminUser(id: string, input: UpdateAdminUserInput) {
	const response = await httpClient.patch<AdminUser>(`${endpoints.users}/${encodeURIComponent(id)}`, input);
	return response.data;
}

export async function deleteAdminUser(id: string) {
	await httpClient.delete(`${endpoints.users}/${encodeURIComponent(id)}`);
}