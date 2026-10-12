export type AdminContentKind = "CreativeSpace" | "Equipment" | "ServicePackage";
export type AdminContentStatus = "Pending" | "Published" | "ChangesRequested" | "Rejected" | "Hidden";

export type AdminContentItem = {
	id: string;
	title: string;
	provider: string;
	kind: AdminContentKind;
	category: string;
	submitted: string;
	status: AdminContentStatus;
	summary: string;
	moderationNote?: string;
};

export type UpdateAdminContentInput = Pick<AdminContentItem, "status"> & { moderationNote?: string };