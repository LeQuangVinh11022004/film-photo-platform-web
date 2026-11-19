export type ProviderMaintenanceStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ProviderMaintenanceResourceType = "STUDIO" | "DARKROOM" | "EQUIPMENT";

/** Matches backend ProviderMaintenanceResponseDTO. */
export type ProviderMaintenance = {
	maintenanceId: string;
	studioId: string | null;
	darkroomId: string | null;
	equipmentId: string | null;
	resourceName: string;
	resourceType: string;
	maintenanceDate: string;
	completedAt: string | null;
	description: string;
	repairNote: string | null;
	status: string;
	cost: number | null;
	createdAt: string | null;
};

/** Matches backend ProviderMaintenanceCreateRequestDTO. */
export type ProviderMaintenanceCreateRequest = {
	studioId?: string | null;
	darkroomId?: string | null;
	equipmentId?: string | null;
	maintenanceDate: string;
	description: string;
	repairNote?: string | null;
	status: ProviderMaintenanceStatus;
	cost?: number | null;
};

/** Matches backend ProviderMaintenanceUpdateRequestDTO. */
export type ProviderMaintenanceUpdateRequest = {
	maintenanceDate: string;
	completedAt?: string | null;
	description: string;
	repairNote?: string | null;
	status: ProviderMaintenanceStatus;
	cost?: number | null;
};

export type ListProviderMaintenanceParams = {
	status?: string;
	page?: number;
	pageSize?: number;
};
