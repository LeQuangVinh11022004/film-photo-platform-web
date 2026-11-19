import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { GetProviderDashboardParams, ProviderDashboard } from "../types";

export async function getMyProviderDashboard(params: GetProviderDashboardParams = {}) {
	const response = await httpClient.get<ProviderDashboard>(endpoints.provider.dashboard, { params });
	return response.data;
}
