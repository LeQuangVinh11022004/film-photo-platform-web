import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type { AdminProvider, AdminProviderApprovalStatus, ListAdminProvidersParams } from "../types";

export async function listAdminProviders(params: ListAdminProvidersParams = {}) {
	const response = await httpClient.get<PagedResponse<AdminProvider>>(endpoints.admin.providers, { params });
	return response.data;
}

export async function getAdminProviderById(providerId: string) {
	const response = await httpClient.get<AdminProvider>(`${endpoints.admin.providers}/${encodeURIComponent(providerId)}`);
	return response.data;
}

export async function updateAdminProviderApproval(providerId: string, approvalStatus: AdminProviderApprovalStatus) {
	const response = await httpClient.patch<AdminProvider>(
		`${endpoints.admin.providers}/${encodeURIComponent(providerId)}/approval`,
		{ approvalStatus },
	);
	return response.data;
}
