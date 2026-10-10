"use client";

import { useEffect, useState } from "react";
import type { Equipment } from "@/features/equipment";

type EquipmentFormData = {
  name: string;
  category: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
};

type EquipmentModalProps = {
  open: boolean;
  mode: "create" | "edit";
  equipment?: Equipment | null;
  onClose: () => void;
  onSubmit: (data: EquipmentFormData) => void;
};

const inputClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const categories = ["Camera", "Lens", "Lighting", "Audio", "Support", "Other"];

export function EquipmentModal({
  open,
  mode,
  equipment,
  onClose,
  onSubmit,
}: EquipmentModalProps) {
  const createForm = () => ({
    name: equipment?.name ?? "",
    category: equipment?.category ?? "Camera",
    price: equipment ? String(equipment.price) : "",
    quantity: equipment ? String(equipment.quantity) : "",
    isAvailable: equipment?.isAvailable ?? true,
  });
  const [form, setForm] = useState(createForm);
  const [previousContext, setPreviousContext] = useState({ open, mode, equipment });

  if (
    previousContext.open !== open ||
    previousContext.mode !== mode ||
    previousContext.equipment !== equipment
  ) {
    setPreviousContext({ open, mode, equipment });
    setForm(createForm());
  }

  const { name, category, price, quantity, isAvailable } = form;
  const setName = (value: string) => setForm((current) => ({ ...current, name: value }));
  const setCategory = (value: string) => setForm((current) => ({ ...current, category: value }));
  const setPrice = (value: string) => setForm((current) => ({ ...current, price: value }));
  const setQuantity = (value: string) => setForm((current) => ({ ...current, quantity: value }));
  const setIsAvailable = (value: boolean) => setForm((current) => ({ ...current, isAvailable: value }));

  if (!open) return null;

  const isEditMode = mode === "edit";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || !category || !price.trim() || !quantity.trim()) {
      return;
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return;
    }

    onSubmit({
      name: trimmedName,
      category,
      price: parsedPrice,
      quantity: parsedQuantity,
      isAvailable,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-4"
      onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-modal-title"
        className="my-auto w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#eeeeea] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
              Equipment management
            </p>

            <h2
              id="equipment-modal-title"
              className="mt-1 text-xl font-semibold text-[#20221f]">
              {isEditMode ? "Edit equipment" : "Add new equipment"}
            </h2>

            <p className="mt-1 text-sm text-[#777973]">
              {isEditMode
                ? "Update the information of this equipment listing."
                : "Add a new equipment item to your provider catalogue."}
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
            {/* Equipment name */}
            <div>
              <label
                htmlFor="equipment-name"
                className="mb-1.5 block text-sm font-medium text-[#343630]">
                Equipment name
              </label>

              <input
                id="equipment-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Sony A7 IV"
                required
                maxLength={120}
                className={inputClassName}
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="equipment-category"
                className="mb-1.5 block text-sm font-medium text-[#343630]">
                Category
              </label>

              <select
                id="equipment-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
                className={inputClassName}>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and quantity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="equipment-price"
                  className="mb-1.5 block text-sm font-medium text-[#343630]">
                  Rental price (VND)
                </label>

                <input
                  id="equipment-price"
                  type="number"
                  min={0}
                  step={1000}
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="e.g. 650000"
                  required
                  className={inputClassName}
                />

                <p className="mt-1 text-xs text-[#858680]">
                  Rental price per day.
                </p>
              </div>

              <div>
                <label
                  htmlFor="equipment-quantity"
                  className="mb-1.5 block text-sm font-medium text-[#343630]">
                  Quantity
                </label>

                <input
                  id="equipment-quantity"
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="e.g. 3"
                  required
                  className={inputClassName}
                />
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between gap-4 rounded-md border border-[#e0e0da] bg-[#fafaf7] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#343630]">
                  Available for booking
                </p>
                <p className="mt-0.5 text-xs text-[#858680]">
                  Set whether customers can book this equipment.
                </p>
              </div>

              {/* <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                aria-label="Available for booking"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  isAvailable ? "bg-[#39724b]" : "bg-[#c8c9c2]"
                }`}>
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    isAvailable ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button> */}
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
              className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">
              {isEditMode ? "Save changes" : "Add equipment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
