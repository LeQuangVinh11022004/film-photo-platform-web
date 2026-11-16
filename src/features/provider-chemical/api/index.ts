import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type {
	ListProviderChemicalsParams,
	ProviderChemical,
	ProviderChemicalCreateRequest,
	ProviderChemicalRequest,
	ProviderChemicalStockAdjustmentRequest,
} from "../types";

export async function listMyProviderChemicals(params: ListProviderChemicalsParams = {}) {
	const response = await httpClient.get<PagedResponse<ProviderChemical>>(endpoints.provider.chemicals, { params });
	return response.data;
}

export async function getMyProviderChemical(chemicalId: string) {
	const response = await httpClient.get<ProviderChemical>(
		`${endpoints.provider.chemicals}/${encodeURIComponent(chemicalId)}`,
	);
	return response.data;
}

export async function createMyProviderChemical(input: ProviderChemicalCreateRequest) {
	const response = await httpClient.post<ProviderChemical>(endpoints.provider.chemicals, input);
	return response.data;
}

export async function updateMyProviderChemical(chemicalId: string, input: ProviderChemicalRequest) {
	const response = await httpClient.put<ProviderChemical>(
		`${endpoints.provider.chemicals}/${encodeURIComponent(chemicalId)}`,
		input,
	);
	return response.data;
}

export async function adjustMyProviderChemicalStock(
	chemicalId: string,
	input: ProviderChemicalStockAdjustmentRequest,
) {
	const response = await httpClient.post<ProviderChemical>(
		`${endpoints.provider.chemicals}/${encodeURIComponent(chemicalId)}/stock-adjustments`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderChemical(chemicalId: string) {
	await httpClient.delete(`${endpoints.provider.chemicals}/${encodeURIComponent(chemicalId)}`);
}
