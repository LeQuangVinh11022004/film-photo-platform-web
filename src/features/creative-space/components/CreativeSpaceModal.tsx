"use client";

import { useState } from "react";
import type { CreativeSpace } from "@/features/creative-space";

type CreativeSpaceFormData = {
  name: string;
  address: string;
  capacity: number;
  isActive: boolean;
};

type CreativeSpaceModalProps = {
  open: boolean;
  mode: "create" | "edit";
  space?: CreativeSpace | null;
  onClose: () => void;
  onSubmit: (data: CreativeSpaceFormData) => void;
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
}: CreativeSpaceModalProps) {
  const [name, setName] = useState(() =>
    mode === "edit" && space ? space.name : "",
  );
  const [address, setAddress] = useState(() =>
    mode === "edit" && space ? space.address : "",
  );
  const [capacity, setCapacity] = useState(() =>
    mode === "edit" && space ? String(space.capacity) : "",
  );
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(() =>
    mode === "edit" && space ? space.isActive : true,
  );

  if (!open) {
    return null;
  }

  const isEditMode = mode === "edit";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      name: name.trim(),
      address: address.trim(),
      capacity: Number(capacity),
      isActive,
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
                min={1}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="e.g. 8"
                required
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

            {/* Status */}
            {/* <div className="flex items-center justify-between rounded-md border border-[#e0e0da] bg-[#fafaf7] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#343630]">
                  Active
                </p>
                <p className="mt-0.5 text-xs text-[#858680]">
                  Active spaces can be available for booking.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive((current) => !current)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isActive ? "bg-[#39724b]" : "bg-[#c8c9c2]"
                }`}>
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div> */}
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
              className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">
              {isEditMode ? "Save changes" : "Add space"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}