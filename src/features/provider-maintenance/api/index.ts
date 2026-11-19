import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type {
	ListProviderMaintenanceParams,
	ProviderMaintenance,
	ProviderMaintenanceCreateRequest,
	ProviderMaintenanceUpdateRequest,
} from "../types";

export async function listMyProviderMaintenance(params: ListProviderMaintenanceParams = {}) {
	const response = await httpClient.get<PagedResponse<ProviderMaintenance>>(endpoints.provider.maintenance, { params });
	return response.data;
}

export async function getMyProviderMaintenanceById(maintenanceId: string) {
	const response = await httpClient.get<ProviderMaintenance>(
		`${endpoints.provider.maintenance}/${encodeURIComponent(maintenanceId)}`,
	);
	return response.data;
}

export async function createMyProviderMaintenance(input: ProviderMaintenanceCreateRequest) {
	const response = await httpClient.post<ProviderMaintenance>(endpoints.provider.maintenance, input);
	return response.data;
}

export async function updateMyProviderMaintenance(maintenanceId: string, input: ProviderMaintenanceUpdateRequest) {
	const response = await httpClient.put<ProviderMaintenance>(
		`${endpoints.provider.maintenance}/${encodeURIComponent(maintenanceId)}`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderMaintenance(maintenanceId: string) {
	await httpClient.delete(`${endpoints.provider.maintenance}/${encodeURIComponent(maintenanceId)}`);
}
