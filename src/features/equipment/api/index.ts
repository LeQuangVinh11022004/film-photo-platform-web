import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type {
	ListProviderEquipmentAvailabilityParams,
	ListProviderEquipmentParams,
	ProviderEquipment,
	ProviderEquipmentAvailability,
	ProviderEquipmentAvailabilityRequest,
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

export async function listMyProviderEquipmentAvailability(
	equipmentId: string,
	params: ListProviderEquipmentAvailabilityParams = {},
) {
	const response = await httpClient.get<ProviderEquipmentAvailability[]>(
		`${endpoints.provider.equipment}/${encodeURIComponent(equipmentId)}/availability`,
		{ params },
	);
	return response.data;
}

export async function createMyProviderEquipmentAvailability(
	equipmentId: string,
	input: ProviderEquipmentAvailabilityRequest,
) {
	const response = await httpClient.post<ProviderEquipmentAvailability>(
		`${endpoints.provider.equipment}/${encodeURIComponent(equipmentId)}/availability`,
		input,
	);
	return response.data;
}

export async function updateMyProviderEquipmentAvailability(
	equipmentId: string,
	availabilityId: string,
	input: ProviderEquipmentAvailabilityRequest,
) {
	const response = await httpClient.put<ProviderEquipmentAvailability>(
		`${endpoints.provider.equipment}/${encodeURIComponent(equipmentId)}/availability/${encodeURIComponent(availabilityId)}`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderEquipmentAvailability(
	equipmentId: string,
	availabilityId: string,
) {
	await httpClient.delete(
		`${endpoints.provider.equipment}/${encodeURIComponent(equipmentId)}/availability/${encodeURIComponent(availabilityId)}`,
	);
}



