import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type { ListProviderSpacesParams, ProviderSpace, ProviderSpaceImage, ProviderSpaceRequest } from "../types";

export async function listMyProviderSpaces(params: ListProviderSpacesParams = {}) {
	const response = await httpClient.get<PagedResponse<ProviderSpace>>(endpoints.provider.spaces, { params });
	return response.data;
}

export async function getMyProviderSpace(spaceId: string) {
	const response = await httpClient.get<ProviderSpace>(`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}`);
	return response.data;
}

export async function createMyProviderSpace(input: ProviderSpaceRequest) {
	const response = await httpClient.post<ProviderSpace>(endpoints.provider.spaces, input);
	return response.data;
}

export async function updateMyProviderSpace(spaceId: string, input: ProviderSpaceRequest) {
	const response = await httpClient.put<ProviderSpace>(`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}`, input);
	return response.data;
}

export async function deleteMyProviderSpace(spaceId: string) {
	await httpClient.delete(`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}`);
}

export async function addMyProviderSpaceImage(spaceId: string, imageUrl: string) {
	const response = await httpClient.post<ProviderSpaceImage>(
		`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/images`,
		{ imageUrl },
	);
	return response.data;
}

export async function deleteMyProviderSpaceImage(spaceId: string, imageId: string) {
	await httpClient.delete(`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/images/${encodeURIComponent(imageId)}`);
}
