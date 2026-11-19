"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Trash2, X } from "lucide-react";
import type { ProviderSpace, ProviderSpaceDetails, ProviderSpaceRequest } from "@/features/provider-space";
import { providerSpaceImageUrl } from "@/features/provider-space/imageUrl";

type ImagePreviewItem = {
    id: string;
    file: File;
    previewUrl: string;
};

type CreativeSpaceModalProps = {
    open: boolean;
    mode: "create" | "edit";
    space?: ProviderSpace | null;
    error?: string;
    onClose: () => void;
    onSubmit: (data: ProviderSpaceRequest, imageFiles?: File[]) => void;
    submitting?: boolean;
};

const inputClassName =
    "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15 disabled:bg-[#f5f5f1] disabled:text-[#777973] disabled:cursor-not-allowed";

const textareaClassName =
    "min-h-24 w-full resize-y rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const STUDIO_AMENITIES = [
    "Cyclorama Wall",
    "Blackout Curtains",
    "C-Stands & Light Stands",
    "Strobe & Continuous Lighting",
    "Tethering Station",
    "Makeup & Styling Station",
    "Garment Rack & Steamer",
    "Dressing Room",
    "Grip Equipment & Sandbags",
    "High-Speed Wi-Fi & Sound System"
];

const DARKROOM_AMENITIES = [
    "Light-Tight Doors",
    "Safelights",
    "Enlargers",
    "Developing Tanks & Reels",
    "Wet Bench & Sink Area",
    "Ventilation & Exhaust System",
    "Film Drying Cabinet",
    "Chemical Storage & Mixing Area",
    "Timer & Grain Focuser",
    "Print Washer & Drying Racks"
];

function parseAmenities(amenities: ProviderSpaceDetails["amenities"]): string[] {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    if (typeof amenities === "string") {
        return amenities.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
}

export function CreativeSpaceModal({
    open,
    mode,
    space,
    error,
    onClose,
    onSubmit,
    submitting = false,
}: CreativeSpaceModalProps) {
    const [name, setName] = useState(space?.name ?? "");
    const [type, setType] = useState<string>(
        space?.type?.toUpperCase() === "DARKROOM" ? "DARKROOM" : "STUDIO",
    );
    const [address, setAddress] = useState(space?.address ?? "");
    const [capacity, setCapacity] = useState(space?.capacity == null ? "" : String(space.capacity));
    const [hourlyRate, setHourlyRate] = useState(space?.hourlyRate == null ? "" : String(space.hourlyRate));
    const [description, setDescription] = useState(space?.description ?? "");
    const [status, setStatus] = useState<ProviderSpaceRequest["status"]>(space?.status.toUpperCase() === "ACTIVE" ? "ACTIVE" : "INACTIVE");
    const [imagePreviews, setImagePreviews] = useState<ImagePreviewItem[]>([]);
    const [imageError, setImageError] = useState("");
    const imagePreviewsRef = useRef<ImagePreviewItem[]>([]);
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const [details, setDetails] = useState<ProviderSpaceDetails>(space?.details ?? {
        lengthM: null,
        widthM: null,
        heightM: null,
        artisticStyle: "",
        supportedProcesses: "",
        lightingConditions: "",
        ventilationDetails: "",
        acousticDetails: "",
        usagePolicies: "",
        amenities: [],
        operatingHours: "",
    });

    useEffect(() => {
        imagePreviewsRef.current = imagePreviews;
    }, [imagePreviews]);

    useEffect(() => {
        return () => {
            imagePreviewsRef.current.forEach((item) => {
                URL.revokeObjectURL(item.previewUrl);
            });
        };
    }, []);

    if (!open) {
        return null;
    }

    const isEditMode = mode === "edit";
    const isDarkroom = type.toUpperCase() === "DARKROOM";

    const currentAmenitiesList = parseAmenities(details.amenities);

    const handleAmenityToggle = (amenity: string) => {
        setDetails((current) => {
            const existing = parseAmenities(current.amenities);
            let updated: string[];
            if (existing.includes(amenity)) {
                updated = existing.filter((item) => item !== amenity);
            } else {
                updated = [...existing, amenity];
            }
            return { ...current, amenities: updated };
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (imageError) return;

        onSubmit({
            name: name.trim(),
            type: type.trim(),
            description: description.trim(),
            address: address.trim(),
            capacity: capacity === "" ? null : Number(capacity),
            hourlyRate: hourlyRate === "" ? null : Number(hourlyRate),
            status,
            details,
        }, imagePreviews.map((item) => item.file));
    };

    const handleImagesChange = (fileList: FileList | null) => {
        setImageError("");
        if (!fileList || fileList.length === 0) return;

        const files = Array.from(fileList);
        const validItems: ImagePreviewItem[] = [];
        const errors: string[] = [];

        for (const file of files) {
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                errors.push(`"${file.name}" is not a JPG, PNG, or WebP image.`);
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                errors.push(`"${file.name}" exceeds 10 MB.`);
                continue;
            }
            validItems.push({
                id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
                file,
                previewUrl: URL.createObjectURL(file),
            });
        }

        if (errors.length > 0) {
            setImageError(errors.join(" "));
        }

        if (validItems.length > 0) {
            setImagePreviews((current) => [...current, ...validItems]);
        }

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImagePreviews((current) => {
            const item = current[indexToRemove];
            if (item) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return current.filter((_, index) => index !== indexToRemove);
        });
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const availableAmenities = isDarkroom ? DARKROOM_AMENITIES : STUDIO_AMENITIES;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-3 sm:p-4"
            onClick={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="creative-space-modal-title"
                className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#e0e0da] bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]"
                onClick={(event) => event.stopPropagation()}>
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eeeeea] px-5 py-4 sm:px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                            Creative space
                        </p>

                        <h2
                            id="creative-space-modal-title"
                            className="mt-1 text-xl font-semibold text-[#20221f]">
                            {isEditMode ? "Edit creative space" : "Add new space"}
                        </h2>

                        <p className="mt-1 text-sm text-[#777973]">
                            {isEditMode
                                ? "Update the information of this creative space."
                                : "Add a new space to your provider catalogue."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-[#777973] transition-colors hover:bg-[#f0f0ec]">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="grid min-h-0 gap-4 overflow-y-auto px-5 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
                        {error && <p role="alert" className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339] sm:col-span-2">{error}</p>}

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="space-name"
                                className="mb-1.5 block text-sm font-medium text-[#343630]">
                                Space name
                            </label>

                            <input
                                id="space-name"
                                type="text"
                                maxLength={200}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="e.g. North Light Studio"
                                required
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label htmlFor="space-type" className="mb-1.5 block text-sm font-medium text-[#343630]">Space type</label>
                            <select
                                id="space-type"
                                value={type}
                                disabled={isEditMode}
                                onChange={(event) => setType(event.target.value)}
                                required
                                className={inputClassName}>
                                <option value="STUDIO">STUDIO</option>
                                <option value="DARKROOM">DARKROOM</option>
                            </select>
                        </div>

                        {/* Address */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="space-address"
                                className="mb-1.5 block text-sm font-medium text-[#343630]">
                                Address
                            </label>

                            <input
                                id="space-address"
                                type="text"
                                maxLength={500}
                                value={address}
                                onChange={(event) => setAddress(event.target.value)}
                                placeholder="e.g. 12 Nguyen Van Dau, Binh Thanh"
                                required
                                className={inputClassName}
                            />
                        </div>

                        {/* Images */}
                        <div className="sm:col-span-2">
                            <div className="flex items-center justify-between gap-3">
                                <label htmlFor="space-images" className="mb-1.5 block text-sm font-medium text-[#343630]">
                                    Space images <span className="font-normal text-[#777973]">(optional)</span>
                                </label>
                                {imagePreviews.length > 0 && (
                                    <span className="text-xs text-[#777973]">
                                        {imagePreviews.length} {imagePreviews.length === 1 ? "image" : "images"} selected
                                    </span>
                                )}
                            </div>
                            <input
                                ref={imageInputRef}
                                id="space-images"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={(event) => handleImagesChange(event.target.files)}
                                className="w-full rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] file:mr-3 file:rounded file:border-0 file:bg-[#f0f0ec] file:px-3 file:py-1 file:text-sm file:font-medium"
                            />
                            <p className="mt-1.5 text-xs text-[#777973]">
                                JPG, PNG, or WebP. Maximum 10 MB per file. You can select multiple images.
                            </p>
                            {imageError && (
                                <p
                                    role="alert"
                                    className="mt-3 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">
                                    {imageError}
                                </p>
                            )}
                            {imagePreviews.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {imagePreviews.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="group relative aspect-4/3 overflow-hidden rounded-md bg-[#f0f0ec]">
                                            <img
                                                src={item.previewUrl}
                                                alt={`Selected space preview ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                aria-label="Remove image"
                                                title="Remove image"
                                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-[#a34d42] shadow-sm hover:bg-white">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isEditMode && space?.images && space.images.length > 0 && (
                                <div className="mt-4 border-t border-[#eeeeea] pt-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-semibold text-[#343630]">
                                            Current images
                                        </h3>
                                        <span className="text-xs text-[#777973]">
                                            {space.images.length} {space.images.length === 1 ? "image" : "images"}
                                        </span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {space.images.map((image) => (
                                            <div
                                                key={image.imageId}
                                                className="group relative aspect-4/3 overflow-hidden rounded-md bg-[#f0f0ec]">
                                                <img
                                                    src={providerSpaceImageUrl(image.imageUrl)}
                                                    alt={space.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Capacity */}
                        <div>
                            <label
                                htmlFor="space-capacity"
                                className="mb-1.5 block text-sm font-medium text-[#343630]">
                                Capacity
                            </label>

                            <input
                                id="space-capacity"
                                type="number"
                                min={1}
                                value={capacity}
                                onChange={(event) => setCapacity(event.target.value)}
                                placeholder="Optional"
                                className={inputClassName}
                            />
                        </div>

                        {/* Hourly Rate */}
                        <div>
                            <label
                                htmlFor="space-hourly-rate"
                                className="mb-1.5 block text-sm font-medium text-[#343630]">
                                Hourly rate <span className="font-normal text-[#777973]">(VND/h)</span>
                            </label>

                            <input
                                id="space-hourly-rate"
                                type="number"
                                min={0}
                                step={1000}
                                value={hourlyRate}
                                onChange={(event) => setHourlyRate(event.target.value)}
                                placeholder="e.g. 250000 (VND/h)"
                                className={inputClassName}
                            />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="space-description"
                                className="mb-1.5 block text-sm font-medium text-[#343630]">
                                Description
                            </label>

                            <textarea
                                id="space-description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Describe this creative space..."
                                className={textareaClassName}
                            />
                        </div>

                        <div>
                            <label htmlFor="space-status" className="mb-1.5 block text-sm font-medium text-[#343630]">Status</label>
                            <select id="space-status" value={status} onChange={(event) => setStatus(event.target.value as ProviderSpaceRequest["status"])} className={inputClassName}>
                                <option value="INACTIVE">Inactive</option>
                                <option value="ACTIVE">Active</option>
                            </select>
                        </div>

                        {/* Additional space details */}
                        <details open={isEditMode} className="rounded-md border border-[#e0e0da] px-3 py-2 sm:col-span-2">
                            <summary className="cursor-pointer text-sm font-medium text-[#343630]">Additional space details</summary>
                            <fieldset className="mt-3 grid gap-4 sm:grid-cols-3">
                                {(['lengthM', 'widthM', 'heightM'] as const).map((field) => (
                                    <label key={field} className="grid gap-1.5 text-sm text-[#454741]">
                                        {field.replace("M", " (m)").replace(/^./, (letter) => letter.toUpperCase())}
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={details[field] ?? ""}
                                            onChange={(event) => setDetails((current) => ({ ...current, [field]: event.target.value === "" ? null : Number(event.target.value) }))}
                                            className={inputClassName}
                                        />
                                    </label>
                                ))}

                                {!isDarkroom && (
                                    <label className="grid gap-1.5 text-sm text-[#454741] sm:col-span-3">
                                        Artistic style
                                        <input
                                            maxLength={255}
                                            value={details.artisticStyle ?? ""}
                                            onChange={(event) => setDetails((current) => ({ ...current, artisticStyle: event.target.value }))}
                                            className={inputClassName}
                                        />
                                    </label>
                                )}

                                {isDarkroom && (
                                    <label className="grid gap-1.5 text-sm text-[#454741] sm:col-span-3">
                                        Supported processes
                                        <input
                                            value={typeof details.supportedProcesses === "string" ? details.supportedProcesses : ""}
                                            onChange={(event) => setDetails((current) => ({ ...current, supportedProcesses: event.target.value }))}
                                            className={inputClassName}
                                            placeholder="e.g. C-41, Black & White development"
                                        />
                                    </label>
                                )}

                                {(['lightingConditions', 'ventilationDetails', 'acousticDetails', 'usagePolicies'] as const).map((field) => (
                                    <label key={field} className="grid gap-1.5 text-sm text-[#454741] sm:col-span-3">
                                        {field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}
                                        <textarea
                                            rows={2}
                                            value={typeof details[field] === "string" ? (details[field] as string) : ""}
                                            onChange={(event) => setDetails((current) => ({ ...current, [field]: event.target.value }))}
                                            className={textareaClassName}
                                        />
                                    </label>
                                ))}

                                <div className="sm:col-span-3 grid gap-1.5 text-sm text-[#454741]">
                                    <span className="font-medium text-[#343630]">Amenities</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 rounded-md border border-[#d8d8d1] bg-[#fafaf8] p-3">
                                        {availableAmenities.map((amenity) => {
                                            const isChecked = currentAmenitiesList.includes(amenity);
                                            return (
                                                <label key={amenity} className="flex items-center gap-2 text-xs text-[#343630] cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleAmenityToggle(amenity)}
                                                        className="h-4 w-4 rounded border-[#d8d8d1] text-[#39724b] focus:ring-[#39724b]/15"
                                                    />
                                                    {amenity}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <label className="grid gap-1.5 text-sm text-[#454741] sm:col-span-3">
                                    Operating hours
                                    <input
                                        value={typeof details.operatingHours === "string" ? details.operatingHours : JSON.stringify(details.operatingHours ?? "")}
                                        onChange={(event) => setDetails((current) => ({ ...current, operatingHours: event.target.value }))}
                                        className={inputClassName}
                                        placeholder="e.g. Mon-Fri: 08:00 - 21:00"
                                    />
                                </label>
                            </fieldset>
                        </details>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 justify-end gap-2 border-t border-[#eeeeea] bg-white px-5 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 rounded-md border border-[#d8d8d1] bg-white px-4 text-sm font-medium text-[#555750] transition-colors hover:bg-[#f5f5f1]">
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e] disabled:cursor-not-allowed disabled:opacity-60">
                            {submitting ? "Saving…" : isEditMode ? "Save changes" : "Add space"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}