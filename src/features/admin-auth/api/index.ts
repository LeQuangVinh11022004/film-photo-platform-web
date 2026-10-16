import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import { clearAuthToken, setAuthToken } from "@/services/authToken";
import type { AdminLoginRequest, AdminLoginResponse } from "../types";

export async function loginAdmin(input: AdminLoginRequest) {
	const response = await httpClient.post<AdminLoginResponse>(endpoints.admin.auth.login, input);
	const result = response.data;

	if (result.success && result.token) {
		setAuthToken(result.token, result.expiresAtUtc);
	}

	return result;
}

export function logoutAdmin() {
	clearAuthToken();
}
