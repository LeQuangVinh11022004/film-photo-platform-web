import type { Status } from "@/types";
export type Reservation = { id: string; photographerName: string; startTime: string; endTime: string; totalAmount: number; status: Status; createdAt: string; };

export type ProviderBookingStatus = "AWAITING_DEPOSIT" | "CONFIRMED" | "IN_PROGRESS" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | string;

export type ProviderBookingEquipment = {
	equipmentId: string;
	name: string;
	quantity: number;
	unitPrice: number;
};

export type ProviderBooking = {
	bookingId: string;
	photographerId: string;
	providerId: string;
	spaceId: string;
	packageId: string | null;
	bookingDate: string;
	startTime: string;
	endTime: string;
	totalAmount: number;
	status: ProviderBookingStatus;
	sessionStatus: string;
	photographerName: string;
	providerName: string;
	spaceName: string;
	packageName: string | null;
	createdAt: string;
	equipment: ProviderBookingEquipment[];
};

/** Matches backend ProviderBookingAllocationResponseDTO. */
export type ProviderBookingAllocation = {
	scheduleId: string;
	availabilityId: string | null;
	resourceType: string;
	resourceId: string;
	resourceName: string;
	startAt: string;
	endAt: string;
	quantity: number;
	status: string;
	canCheckInOut: boolean;
	checkInAt: string | null;
	checkOutAt: string | null;
};

export type ProviderBookingCancellation = {
	bookingId: string;
	status: string;
	refundAmount: number;
	refundTransactionId: string | null;
	refundStatus: string;
	packageUseRestored: boolean;
	policy: string;
};
