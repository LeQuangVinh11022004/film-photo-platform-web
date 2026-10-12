export type AdminUserRole = "Provider" | "Customer" | "Moderator" | "Admin";
export type AdminUserStatus = "Active" | "Pending" | "Suspended";

export type AdminUser = {
	id: string;
	name: string;
	email: string;
	role: AdminUserRole;
	status: AdminUserStatus;
	joined: string;
	activity: string;
};

export type CreateAdminUserInput = Pick<AdminUser, "name" | "email" | "role" | "status">;
export type UpdateAdminUserInput = Partial<CreateAdminUserInput>;