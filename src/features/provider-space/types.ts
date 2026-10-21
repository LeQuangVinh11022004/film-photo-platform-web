export type ProviderSpaceImage = {
	imageId: string;
	imageUrl: string;
	createdAt: string | null;
};

export type ProviderFeatureType = {
	featureTypeId: string;
	name: string;
	description: string | null;
};

export type ProviderSpaceDetails = {
	lengthM: number | null;
	widthM: number | null;
	heightM: number | null;
	artisticStyle: string | null;
	lightingConditions: string | null;
	ventilationDetails: string | null;
	acousticDetails: string | null;
	usagePolicies: string | null;
};

export type ProviderSpaceAvailability = {
	availabilityId: string;
	spaceId: string;
	availableDate: string;
	startTime: string;
	endTime: string;
	status: "AVAILABLE" | "UNAVAILABLE" | string;
	price: number | null;
};

export type ProviderSpaceAvailabilityRequest = {
	availableDate: string;
	startTime: string;
	endTime: string;
	status: "AVAILABLE" | "UNAVAILABLE";
	price: number | null;
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
	details: ProviderSpaceDetails | null;
	features: ProviderFeatureType[];
	images: ProviderSpaceImage[];
};

export type ProviderSpaceRequest = {
	name: string;
	type: string;
	description: string;
	address: string;
	capacity: number | null;
	status: "ACTIVE" | "INACTIVE";
	details?: ProviderSpaceDetails | null;
	featureTypeIds?: string[];
};

export type ListProviderSpacesParams = {
	type?: string;
	status?: string;
	page?: number;
	pageSize?: number;
};
