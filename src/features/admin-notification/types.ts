export type AdminNotification = {
	id: string;
	title: string;
	message: string;
	href?: string;
	createdAt: string;
	isRead: boolean;
};

export type CreateAdminNotificationInput = Pick<AdminNotification, "title" | "message"> & Partial<Pick<AdminNotification, "href">>;

export type UpdateAdminNotificationInput = Partial<Pick<AdminNotification, "title" | "message" | "href" | "isRead">>;