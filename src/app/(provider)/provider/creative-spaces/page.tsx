"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { LayoutGrid, MapPin, Table2 } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { CreativeSpaceModal } from "@/features/creative-space/components/CreativeSpaceModal";
import { createMyProviderSpace, deleteMyProviderSpace, getMyProviderSpace, listMyProviderSpaces, listProviderFeatureTypes, updateMyProviderSpace } from "@/features/provider-space/api";
import { uploadProviderSpaceImage } from "@/features/provider-space/api/uploadImage";
import { ProviderSpaceDetailsDialog } from "@/features/provider-space/components/ProviderSpaceDetailsDialog";
import type { ProviderFeatureType, ProviderSpace, ProviderSpaceRequest } from "@/features/provider-space";
import type { PagedResponse } from "@/types";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";

const pageSize = 15;
const fieldClassName = "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function errorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? (error.response ? "The request failed. Please try again." : "Cannot reach the backend. Check that the API is running.");
	}
	if (error instanceof Error) return error.message;
	return "Something went wrong. Please try again.";
}

function statusTone(status: string) {
	return status.toUpperCase() === "ACTIVE" ? "bg-[#e5f0e8] text-[#39724b]" : "bg-[#f5e4e1] text-[#a34d42]";
}

function exportSpaces(rows: ProviderSpace[]) {
	const header = ["Space ID", "Name", "Type", "Description", "Address", "Capacity", "Status"];
	const csv = [header, ...rows.map((space) => [space.spaceId, space.name, space.type, space.description, space.address, space.capacity ?? "", space.status])]
		.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
		.join("\n");
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = "creative-spaces.csv";
	link.click();
	URL.revokeObjectURL(url);
}

export default function CreativeSpacesPage() {
	const tableRef = useRef<HTMLElement | null>(null);
	const [result, setResult] = useState<PagedResponse<ProviderSpace> | null>(null);
	const [featureTypes, setFeatureTypes] = useState<ProviderFeatureType[]>([]);
	const [activeCount, setActiveCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [detailLoading, setDetailLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [viewMode, setViewMode] = useState<"table" | "grid">("table");
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [reloadKey, setReloadKey] = useState(0);
	const [selectedSpace, setSelectedSpace] = useState<ProviderSpace | null>(null);
	const [spaceModalOpen, setSpaceModalOpen] = useState(false);
	const [modalVersion, setModalVersion] = useState(0);
	const [spaceModalMode, setSpaceModalMode] = useState<"create" | "edit">("create");
	const [editingSpace, setEditingSpace] = useState<ProviderSpace | null>(null);
	const [pendingDeleteSpace, setPendingDeleteSpace] = useState<ProviderSpace | null>(null);
	const [deletingSpace, setDeletingSpace] = useState(false);

	useEffect(() => {
		let cancelled = false;
		Promise.allSettled([
			listMyProviderSpaces({ status: status || undefined, page: currentPage, pageSize }),
			listMyProviderSpaces({ status: "ACTIVE", page: 1, pageSize: 1 }),
		])
			.then(([spacesResult, activeResult]) => {
				if (cancelled) return;
				if (spacesResult.status === "fulfilled") {
					setResult(spacesResult.value);
					setError("");
				} else {
					setError(errorMessage(spacesResult.reason));
				}
				if (activeResult.status === "fulfilled") {
					setActiveCount(activeResult.value.totalItems);
				}
			})
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [currentPage, reloadKey, status]);

	useEffect(() => {
		let cancelled = false;
		listProviderFeatureTypes()
			.then((items) => { if (!cancelled) setFeatureTypes(items); })
			.catch((requestError: unknown) => { if (!cancelled) setError(errorMessage(requestError)); });
		return () => { cancelled = true; };
	}, []);

	const spaces = result?.items ?? [];
	const filteredSpaces = spaces.filter((space) => `${space.name} ${space.address} ${space.type} ${space.spaceId}`.toLowerCase().includes(query.trim().toLowerCase()));
	const totalCapacity = spaces.reduce((total, space) => total + (space.capacity ?? 0), 0);

	async function refreshSpaces() {
		const [spacesResult, activeResult] = await Promise.all([
			listMyProviderSpaces({ status: status || undefined, page: currentPage, pageSize }),
			listMyProviderSpaces({ status: "ACTIVE", page: 1, pageSize: 1 }),
		]);
		setResult(spacesResult);
		setActiveCount(activeResult.totalItems);
	}

	function startCreate() {
		setError("");
		setEditingSpace(null);
		setSpaceModalMode("create");
		setModalVersion((version) => version + 1);
		setSpaceModalOpen(true);
	}

	function startEdit(space: ProviderSpace) {
		setError("");
		setEditingSpace(space);
		setSpaceModalMode("edit");
		setModalVersion((version) => version + 1);
		setSpaceModalOpen(true);
	}

	async function openDetails(spaceId: string) {
		setDetailLoading(true);
		setError("");
		try {
			setSelectedSpace(await getMyProviderSpace(spaceId));
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setDetailLoading(false);
		}
	}

	async function handleDeleteSpace() {
		if (!pendingDeleteSpace) return;
		setError("");
		setDeletingSpace(true);
		try {
			await deleteMyProviderSpace(pendingDeleteSpace.spaceId);
			setPendingDeleteSpace(null);
			setSelectedSpace(null);
			if (spaces.length === 1 && currentPage > 1) setCurrentPage((page) => page - 1);
			else await refreshSpaces();
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setDeletingSpace(false);
		}
	}

	async function handleSubmitSpace(data: ProviderSpaceRequest, imageFile?: File) {
		setSaving(true);
		setError("");
		try {
			const savedSpace = spaceModalMode === "edit" && editingSpace
				? await updateMyProviderSpace(editingSpace.spaceId, data)
				: await createMyProviderSpace(data);
			setSpaceModalOpen(false);
			setEditingSpace(null);
			let uploadError = "";
			if (imageFile) {
				try {
					await uploadProviderSpaceImage(savedSpace.spaceId, imageFile);
				} catch (requestError) {
					uploadError = errorMessage(requestError);
				}
			}
			await refreshSpaces();
			if (uploadError) setError(`Space saved, but its image could not be uploaded: ${uploadError}`);
		} catch (requestError) {
			setError(errorMessage(requestError));
		} finally {
			setSaving(false);
		}
	}

	async function refreshSelectedSpace(spaceId: string) {
		setSelectedSpace(await getMyProviderSpace(spaceId));
	}

	function handlePageChange(page: number) {
		setLoading(true);
		setCurrentPage(page);
		requestAnimationFrame(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
	}

	return (
		<div className="mx-auto max-w-375">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div className="min-w-0 flex-1"><PageHeader eyebrow="Provider workspace" title="Creative spaces" description="Manage the spaces customers can reserve from your provider account." /></div>
				<div className="flex shrink-0 items-center gap-2 sm:pt-2"><button type="button" onClick={() => exportSpaces(filteredSpaces)} disabled={!filteredSpaces.length} className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36] disabled:opacity-50">Export CSV</button></div>
			</div>

			<section aria-label="Creative space summary" className="mt-3 grid gap-3 sm:grid-cols-3">
				{[{ label: "Total spaces", value: String(result?.totalItems ?? 0), helper: "All spaces in your catalogue" }, { label: "Active spaces", value: String(activeCount), helper: "Currently available for booking" }, { label: "Capacity on this page", value: String(totalCapacity), helper: "Maximum people across listed spaces" }].map((metric) => <article key={metric.label} className="rounded-lg border border-[#e0e0da] bg-white p-4"><p className="text-sm text-[#686a64]">{metric.label}</p><p className="mt-2 text-2xl font-semibold text-[#20221f]">{metric.value}</p><p className="mt-1 text-xs text-[#858680]">{metric.helper}</p></article>)}
			</section>

			{error && <p role="alert" className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">{error}</p>}
			{detailLoading && <p role="status" className="mt-4 text-sm text-[#777973]">Loading space details…</p>}
			{loading && !result ? <section className="mt-4 rounded-lg border border-[#e0e0da] bg-white px-5 py-16 text-center text-sm text-[#777973]">Loading spaces…</section> : !result ? (
				<section className="mt-4 rounded-lg border border-[#e0e0da] bg-white px-5 py-12 text-center"><h2 className="text-base font-semibold text-[#20221f]">Could not load spaces</h2><p className="mt-2 text-sm text-[#777973]">Check your connection and provider access, then try again.</p><button type="button" onClick={() => { setLoading(true); setError(""); setReloadKey((key) => key + 1); }} className="mt-4 h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e]">Try again</button></section>
			) : spaces.length === 0 ? (
				<section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white"><div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9eee7] text-lg font-semibold text-[#45644a]">SP</div><h2 className="mt-5 text-lg font-semibold text-[#20221f]">No creative spaces yet</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#777973]">Add your first space to make it available for customers to reserve.</p><button type="button" onClick={startCreate} className="mt-5 h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">Add new space</button></div></section>
			) : (
				<section ref={tableRef} className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
					<div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:px-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-semibold text-[#20221f]">All creative spaces</h2><p className="mt-1 text-sm text-[#777973]">{result?.totalItems ?? 0} spaces in your catalogue</p></div><Pagination currentPage={currentPage} totalItems={result?.totalItems ?? 0} itemsPerPage={pageSize} onPageChange={handlePageChange} /></div>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={startCreate} className="h-9 w-fit shrink-0 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">Add new space</button><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><div className="grid gap-2 sm:grid-cols-[minmax(180px,260px)_150px]"><label className="sr-only" htmlFor="space-search">Search spaces on this page</label><input id="space-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this page..." className={fieldClassName} /><label className="sr-only" htmlFor="space-status">Filter by status</label><select id="space-status" value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value); setCurrentPage(1); }} className={fieldClassName}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div><button type="button" onClick={() => setViewMode((current) => current === "table" ? "grid" : "table")} aria-label={viewMode === "table" ? "Switch to grid view" : "Switch to table view"} title={viewMode === "table" ? "Switch to grid view" : "Switch to table view"} className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-md border border-[#d8d8d1] bg-white text-[#343630] transition-colors hover:bg-[#f3f5ef] sm:self-auto">{viewMode === "table" ? <LayoutGrid size={18} strokeWidth={1.8} /> : <Table2 size={18} strokeWidth={1.8} />}</button></div></div>
					</div>

					{viewMode === "table" ? <div className="overflow-x-auto"><table className="w-full min-w-205 border-collapse text-left"><thead className="bg-[#f8f8f5] text-xs font-semibold uppercase text-[#777973]"><tr><th className="px-5 py-3">Space</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Details</th></tr></thead><tbody className="divide-y divide-[#eeeeea]">{filteredSpaces.map((space) => <tr key={space.spaceId} className="transition-colors hover:bg-[#fcfcfa]"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] text-xs font-semibold text-[#45644a]">SP</span><div className="min-w-0"><p className="text-sm font-semibold text-[#292b27]">{space.name}</p><p className="mt-0.5 max-w-44 truncate text-xs text-[#777973]">{space.spaceId}</p></div></div></td><td className="px-4 py-3.5 text-sm text-[#686a64]">{space.type}</td><td className="px-4 py-3.5 text-sm text-[#686a64]">{space.address}</td><td className="px-4 py-3.5 text-sm text-[#686a64]">{space.capacity == null ? "—" : `${space.capacity} people`}</td><td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(space.status)}`}>{space.status}</span></td><td className="px-5 py-3.5 text-right"><button type="button" onClick={() => void openDetails(space.spaceId)} className="text-sm font-semibold text-[#39724b] hover:underline">View</button></td></tr>)}{filteredSpaces.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#777973]">No spaces match your search on this page.</td></tr>}</tbody></table></div> : <div className="grid grid-cols-1 gap-4 bg-[#fafaf8] p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredSpaces.map((space) => <article key={space.spaceId} className="group overflow-hidden rounded-lg border border-[#e0e0da] bg-white"><div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-[#e9eee7]">{space.images[0]?.imageUrl ? <img src={space.images[0].imageUrl} alt={space.name} loading="lazy" className="h-full w-full object-cover" /> : <span className="text-sm font-medium text-[#687a68]">No image</span>}<span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(space.status)}`}>{space.status}</span></div><div className="p-4"><p className="text-xs font-medium text-[#858680]">{space.type}</p><h3 className="mt-1 truncate text-base font-semibold text-[#20221f]">{space.name}</h3><p className="mt-2 flex min-h-10 items-start gap-2 text-sm leading-5 text-[#686a64]"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{space.address}</span></p><div className="mt-3 flex items-center justify-between border-t border-[#eeeeea] pt-3"><span className="text-sm text-[#686a64]">Capacity</span><span className="text-sm font-semibold text-[#343630]">{space.capacity == null ? "Not set" : `${space.capacity} people`}</span></div><button type="button" onClick={() => void openDetails(space.spaceId)} className="mt-4 h-9 w-full rounded-md border border-[#39724b] text-sm font-semibold text-[#39724b] transition-colors hover:bg-[#39724b] hover:text-white">View details</button></div></article>)}</div>}
					<div className="border-t border-[#e8e8e2] px-5 py-4"><Pagination currentPage={currentPage} totalItems={result?.totalItems ?? 0} itemsPerPage={pageSize} onPageChange={handlePageChange} /></div>
				</section>
			)}

			{selectedSpace && <ProviderSpaceDetailsDialog space={selectedSpace} onClose={() => setSelectedSpace(null)} onDelete={(space) => setPendingDeleteSpace(space)} onEdit={(space) => { setSelectedSpace(null); startEdit(space); }} onRefresh={refreshSelectedSpace} onUpdated={refreshSpaces} />}
			{spaceModalOpen && <CreativeSpaceModal key={modalVersion} open mode={spaceModalMode} space={editingSpace} featureTypes={featureTypes} error={error || undefined} onClose={() => { setSpaceModalOpen(false); setEditingSpace(null); }} onSubmit={handleSubmitSpace} submitting={saving} />}
			{pendingDeleteSpace && <ConfirmDeleteDialog title="Delete this space?" description={`“${pendingDeleteSpace.name}” will be permanently deleted. This action cannot be undone.`} confirming={deletingSpace} error={error || undefined} onCancel={() => { if (!deletingSpace) { setPendingDeleteSpace(null); setError(""); } }} onConfirm={() => void handleDeleteSpace()} />}
		</div>
	);
}
