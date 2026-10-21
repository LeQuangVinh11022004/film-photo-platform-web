import { endpoints } from "@/services/endpoints";
import { httpClient } from "@/services/httpClient";
import type { ProviderSpaceImage } from "../types";

const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadProviderSpaceImage(spaceId: string, file: File) {
	if (!allowedImageTypes.has(file.type)) {
		throw new Error("Choose a JPG, PNG, or WebP image.");
	}
	if (file.size > maxImageSize) {
		throw new Error("Image size must be 10 MB or less.");
	}

	const body = new FormData();
	body.append("file", file);
	const response = await httpClient.post<ProviderSpaceImage>(
		`${endpoints.provider.spaces}/${encodeURIComponent(spaceId)}/images/upload`,
		body,
		{ headers: { "Content-Type": "multipart/form-data" } },
	);
	return response.data;
}
