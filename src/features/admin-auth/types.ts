export type AdminLoginRequest = {
	email: string;
	password: string;
};

/** Matches backend AdminUserResponseDTO. */
export type AdminSessionUser = {
	userId: string;
	fullName: string;
	email: string;
	role: string;
	status: string;
	createdAt: string;
};

/** Matches backend LoginResponseDTO. */
export type AdminLoginResponse = {
	success: boolean;
	message: string;
	token: string | null;
	expiresAtUtc: string | null;
	user: AdminSessionUser | null;
};
