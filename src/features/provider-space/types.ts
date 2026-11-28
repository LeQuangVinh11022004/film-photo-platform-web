export type ProviderSpaceImage = {
	imageId: string;
	imageUrl: string;
	createdAt: string | null;
	imageType?: "COVER" | "INTERIOR" | string | null;
};

export type OperatingHours = {
    monday?: string | null;
    tuesday?: string | null;
    wednesday?: string | null;
    thursday?: string | null;
    friday?: string | null;
    saturday?: string | null;
    sunday?: string | null;
};

export type ProviderSpaceDetails = {
	lengthM: number | null;
	widthM: number | null;
	heightM: number | null;
	artisticStyle: string | null;
	supportedProcesses: string | null;
	lightingConditions: string | null;
	ventilationDetails: string | null;
	acousticDetails: string | null;
	usagePolicies: string | null;
	amenities: string[] | Record<string, unknown> | string | null;
    operatingHours: OperatingHours | Record<string, unknown> | string | null;
};

export type ProviderSpaceAvailabilityStatus = "AVAILABLE" | "BLOCKED" | "CLOSED";

export type ProviderSpaceAvailability = {
	availabilityId: string;
	spaceId: string;
	availableDate: string;
	startTime: string;
	endTime: string;
	status: ProviderSpaceAvailabilityStatus | string;
	price: number | null;
};

export type ProviderSpaceAvailabilityRequest = {
	availableDate: string;
	startTime: string;
	endTime: string;
	status: ProviderSpaceAvailabilityStatus;
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
	hourlyRate?: number | null;
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
	hourlyRate?: number | null;
};

export type ListProviderSpacesParams = {
	type?: string;
	status?: string;
	page?: number;
	pageSize?: number;
};
