type CloudinaryUploadResponse = {
	secure_url?: string;
	error?: { message?: string };
};

const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function uploadProviderSpaceImage(file: File) {
	if (!allowedImageTypes.has(file.type)) {
		throw new Error("Choose a JPG, PNG, WebP, or AVIF image.");
	}
	if (file.size > maxImageSize) {
		throw new Error("Image size must be 10 MB or less.");
	}

	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
	if (!cloudName || !uploadPreset) {
		throw new Error("Image upload is not configured. Set the Cloudinary cloud name and upload preset.");
	}

	const body = new FormData();
	body.append("file", file);
	body.append("upload_preset", uploadPreset);
	body.append("folder", "film-photo/spaces");

	const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
		method: "POST",
		body,
	});
	const result = await response.json() as CloudinaryUploadResponse;
	if (!response.ok || !result.secure_url) {
		throw new Error(result.error?.message ?? "The image upload failed. Please try again.");
	}

	return result.secure_url;
}
