export type ProviderEquipmentConditionStatus =
	| "GOOD"
	| "NEEDS_REPAIR"
	| "DAMAGED"
	| "UNDER_MAINTENANCE";

export type ProviderEquipmentStatus = "ACTIVE" | "INACTIVE";

export type ProviderEquipment = {
	equipmentId: string;
	spaceId: string;
	spaceType: "STUDIO" | "DARKROOM" | string;
	equipmentType: string;
	name: string;
	category: string;
	variant: string | null;
	description: string | null;
	specificationsJson: string | null;
	quantityTotal: number;
	rentalPrice: number | null;
	status: ProviderEquipmentStatus | string;
	conditionStatus: ProviderEquipmentConditionStatus | string;
	statusNote: string | null;
	createdAt: string;
	updatedAt: string | null;
};

export type ProviderEquipmentCreateRequest = {
	spaceId: string;
	equipmentType: string;
	name: string;
	category: string;
	variant?: string | null;
	description?: string | null;
	specificationsJson?: string | null;
	quantityTotal: number;
	rentalPrice?: number | null;
};

export type ProviderEquipmentUpdateRequest = {
	equipmentType: string;
	name: string;
	category: string;
	variant?: string | null;
	description?: string | null;
	specificationsJson?: string | null;
	quantityTotal: number;
	rentalPrice?: number | null;
	status: ProviderEquipmentStatus;
	conditionStatus: ProviderEquipmentConditionStatus;
	statusNote?: string | null;
};

export type ListProviderEquipmentParams = {
	spaceId?: string;
	status?: string;
	category?: string;
	page?: number;
	pageSize?: number;
};

export type Equipment = ProviderEquipment;

export type ProviderEquipmentAvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | string;

export type ProviderEquipmentAvailability = {
	availabilityId: string;
	equipmentId: string;
	availableDate: string;
	startTime: string;
	endTime: string;
	status: ProviderEquipmentAvailabilityStatus;
	price: number;
};

export type ProviderEquipmentAvailabilityRequest = {
	availableDate: string;
	startTime: string;
	endTime: string;
	status: string;
	price: number;
};

export type ListProviderEquipmentAvailabilityParams = {
	fromDate?: string;
	toDate?: string;
};

