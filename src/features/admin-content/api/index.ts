import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { AdminContentItem, UpdateAdminContentInput } from "../types";

export async function listAdminContent() {
	const response = await httpClient.get<AdminContentItem[]>(endpoints.adminContent);
	return response.data;
}

export async function updateAdminContent(id: string, input: UpdateAdminContentInput) {
	const response = await httpClient.patch<AdminContentItem>(`${endpoints.adminContent}/${encodeURIComponent(id)}`, input);
	return response.data;
}