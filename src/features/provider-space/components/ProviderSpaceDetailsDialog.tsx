"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { Pencil, Trash2, Upload, X } from "lucide-react";
import {
	createMyProviderSpaceAvailability,
	deleteMyProviderSpaceAvailability,
	deleteMyProviderSpaceImage,
	listMyProviderSpaceAvailability,
	updateMyProviderSpaceAvailability,
} from "../api";
import { uploadProviderSpaceImage } from "../api/uploadImage";
import { providerSpaceImageUrl } from "../imageUrl";
import type { ProviderSpace, ProviderSpaceAvailability, ProviderSpaceAvailabilityRequest } from "../types";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";

type PendingDeletion = { kind: "image" | "availability"; id: string; description: string };

const fieldClassName = "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";
const blankAvailability: ProviderSpaceAvailabilityRequest = {
	availableDate: "",
	startTime: "09:00",
	endTime: "17:00",
	status: "AVAILABLE",
	price: null,
};

function errorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? (error.response ? "The request failed. Please try again." : "Cannot reach the backend. Check that the API is running.");
	}
	if (error instanceof Error) return error.message;
	return "Something went wrong. Please try again.";
}

function displayTime(value: string) {
	return value.slice(0, 5);
}

export function ProviderSpaceDetailsDialog({
	space,
	onClose,
	onEdit,
	onDelete,
	onRefresh,
	onUpdated,
}: {
	space: ProviderSpace;
	onClose: () => void;
	onEdit: (space: ProviderSpace) => void;
	onDelete: (space: ProviderSpace) => void;
	onRefresh: (spaceId: string) => Promise<void>;
	onUpdated: () => Promise<void>;
}) {
	const [availability, setAvailability] = useState<ProviderSpaceAvailability[]>([]);
	const [availabilityLoading, setAvailabilityLoading] = useState(true);
	const [availabilityError, setAvailabilityError] = useState("");
	const [form, setForm] = useState<ProviderSpaceAvailabilityRequest>(blankAvailability);
	const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
	const [savingAvailability, setSavingAvailability] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [imageError, setImageError] = useState("");
	const imageInputRef = useRef<HTMLInputElement | null>(null);
	const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
	const [deleteError, setDeleteError] = useState("");
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		let cancelled = false;
		listMyProviderSpaceAvailability(space.spaceId)
			.then((items) => { if (!cancelled) { setAvailability(items); setAvailabilityError(""); } })
			.catch((error: unknown) => { if (!cancelled) setAvailabilityError(errorMessage(error)); })
			.finally(() => { if (!cancelled) setAvailabilityLoading(false); });
		return () => { cancelled = true; };
	}, [space.spaceId]);

	async function reloadAvailability() {
		const items = await listMyProviderSpaceAvailability(space.spaceId);
		setAvailability(items);
	}

	async function handleUploadImage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!imageFile) return;
		setUploadingImage(true);
		setImageError("");
		try {
			await uploadProviderSpaceImage(space.spaceId, imageFile);
			setImageFile(null);
			if (imageInputRef.current) imageInputRef.current.value = "";
			await onRefresh(space.spaceId);
			await onUpdated();
		} catch (error) {
			setImageError(errorMessage(error));
		} finally {
			setUploadingImage(false);
		}
	}

	function requestDeleteImage(imageId: string) {
		setDeleteError("");
		setPendingDeletion({ kind: "image", id: imageId, description: `This image from “${space.name}” will be permanently deleted.` });
	}

	function requestDeleteAvailability(item: ProviderSpaceAvailability) {
		setDeleteError("");
		setPendingDeletion({ kind: "availability", id: item.availabilityId, description: `The availability on ${item.availableDate} will be permanently deleted.` });
	}

	async function confirmDelete() {
		if (!pendingDeletion) return;
		setDeleting(true);
		setDeleteError("");
		try {
			if (pendingDeletion.kind === "image") {
				await deleteMyProviderSpaceImage(space.spaceId, pendingDeletion.id);
				await onRefresh(space.spaceId);
				await onUpdated();
			} else {
				await deleteMyProviderSpaceAvailability(space.spaceId, pendingDeletion.id);
				if (editingAvailabilityId === pendingDeletion.id) resetAvailabilityForm();
				await reloadAvailability();
			}
			setPendingDeletion(null);
		} catch (error) {
			setDeleteError(errorMessage(error));
		} finally {
			setDeleting(false);
		}
	}

	function editAvailability(item: ProviderSpaceAvailability) {
		setEditingAvailabilityId(item.availabilityId);
		setForm({
			availableDate: item.availableDate,
			startTime: displayTime(item.startTime),
			endTime: displayTime(item.endTime),
			status: item.status.toUpperCase() === "UNAVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
			price: item.price,
		});
	}

	function resetAvailabilityForm() {
		setForm(blankAvailability);
		setEditingAvailabilityId(null);
	}

	async function handleSaveAvailability(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSavingAvailability(true);
		setAvailabilityError("");
		try {
			if (editingAvailabilityId) {
				await updateMyProviderSpaceAvailability(space.spaceId, editingAvailabilityId, form);
			} else {
				await createMyProviderSpaceAvailability(space.spaceId, form);
			}
			resetAvailabilityForm();
			await reloadAvailability();
		} catch (error) {
			setAvailabilityError(errorMessage(error));
		} finally {
			setSavingAvailability(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
			<section role="dialog" aria-modal="true" aria-labelledby="space-detail-title" className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#e0e0da] bg-white p-5 shadow-xl sm:p-6">
				<div className="flex items-start justify-between gap-4">
					<div><p className="text-xs font-semibold uppercase text-[#777973]">{space.spaceId}</p><h2 id="space-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">{space.name}</h2></div>
					<button type="button" onClick={onClose} aria-label="Close space details" className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-[#777973] hover:bg-[#f0f0ec]"><X size={18} /></button>
				</div>

				<dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
					{[["Type", space.type], ["Address", space.address], ["Capacity", space.capacity == null ? "Not set" : `${space.capacity} people`], ["Status", space.status]].map(([label, value]) => <div key={label} className="border-b border-[#eeeeea] py-3"><dt className="text-xs text-[#777973]">{label}</dt><dd className="mt-1 wrap-break-word text-sm font-medium text-[#343630]">{value}</dd></div>)}
				</dl>
				<div className="mt-4"><p className="text-sm font-semibold text-[#343630]">Description</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#686a64]">{space.description || "No description"}</p></div>
				{space.details && <dl className="mt-4 grid gap-x-6 sm:grid-cols-2"><dt className="text-sm font-semibold text-[#343630] sm:col-span-2">Space details</dt>{[["Dimensions", [space.details.lengthM, space.details.widthM, space.details.heightM].filter((value) => value != null).join(" × ") + " m"], ["Artistic style", space.details.artisticStyle], ["Lighting", space.details.lightingConditions], ["Ventilation", space.details.ventilationDetails], ["Acoustics", space.details.acousticDetails], ["Usage policies", space.details.usagePolicies]].filter(([, value]) => Boolean(value)).map(([label, value]) => <div key={label} className="border-b border-[#eeeeea] py-2"><dt className="text-xs text-[#777973]">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-[#343630]">{value}</dd></div>)}</dl>}
				{space.features.length > 0 && <div className="mt-4"><h3 className="text-sm font-semibold text-[#343630]">Features</h3><div className="mt-2 flex flex-wrap gap-2">{space.features.map((feature) => <span key={feature.featureTypeId} className="rounded-md border border-[#d8d8d1] px-2.5 py-1 text-xs font-medium text-[#454741]">{feature.name}</span>)}</div></div>}

				<section className="mt-5 border-t border-[#eeeeea] pt-4">
					<div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#343630]">Images</h3><span className="text-xs text-[#777973]">{space.images.length} images</span></div>
					{imageError && <p role="alert" className="mt-3 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">{imageError}</p>}
					{space.images.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{space.images.map((image) => <div key={image.imageId} className="group relative aspect-4/3 overflow-hidden rounded-md bg-[#f0f0ec]"><img src={providerSpaceImageUrl(image.imageUrl)} alt={space.name} className="h-full w-full object-cover" /><button type="button" onClick={() => requestDeleteImage(image.imageId)} aria-label="Delete image" title="Delete image" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-[#a34d42] shadow-sm hover:bg-white"><Trash2 size={15} /></button></div>)}</div> : <p className="mt-2 text-sm text-[#777973]">No images have been added.</p>}
					<form onSubmit={handleUploadImage} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"><label htmlFor="space-image-file" className="sr-only">Choose image from this device</label><input ref={imageInputRef} id="space-image-file" type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="min-w-0 flex-1 rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] file:mr-3 file:rounded file:border-0 file:bg-[#f0f0ec] file:px-3 file:py-1 file:text-sm file:font-medium" /><button type="submit" disabled={uploadingImage || !imageFile} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60"><Upload size={15} />{uploadingImage ? "Uploading…" : "Upload image"}</button></form>
					<p className="mt-2 text-xs text-[#777973]">JPG, PNG, or WebP. Maximum 10 MB.</p>
				</section>

				<section className="mt-5 border-t border-[#eeeeea] pt-4">
					<div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#343630]">Availability</h3><span className="text-xs text-[#777973]">{availability.length} time slots</span></div>
					{availabilityError && <p role="alert" className="mt-3 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">{availabilityError}</p>}
					{availabilityLoading ? <p className="py-6 text-center text-sm text-[#777973]">Loading availability…</p> : <div className="mt-3 overflow-x-auto"><table className="w-full min-w-140 text-left"><thead className="bg-[#f8f8f5] text-xs font-semibold uppercase text-[#777973]"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Price</th><th className="px-3 py-2 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#eeeeea]">{availability.map((item) => <tr key={item.availabilityId}><td className="px-3 py-2.5 text-sm text-[#454741]">{item.availableDate}</td><td className="whitespace-nowrap px-3 py-2.5 text-sm text-[#454741]">{displayTime(item.startTime)}–{displayTime(item.endTime)}</td><td className="px-3 py-2.5 text-sm text-[#454741]">{item.status}</td><td className="whitespace-nowrap px-3 py-2.5 text-sm text-[#454741]">{item.price == null ? "—" : `${item.price.toLocaleString("vi-VN")} VND`}</td><td className="px-3 py-2.5"><div className="flex justify-end gap-1"><button type="button" onClick={() => editAvailability(item)} aria-label="Edit availability" title="Edit availability" className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]"><Pencil size={15} /></button><button type="button" onClick={() => requestDeleteAvailability(item)} aria-label="Delete availability" title="Delete availability" className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]"><Trash2 size={15} /></button></div></td></tr>)}{availability.length === 0 && <tr><td colSpan={5} className="px-3 py-7 text-center text-sm text-[#777973]">No availability defined.</td></tr>}</tbody></table></div>}
					<form onSubmit={handleSaveAvailability} className="mt-4 grid gap-3 rounded-md border border-[#e0e0da] bg-[#fafaf8] p-3 sm:grid-cols-2 lg:grid-cols-5">
						<label className="grid gap-1 text-xs font-medium text-[#555750]">Date<input type="date" required value={form.availableDate} onChange={(event) => setForm((current) => ({ ...current, availableDate: event.target.value }))} className={fieldClassName} /></label>
						<label className="grid gap-1 text-xs font-medium text-[#555750]">Start<input type="time" required value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} className={fieldClassName} /></label>
						<label className="grid gap-1 text-xs font-medium text-[#555750]">End<input type="time" required value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} className={fieldClassName} /></label>
						<label className="grid gap-1 text-xs font-medium text-[#555750]">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProviderSpaceAvailabilityRequest["status"] }))} className={fieldClassName}><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option></select></label>
						<label className="grid gap-1 text-xs font-medium text-[#555750]">Price (VND)<input type="number" min="0" step="0.01" value={form.price ?? ""} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value === "" ? null : Number(event.target.value) }))} className={fieldClassName} /></label>
						<div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-5"><button type="submit" disabled={savingAvailability} className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">{savingAvailability ? "Saving…" : editingAvailabilityId ? "Update slot" : "Add availability"}</button>{editingAvailabilityId && <button type="button" onClick={resetAvailabilityForm} className="h-9 rounded-md border border-[#d8d8d1] px-3 text-sm font-medium text-[#555750] hover:bg-white">Cancel edit</button>}</div>
					</form>
				</section>

				<div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#eeeeea] pt-4"><button type="button" onClick={() => onDelete(space)} className="mr-auto inline-flex h-9 items-center gap-2 rounded-md border border-[#e6c3bd] px-3 text-sm font-semibold text-[#a34d42] hover:bg-[#fbefed]"><Trash2 size={15} />Delete space</button><button type="button" onClick={() => onEdit(space)} className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]">Edit space</button><button type="button" onClick={onClose} className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]">Close</button></div>
			</section>
			{pendingDeletion && <ConfirmDeleteDialog title="Delete this item?" description={pendingDeletion.description} error={deleteError || undefined} confirming={deleting} onCancel={() => { if (!deleting) setPendingDeletion(null); }} onConfirm={() => void confirmDelete()} />}
		</div>
	);
}
