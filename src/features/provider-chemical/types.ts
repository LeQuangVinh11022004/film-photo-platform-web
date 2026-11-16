export type ProviderChemicalStatus = "ACTIVE" | "INACTIVE";

export type ProviderChemicalMovementType =
	| "PURCHASE"
	| "CONSUMPTION"
	| "ADJUSTMENT"
	| "WASTE";

export type ProviderChemical = {
	chemicalId: string;
	darkroomId: string;
	name: string;
	chemicalType: string;
	brand: string | null;
	stockQuantity: number;
	stockUnit: string;
	minimumStock: number;
	isLowStock: boolean;
	unitCost: number | null;
	expiresOn: string | null;
	status: ProviderChemicalStatus | string;
	statusNote: string | null;
	createdAt: string;
	updatedAt: string | null;
};

export type ProviderChemicalRequest = {
	name: string;
	chemicalType: string;
	brand?: string | null;
	stockQuantity: number;
	stockUnit: string;
	minimumStock: number;
	unitCost?: number | null;
	expiresOn?: string | null;
	status: ProviderChemicalStatus;
	statusNote?: string | null;
};

export type ProviderChemicalCreateRequest = ProviderChemicalRequest & {
	darkroomId: string;
};

export type ProviderChemicalStockAdjustmentRequest = {
	movementType: ProviderChemicalMovementType;
	quantityDelta: number;
	unitCost?: number | null;
	supplierOrReference?: string | null;
	note?: string | null;
};

export type ListProviderChemicalsParams = {
	darkroomId?: string;
	status?: string;
	page?: number;
	pageSize?: number;
};
