import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { PagedResponse } from "@/types";
import type {
	ListProviderServicePackagesParams,
	ProviderServicePackage,
	ProviderServicePackageItem,
	ProviderServicePackageItemRequest,
	ProviderServicePackageRequest,
} from "../types";

export async function listMyProviderServicePackages(params: ListProviderServicePackagesParams = {}) {
	const response = await httpClient.get<PagedResponse<ProviderServicePackage>>(endpoints.provider.servicePackages, {
		params,
	});
	return response.data;
}

export async function getMyProviderServicePackage(packageId: string) {
	const response = await httpClient.get<ProviderServicePackage>(
		`${endpoints.provider.servicePackages}/${encodeURIComponent(packageId)}`,
	);
	return response.data;
}

export async function createMyProviderServicePackage(input: ProviderServicePackageRequest) {
	const response = await httpClient.post<ProviderServicePackage>(endpoints.provider.servicePackages, input);
	return response.data;
}

export async function updateMyProviderServicePackage(packageId: string, input: ProviderServicePackageRequest) {
	const response = await httpClient.put<ProviderServicePackage>(
		`${endpoints.provider.servicePackages}/${encodeURIComponent(packageId)}`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderServicePackage(packageId: string) {
	await httpClient.delete(`${endpoints.provider.servicePackages}/${encodeURIComponent(packageId)}`);
}

export async function listMyProviderServicePackageItems(packageId: string) {
	const response = await httpClient.get<ProviderServicePackageItem[]>(
		`${endpoints.provider.servicePackages}/${encodeURIComponent(packageId)}/items`,
	);
	return response.data;
}

export async function createMyProviderServicePackageItem(
	packageId: string,
	input: ProviderServicePackageItemRequest,
) {
	const response = await httpClient.post<ProviderServicePackageItem>(
		`${endpoints.provider.servicePackages}/${encodeURIComponent(packageId)}/items`,
		input,
	);
	return response.data;
}

export async function deleteMyProviderServicePackageItem(
	packageId: string,
	packageItemId: string,
) {
	await httpClient.delete(
		`${endpoints.provider.servicePackages}/${encodeURIComponent(packageId)}/items/${encodeURIComponent(packageItemId)}`,
	);
}
