import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import { clearAuthToken } from "@/services/authToken";
import type { AdminLoginRequest, AdminLoginResponse } from "../types";

export async function loginUser(input: AdminLoginRequest) {
	const response = await httpClient.post<AdminLoginResponse>(endpoints.auth.login, input);
	return response.data;
}

export const loginAdmin = loginUser;

export function logoutAdmin() {
	clearAuthToken();
}
