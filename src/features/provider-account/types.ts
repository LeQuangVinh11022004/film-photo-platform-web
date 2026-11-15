export type ProviderAccount = {
	userId: string;
	businessName: string;
	businessDescription: string | null;
	businessAddress: string;
	businessPhone: string | null;
	email: string;
	providerApprovalStatus: string;
	createdAt: string | null;
	updatedAt: string | null;
};

export type ProviderAccountRequest = {
	businessName: string;
	businessDescription: string;
	businessAddress: string;
	businessPhone: string;
};
