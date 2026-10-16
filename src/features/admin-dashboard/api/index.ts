import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { AdminDashboardStats } from "../types";

export async function getAdminDashboard() {
	const response = await httpClient.get<AdminDashboardStats>(endpoints.admin.dashboard);
	return response.data;
}
