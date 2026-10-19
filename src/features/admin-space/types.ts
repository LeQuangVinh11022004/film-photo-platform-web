export type AdminSpace = {
	spaceId: string;
	providerId: string;
	providerBusinessName: string;
	name: string;
	type: string;
	description: string;
	address: string;
	capacity: number | null;
	status: string;
	createdAt: string | null;
	updatedAt: string | null;
};

export type AdminSpaceRequest = {
	providerId: string;
	name: string;
	type: string;
	description?: string | null;
	address: string;
	capacity: number | null;
	status: "ACTIVE" | "INACTIVE";
};

export type ListAdminSpacesParams = {
	type?: string;
	status?: string;
	providerId?: string;
	page?: number;
	pageSize?: number;
};
