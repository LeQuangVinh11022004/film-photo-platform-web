import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import { providerSpaceImageUrl } from "../imageUrl";
import type {
	ListProviderSpacesParams,
	ProviderFeatureType,
	ProviderSpace,
	ProviderSpaceAvailability,
	ProviderSpaceAvailabilityRequest,
	ProviderSpaceImage,
	ProviderSpaceRequest,
} from "../types";

function normalizeSpace(space: ProviderSpace): ProviderSpace {
	return {
		...space,
		images: (space.images ?? []).map((image) => ({ ...image, imageUrl: providerSpaceImageUrl(image.imageUrl) })),
	};
}

export async function listMyProviderSpaces(params: ListProviderSpacesParams = {}) {
	const response = await httpClient.get<PagedResponse<ProviderSpace>>(endpoints.provider.spaces, { params });
	return { ...response.data, items: response.data.items.map(normalizeSpace) };
}

export async function getMyProviderSpace(spaceId: string) {
	const response = await httpClient.get<ProviderSpace>(`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}`);
	return normalizeSpace(response.data);
}

export async function createMyProviderSpace(input: ProviderSpaceRequest) {
	const response = await httpClient.post<ProviderSpace>(endpoints.provider.spaces, input);
	return normalizeSpace(response.data);
}

export async function updateMyProviderSpace(spaceId: string, input: ProviderSpaceRequest) {
	const response = await httpClient.put<ProviderSpace>(`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}`, input);
	return normalizeSpace(response.data);
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

export async function listProviderFeatureTypes() {
	const response = await httpClient.get<ProviderFeatureType[]>(`${endpoints.provider.spaces}/feature-types`);
	return response.data;
}

export async function listMyProviderSpaceAvailability(spaceId: string, params: { fromDate?: string; toDate?: string } = {}) {
	const response = await httpClient.get<ProviderSpaceAvailability[]>(
		`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/availability`,
		{ params },
	);
	return response.data;
}

export async function createMyProviderSpaceAvailability(spaceId: string, input: ProviderSpaceAvailabilityRequest) {
	const response = await httpClient.post<ProviderSpaceAvailability>(
		`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/availability`,
		input,
	);
	return response.data;
}

export async function updateMyProviderSpaceAvailability(
	spaceId: string,
	availabilityId: string,
	input: ProviderSpaceAvailabilityRequest,
) {
	const response = await httpClient.put<ProviderSpaceAvailability>(
		`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/availability/${encodeURIComponent(availabilityId)}`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderSpaceAvailability(spaceId: string, availabilityId: string) {
	await httpClient.delete(
		`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/availability/${encodeURIComponent(availabilityId)}`,
	);
}

export async function deleteMyProviderSpaceImage(spaceId: string, imageId: string) {
	await httpClient.delete(`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/images/${encodeURIComponent(imageId)}`);
}
