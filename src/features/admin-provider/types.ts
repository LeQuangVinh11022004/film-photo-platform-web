/** Matches backend AdminProviderResponseDTO. */
export type AdminProvider = {
	providerId: string;
	businessName: string;
	description: string;
	address: string;
	phone: string;
	email: string;
	accountStatus: string;
	approvalStatus: string;
	createdAt: string | null;
	updatedAt: string | null;
};

/** Approval status values accepted by the backend (PATCH .../approval). */
export type AdminProviderApprovalStatus = "APPROVED" | "REJECTED";

/** Matches backend AdminProviderCreateRequestDTO. */
export type AdminProviderCreateRequest = {
	fullName: string;
	email: string;
	password: string;
	businessName: string;
	description?: string | null;
	address: string;
	phone?: string | null;
};

/** Matches backend AdminProviderUpdateRequestDTO. */
export type AdminProviderUpdateRequest = {
	businessName: string;
	description?: string | null;
	address: string;
	phone?: string | null;
};

export type ListAdminProvidersParams = {
	approvalStatus?: string;
	page?: number;
	pageSize?: number;
};
