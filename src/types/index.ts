export type Id = string;
export type PaginatedResponse<T> = { data: T[]; page: number; limit: number; total: number };
export type Status = "active" | "inactive" | "pending" | "confirmed" | "cancelled";
