import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type { AdminUser, AdminUserStatus, CreateAdminUserInput, ListAdminUsersParams, UpdateAdminUserInput } from "../types";

export async function listAdminUsers(params: ListAdminUsersParams = {}) {
	const response = await httpClient.get<PagedResponse<AdminUser>>(endpoints.admin.users, { params });
	return response.data;
}

export async function getAdminUserById(userId: string) {
	const response = await httpClient.get<AdminUser>(`${endpoints.admin.users}/${encodeURIComponent(userId)}`);
	return response.data;
}

export async function createAdminUser(input: CreateAdminUserInput) {
	const response = await httpClient.post<AdminUser>(endpoints.admin.users, input);
	return response.data;
}

export async function updateAdminUser(userId: string, input: UpdateAdminUserInput) {
	const response = await httpClient.put<AdminUser>(`${endpoints.admin.users}/${encodeURIComponent(userId)}`, input);
	return response.data;
}

export async function deleteAdminUser(userId: string) {
	await httpClient.delete(`${endpoints.admin.users}/${encodeURIComponent(userId)}`);
}

export async function updateAdminUserStatus(userId: string, status: AdminUserStatus) {
	const response = await httpClient.patch<AdminUser>(`${endpoints.admin.users}/${encodeURIComponent(userId)}/status`, { status });
	return response.data;
}