"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ProviderFeatureType, ProviderSpace, ProviderSpaceDetails, ProviderSpaceRequest } from "@/features/provider-space";

type CreativeSpaceModalProps = {
  open: boolean;
  mode: "create" | "edit";
  space?: ProviderSpace | null;
  featureTypes: ProviderFeatureType[];
  error?: string;
  onClose: () => void;
  onSubmit: (data: ProviderSpaceRequest, imageFile?: File) => void;
  submitting?: boolean;
};

const inputClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const textareaClassName =
  "min-h-24 w-full resize-y rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

export function CreativeSpaceModal({
  open,
  mode,
  space,
  featureTypes,
  error,
  onClose,
  onSubmit,
  submitting = false,
}: CreativeSpaceModalProps) {
  const [name, setName] = useState(space?.name ?? "");
  const [type, setType] = useState(space?.type ?? "");
  const [address, setAddress] = useState(space?.address ?? "");
  const [capacity, setCapacity] = useState(space?.capacity == null ? "" : String(space.capacity));
  const [description, setDescription] = useState(space?.description ?? "");
  const [status, setStatus] = useState<ProviderSpaceRequest["status"]>(space?.status.toUpperCase() === "ACTIVE" ? "ACTIVE" : "INACTIVE");
  const [featureTypeIds, setFeatureTypeIds] = useState<string[]>(space?.features.map((feature) => feature.featureTypeId) ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const imagePreviewRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [details, setDetails] = useState<ProviderSpaceDetails>(space?.details ?? {
    lengthM: null,
    widthM: null,
    heightM: null,
    artisticStyle: "",
    lightingConditions: "",
    ventilationDetails: "",
    acousticDetails: "",
    usagePolicies: "",
  });

  useEffect(() => () => {
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
  }, []);

  if (!open) {
    return null;
  }

  const isEditMode = mode === "edit";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageError) return;

    onSubmit({
      name: name.trim(),
      type: type.trim(),
      description: description.trim(),
      address: address.trim(),
      capacity: capacity === "" ? null : Number(capacity),
      status,
      details,
      featureTypeIds,
    }, imageFile ?? undefined);
  };

  const handleImageChange = (file: File | undefined) => {
    setImageError("");
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    imagePreviewRef.current = null;
    setImagePreview(null);
    if (!file && imageInputRef.current) imageInputRef.current.value = "";
    if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WebP image.");
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setImageError("Image size must be 10 MB or less.");
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    const previewUrl = file ? URL.createObjectURL(file) : null;
    imagePreviewRef.current = previewUrl;
    setImagePreview(previewUrl);
    setImageFile(file ?? null);
  };

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
            className="rounded-md px-2 py-1 text-lg text-[#777973] transition-colors hover:bg-[#f0f0ec]">
            ×
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
              <input id="space-type" type="text" maxLength={50} value={type} onChange={(event) => setType(event.target.value)} placeholder="e.g. Studio" required className={inputClassName} />
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

            <div className="sm:col-span-2">
              <label htmlFor="space-image" className="mb-1.5 block text-sm font-medium text-[#343630]">Space image <span className="font-normal text-[#777973]">(optional)</span></label>
              <input
                ref={imageInputRef}
                id="space-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handleImageChange(event.target.files?.[0])}
                className="w-full rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] file:mr-3 file:rounded file:border-0 file:bg-[#f0f0ec] file:px-3 file:py-1 file:text-sm file:font-medium"
              />
              <p className="mt-1.5 text-xs text-[#777973]">JPG, PNG, or WebP. Maximum 10 MB.</p>
              {imageError && <p role="alert" className="mt-2 text-sm text-[#9c4339]">{imageError}</p>}
              {imagePreview && <div className="relative mt-3 aspect-video max-h-48 overflow-hidden rounded-md bg-[#f0f0ec]">
                <Image src={imagePreview} alt="Selected space preview" fill unoptimized className="object-cover" />
                <button type="button" onClick={() => handleImageChange(undefined)} aria-label="Remove selected image" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-[#a34d42] shadow-sm hover:bg-white">×</button>
              </div>}
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

            <details open={isEditMode} className="rounded-md border border-[#e0e0da] px-3 py-2 sm:col-span-2">
              <summary className="cursor-pointer text-sm font-medium text-[#343630]">Features ({featureTypeIds.length} selected)</summary>
              {featureTypes.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {featureTypes.map((feature) => <label key={feature.featureTypeId} className="flex items-start gap-2 rounded-md border border-[#e0e0da] px-3 py-2 text-sm text-[#454741]">
                  <input type="checkbox" checked={featureTypeIds.includes(feature.featureTypeId)} onChange={(event) => setFeatureTypeIds((current) => event.target.checked ? [...current, feature.featureTypeId] : current.filter((id) => id !== feature.featureTypeId))} className="mt-0.5 accent-[#39724b]" />
                  <span>{feature.name}{feature.description && <span className="mt-0.5 block text-xs text-[#777973]">{feature.description}</span>}</span>
                </label>)}
              </div> : <p className="mt-2 text-sm text-[#777973]">No feature types available.</p>}
            </details>

            <details open={isEditMode} className="rounded-md border border-[#e0e0da] px-3 py-2 sm:col-span-2">
              <summary className="cursor-pointer text-sm font-medium text-[#343630]">Additional space details</summary>
              <fieldset className="mt-3 grid gap-4 sm:grid-cols-3">
                {(["lengthM", "widthM", "heightM"] as const).map((field) => <label key={field} className="grid gap-1.5 text-sm text-[#454741]">{field.replace("M", " (m)").replace(/^./, (letter) => letter.toUpperCase())}<input type="number" min="0.01" step="0.01" value={details[field] ?? ""} onChange={(event) => setDetails((current) => ({ ...current, [field]: event.target.value === "" ? null : Number(event.target.value) }))} className={inputClassName} /></label>)}
                <label className="grid gap-1.5 text-sm text-[#454741] sm:col-span-3">Artistic style<input maxLength={255} value={details.artisticStyle ?? ""} onChange={(event) => setDetails((current) => ({ ...current, artisticStyle: event.target.value }))} className={inputClassName} /></label>
                {(["lightingConditions", "ventilationDetails", "acousticDetails", "usagePolicies"] as const).map((field) => <label key={field} className="grid gap-1.5 text-sm text-[#454741] sm:col-span-3">{field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}<textarea rows={2} value={details[field] ?? ""} onChange={(event) => setDetails((current) => ({ ...current, [field]: event.target.value }))} className={textareaClassName} /></label>)}
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