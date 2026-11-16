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

export type ServicePackage = ProviderServicePackage;
