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

export type ListAdminProvidersParams = {
	approvalStatus?: string;
	page?: number;
	pageSize?: number;
};
