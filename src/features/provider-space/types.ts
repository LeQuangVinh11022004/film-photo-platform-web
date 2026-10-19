export type ProviderSpaceImage = {
	imageId: string;
	imageUrl: string;
	createdAt: string | null;
};

export type ProviderSpace = {
	spaceId: string;
	providerId: string;
	name: string;
	type: string;
	description: string;
	address: string;
	capacity: number | null;
	status: string;
	createdAt: string | null;
	updatedAt: string | null;
	images: ProviderSpaceImage[];
};

export type ProviderSpaceRequest = {
	name: string;
	type: string;
	description: string;
	address: string;
	capacity: number | null;
	status: "ACTIVE" | "INACTIVE";
};

export type ListProviderSpacesParams = {
	type?: string;
	status?: string;
	page?: number;
	pageSize?: number;
};
