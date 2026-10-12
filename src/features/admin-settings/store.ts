const storageKey = "film-photo-admin-settings";
const listeners = new Set<() => void>();
const serverSnapshots = new Map<string, AdminPlatformSettings>();
let cachedSnapshot: AdminPlatformSettings | null = null;
let currentDefaults: string[] = [];

export type AdminPlatformSettings = {
	notifications: { bookings: boolean; security: boolean; reviews: boolean };
	density: "comfortable" | "compact";
	categories: string[];
	aiServices: { spaceMatching: boolean; imageReview: boolean };
	confidenceThreshold: number;
	platformPolicies: { providerVerification: boolean; contentModeration: boolean; disputeWindow: boolean };
};

function createDefaults(categories: string[]): AdminPlatformSettings {
	return {
		notifications: { bookings: true, security: true, reviews: false },
		density: "comfortable",
		categories: [...categories],
		aiServices: { spaceMatching: true, imageReview: false },
		confidenceThreshold: 82,
		platformPolicies: { providerVerification: true, contentModeration: true, disputeWindow: true },
	};
}

function parseSettings(value: unknown, defaults: string[]): AdminPlatformSettings {
	if (!value || typeof value !== "object") return createDefaults(defaults);
	const stored = value as Partial<AdminPlatformSettings>;
	const base = createDefaults(defaults);
	return {
		notifications: {
			bookings: stored.notifications?.bookings ?? base.notifications.bookings,
			security: stored.notifications?.security ?? base.notifications.security,
			reviews: stored.notifications?.reviews ?? base.notifications.reviews,
		},
		density: stored.density === "compact" ? "compact" : "comfortable",
		categories: Array.isArray(stored.categories) && stored.categories.every((item) => typeof item === "string") ? stored.categories : base.categories,
		aiServices: {
			spaceMatching: stored.aiServices?.spaceMatching ?? base.aiServices.spaceMatching,
			imageReview: stored.aiServices?.imageReview ?? base.aiServices.imageReview,
		},
		confidenceThreshold: typeof stored.confidenceThreshold === "number" ? Math.max(50, Math.min(99, stored.confidenceThreshold)) : base.confidenceThreshold,
		platformPolicies: {
			providerVerification: stored.platformPolicies?.providerVerification ?? base.platformPolicies.providerVerification,
			contentModeration: stored.platformPolicies?.contentModeration ?? base.platformPolicies.contentModeration,
			disputeWindow: stored.platformPolicies?.disputeWindow ?? base.platformPolicies.disputeWindow,
		},
	};
}

export function getAdminSettingsSnapshot(defaults: string[]): AdminPlatformSettings {
	currentDefaults = defaults;
	if (cachedSnapshot) return cachedSnapshot;
	try {
		const stored = window.localStorage.getItem(storageKey);
		cachedSnapshot = stored ? parseSettings(JSON.parse(stored), defaults) : createDefaults(defaults);
	} catch {
		window.localStorage.removeItem(storageKey);
		cachedSnapshot = createDefaults(defaults);
	}
	return cachedSnapshot;
}

export function getServerAdminSettingsSnapshot(defaults: string[]): AdminPlatformSettings {
	const key = JSON.stringify(defaults);
	if (!serverSnapshots.has(key)) serverSnapshots.set(key, createDefaults(defaults));
	return serverSnapshots.get(key)!;
}

export function subscribeToAdminSettings(listener: () => void) {
	listeners.add(listener);
	function handleStorage() {
		cachedSnapshot = null;
		getAdminSettingsSnapshot(currentDefaults);
		listeners.forEach((notify) => notify());
	}
	window.addEventListener("storage", handleStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", handleStorage);
	};
}

export function updateAdminSettings(updater: (current: AdminPlatformSettings) => AdminPlatformSettings) {
	if (!cachedSnapshot) return;
	cachedSnapshot = updater(cachedSnapshot);
	window.localStorage.setItem(storageKey, JSON.stringify(cachedSnapshot));
	listeners.forEach((listener) => listener());
}