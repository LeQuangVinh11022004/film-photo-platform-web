export type Id = string;
export type PaginatedResponse<T> = { data: T[]; page: number; limit: number; total: number };
export type Status = "active" | "inactive" | "pending" | "confirmed" | "cancelled";

/** Matches backend PagedResponseDTO<T> (ASP.NET Core camelCase JSON). */
export type PagedResponse<T> = {
	items: T[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};
