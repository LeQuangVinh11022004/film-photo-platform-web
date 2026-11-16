import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type {
	ListProviderEquipmentParams,
	ProviderEquipment,
	ProviderEquipmentCreateRequest,
	ProviderEquipmentUpdateRequest,
} from "../types";

export async function listMyProviderEquipment(params: ListProviderEquipmentParams = {}) {
	const response = await httpClient.get<PagedResponse<ProviderEquipment>>(endpoints.provider.equipment, { params });
	return response.data;
}

export async function getMyProviderEquipment(equipmentId: string) {
	const response = await httpClient.get<ProviderEquipment>(
		`${endpoints.provider.equipment}/${encodeURIComponent(equipmentId)}`,
	);
	return response.data;
}

export async function createMyProviderEquipment(input: ProviderEquipmentCreateRequest) {
	const response = await httpClient.post<ProviderEquipment>(endpoints.provider.equipment, input);
	return response.data;
}

export async function updateMyProviderEquipment(equipmentId: string, input: ProviderEquipmentUpdateRequest) {
	const response = await httpClient.put<ProviderEquipment>(
		`${endpoints.provider.equipment}/${encodeURIComponent(equipmentId)}`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderEquipment(equipmentId: string) {
	await httpClient.delete(`${endpoints.provider.equipment}/${encodeURIComponent(equipmentId)}`);
}
