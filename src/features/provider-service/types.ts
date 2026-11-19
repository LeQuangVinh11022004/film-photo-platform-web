export type ProviderServiceStatus = "ACTIVE" | "INACTIVE";

/** Matches backend ProviderServiceResponseDTO. */
export type ProviderService = {
	serviceId: string;
	name: string;
	description: string;
	price: number;
	status: ProviderServiceStatus | string;
	createdAt: string | null;
	updatedAt: string | null;
};

/** Matches backend ProviderServiceRequestDTO. */
export type ProviderServiceRequest = {
	name: string;
	description?: string | null;
	price: number;
	status: ProviderServiceStatus;
};

export type ListProviderServicesParams = {
	status?: string;
	page?: number;
	pageSize?: number;
};
