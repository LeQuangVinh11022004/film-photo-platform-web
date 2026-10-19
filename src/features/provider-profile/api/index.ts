import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { ProviderProfile, ProviderProfileRequest } from "../types";

export async function getMyProviderProfile() {
	const response = await httpClient.get<ProviderProfile>(endpoints.provider.profile);
	return response.data;
}

export async function createMyProviderProfile(input: ProviderProfileRequest) {
	const response = await httpClient.post<ProviderProfile>(endpoints.provider.profile, input);
	return response.data;
}

export async function updateMyProviderProfile(input: ProviderProfileRequest) {
	const response = await httpClient.put<ProviderProfile>(endpoints.provider.profile, input);
	return response.data;
}
