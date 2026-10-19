"use client";

import { useState, type FormEvent } from "react";
import type { ProviderSpace, ProviderSpaceRequest } from "@/features/provider-space";

type CreativeSpaceModalProps = {
  open: boolean;
  mode: "create" | "edit";
  space?: ProviderSpace | null;
  onClose: () => void;
  onSubmit: (data: ProviderSpaceRequest) => void;
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

  if (!open) {
    return null;
  }

  const isEditMode = mode === "edit";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      name: name.trim(),
      type: type.trim(),
      description: description.trim(),
      address: address.trim(),
      capacity: capacity === "" ? null : Number(capacity),
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
      onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="creative-space-modal-title"
        className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#eeeeea] px-6 py-5">
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
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
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
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. North Light Studio"
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="space-type" className="mb-1.5 block text-sm font-medium text-[#343630]">Space type</label>
              <input id="space-type" type="text" value={type} onChange={(event) => setType(event.target.value)} placeholder="e.g. Studio" required className={inputClassName} />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="space-address"
                className="mb-1.5 block text-sm font-medium text-[#343630]">
                Address
              </label>

              <input
                id="space-address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="e.g. 12 Nguyen Van Dau, Binh Thanh"
                required
                className={inputClassName}
              />
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
                min={0}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="Optional"
                className={inputClassName}
              />
            </div>

            {/* Description */}
            <div>
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
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-[#eeeeea] px-6 py-4">
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