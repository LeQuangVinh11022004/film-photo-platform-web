import type { Status } from "@/types";
export type Reservation = { id: string; photographerName: string; startTime: string; endTime: string; totalAmount: number; status: Status; createdAt: string; };

export type ProviderBookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED" | string;
export type ProviderBookingDecision = "APPROVED" | "REJECTED";

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
	qrCode: string;
	photographerName: string;
	providerName: string;
	spaceName: string;
	packageName: string | null;
	createdAt: string;
	equipment: ProviderBookingEquipment[];
};
