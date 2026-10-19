export type ProviderProfile = {
	providerId: string;
	businessName: string;
	description: string;
	address: string;
	phone: string;
	email: string;
	approvalStatus: string;
	createdAt: string | null;
	updatedAt: string | null;
};

export type ProviderProfileRequest = {
	businessName: string;
	description: string;
	address: string;
	phone: string;
};
