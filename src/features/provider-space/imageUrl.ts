export function providerSpaceImageUrl(imageUrl: string) {
	if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
	return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
}