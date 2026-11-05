export type AdminLoginRequest = {
	email: string;
	password: string;
};

export type AdminRegisterProviderRequest = {
	fullName: string;
	email: string;
	password: string;
	businessName: string;
	description: string;
	address: string;
	phoneNumber: string;
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

export type AdminRegisterProviderResponse = {
	userId?: string;
	fullName?: string;
	email?: string;
	role?: string;
	status?: string;
	providerApprovalStatus?: string;
	createdAt?: string;
	success?: boolean;
	message?: string;
	providerId?: string | null;
};
