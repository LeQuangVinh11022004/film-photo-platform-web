import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type {
	ListProviderServicesParams,
	ProviderService,
	ProviderServiceRequest,
} from "../types";

export async function listMyProviderServices(params: ListProviderServicesParams = {}) {
	const response = await httpClient.get<PagedResponse<ProviderService>>(endpoints.provider.services, { params });
	return response.data;
}

export async function getMyProviderServiceById(serviceId: string) {
	const response = await httpClient.get<ProviderService>(
		`${endpoints.provider.services}/${encodeURIComponent(serviceId)}`,
	);
	return response.data;
}

export async function createMyProviderService(input: ProviderServiceRequest) {
	const response = await httpClient.post<ProviderService>(endpoints.provider.services, input);
	return response.data;
}

export async function updateMyProviderService(serviceId: string, input: ProviderServiceRequest) {
	const response = await httpClient.put<ProviderService>(
		`${endpoints.provider.services}/${encodeURIComponent(serviceId)}`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderService(serviceId: string) {
	await httpClient.delete(`${endpoints.provider.services}/${encodeURIComponent(serviceId)}`);
}
