import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type { AdminSpace, AdminSpaceRequest, ListAdminSpacesParams } from "../types";

export async function listAdminSpaces(params: ListAdminSpacesParams = {}) {
	const response = await httpClient.get<PagedResponse<AdminSpace>>(endpoints.admin.spaces, { params });
	return response.data;
}

export async function getAdminSpaceById(spaceId: string) {
	const response = await httpClient.get<AdminSpace>(`${endpoints.admin.spaces}/${encodeURIComponent(spaceId)}`);
	return response.data;
}

export async function createAdminSpace(input: AdminSpaceRequest) {
	const response = await httpClient.post<AdminSpace>(endpoints.admin.spaces, input);
	return response.data;
}

export async function updateAdminSpace(spaceId: string, input: AdminSpaceRequest) {
	const response = await httpClient.put<AdminSpace>(`${endpoints.admin.spaces}/${encodeURIComponent(spaceId)}`, input);
	return response.data;
}

export async function deleteAdminSpace(spaceId: string) {
	await httpClient.delete(`${endpoints.admin.spaces}/${encodeURIComponent(spaceId)}`);
}
