import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { ProviderAccount, ProviderAccountRequest } from "../types";

export async function getMyProviderAccount() {
	const response = await httpClient.get<ProviderAccount>(endpoints.provider.account);
	return response.data;
}

export async function updateMyProviderAccount(input: ProviderAccountRequest) {
	const response = await httpClient.put<ProviderAccount>(endpoints.provider.account, input);
	return response.data;
}
