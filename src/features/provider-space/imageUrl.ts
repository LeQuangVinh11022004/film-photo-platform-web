const DEMO_PLACEHOLDERS: Record<string, string> = {
	darkroom: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
	studio: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
	default: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
};

export function providerSpaceImageUrl(imageUrl?: string | null) {
	if (!imageUrl || typeof imageUrl !== "string") return DEMO_PLACEHOLDERS.default;
	const trimmed = imageUrl.trim();
	if (!trimmed) return DEMO_PLACEHOLDERS.default;
	if (trimmed.includes("example.com")) {
		const lower = trimmed.toLowerCase();
		if (lower.includes("darkroom")) return DEMO_PLACEHOLDERS.darkroom;
		if (lower.includes("studio")) return DEMO_PLACEHOLDERS.studio;
		return DEMO_PLACEHOLDERS.default;
	}
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}