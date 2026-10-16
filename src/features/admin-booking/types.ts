/** Matches backend AdminBookingResponseDTO. */
export type AdminBooking = {
	bookingId: string;
	bookingDate: string;
	startTime: string;
	endTime: string;
	totalAmount: number;
	status: string;
	photographerName: string;
	providerName: string;
	spaceName: string;
};

/** Matches backend AdminBookingPaymentDTO. */
export type AdminBookingPayment = {
	amount: number;
	paymentMethod: string;
	status: string;
	transactionCode: string;
	paidAt: string | null;
};

/** Matches backend AdminBookingEquipmentDTO. */
export type AdminBookingEquipment = {
	equipmentId: string;
	name: string;
	quantity: number;
	unitPrice: number;
};

/** Matches backend AdminBookingDetailResponseDTO. */
export type AdminBookingDetail = {
	bookingId: string;
	bookingDate: string;
	startTime: string;
	endTime: string;
	totalAmount: number;
	status: string;
	createdAt: string;
	updatedAt: string | null;
	photographerName: string;
	photographerEmail: string;
	providerName: string;
	providerEmail: string;
	providerPhone: string;
	spaceName: string;
	spaceType: string;
	spaceAddress: string;
	packageName: string | null;
	packagePrice: number | null;
	payment: AdminBookingPayment | null;
	equipment: AdminBookingEquipment[];
};

export type ListAdminBookingsParams = {
	status?: string;
	page?: number;
	pageSize?: number;
};
