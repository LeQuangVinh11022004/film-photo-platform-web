/** Matches backend AdminUserResponseDTO. */
export type AdminUser = {
	userId: string;
	fullName: string;
	email: string;
	role: string;
	status: string;
	createdAt: string;
};

/** Status values accepted by the backend. */
export type AdminUserStatus = "ACTIVE" | "INACTIVE";

/** Matches backend AdminUserCreateRequestDTO. */
export type CreateAdminUserInput = {
	fullName: string;
	email: string;
	password: string;
	role: string;
	status: AdminUserStatus;
};

/** Matches backend AdminUserUpdateRequestDTO (password optional = keep current). */
export type UpdateAdminUserInput = {
	fullName: string;
	email: string;
	password?: string;
	role: string;
	status: AdminUserStatus;
};

export type ListAdminUsersParams = {
	role?: string;
	status?: string;
	page?: number;
	pageSize?: number;
};