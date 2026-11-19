/** Matches backend ProviderDashboardResponseDTO. */
export type ProviderDashboard = {
	totalSpaces: number;
	activeSpaces: number;
	totalEquipment: number;
	activeEquipment: number;
	pendingBookings: number;
	confirmedBookings: number;
	revenue: number;
	occupancyRate: number;
	equipmentUtilizationRate: number;
	scheduledMaintenance: number;
};

export type GetProviderDashboardParams = {
	from?: string;
	to?: string;
};
