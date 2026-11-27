export type ProviderServicePackageStatus = "ACTIVE" | "INACTIVE";

export type ProviderServicePackage = {
	packageId: string;
	name: string;
	description: string | null;
	price: number;
	usesPerMonth: number;
	validityMonths: number;
	status: ProviderServicePackageStatus | string;
	itemCount: number;
	createdAt: string;
	updatedAt: string | null;
};

export type ProviderServicePackageRequest = {
	name: string;
	description?: string | null;
	price: number;
	usesPerMonth: number;
	validityMonths: number;
	status: ProviderServicePackageStatus;
};

export type ListProviderServicePackagesParams = {
	status?: string;
	page?: number;
	pageSize?: number;
};

export type ProviderPackageComponentType =
	| "STUDIO"
	| "DARKROOM"
	| "EQUIPMENT"
	| "CHEMICAL"
	| "SERVICE";

/** Matches backend ProviderServicePackageItemResponseDTO. */
export type ProviderServicePackageItem = {
	packageItemId: string;
	packageId: string;
	componentType: ProviderPackageComponentType | string;
	resourceId: string;
	resourceName: string;
	quantity: number;
	stepOrder: number;
	includedDurationMinutes: number | null;
	includedChemicalQuantity: number | null;
	notes: string;
};

/** Matches backend ProviderServicePackageItemRequestDTO. */
export type ProviderServicePackageItemRequest = {
	componentType: ProviderPackageComponentType;
	resourceId: string;
	quantity: number;
	stepOrder: number;
	includedDurationMinutes?: number | null;
	includedChemicalQuantity?: number | null;
	notes?: string | null;
};

export type ServicePackage = ProviderServicePackage;
