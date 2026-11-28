"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type {
  ProviderEquipment,
  ProviderEquipmentConditionStatus,
  ProviderEquipmentCreateRequest,
  ProviderEquipmentStatus,
  ProviderEquipmentUpdateRequest,
} from "@/features/equipment";
import type { ProviderSpace } from "@/features/provider-space";

type EquipmentModalProps = {
  open: boolean;
  mode: "create" | "edit";
  spaces: ProviderSpace[];
  equipment?: ProviderEquipment | null;
  error?: string;
  submitting?: boolean;
  onClose: () => void;
  onCreate: (data: ProviderEquipmentCreateRequest) => void;
  onUpdate: (data: ProviderEquipmentUpdateRequest) => void;
};

const inputClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const textareaClassName =
  "min-h-20 w-full resize-y rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const categories = [
  "Camera",
  "Lens",
  "Lighting",
  "Darkroom",
  "Enlarger",
  "Film Processor",
  "Audio",
  "Support",
  "Other",
];

const conditionOptions: { value: ProviderEquipmentConditionStatus; label: string }[] = [
  { value: "GOOD", label: "Good (GOOD)" },
  { value: "NEEDS_REPAIR", label: "Needs Repair (NEEDS_REPAIR)" },
  { value: "DAMAGED", label: "Damaged (DAMAGED)" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance (UNDER_MAINTENANCE)" },
];

export function EquipmentModal({
  open,
  mode,
  spaces,
  equipment,
  error,
  submitting = false,
  onClose,
  onCreate,
  onUpdate,
}: EquipmentModalProps) {
  const isEditMode = mode === "edit";
  const [spaceId, setSpaceId] = useState(
    equipment?.spaceId ?? spaces[0]?.spaceId ?? "",
  );
  const selectedSpace = spaces.find((s) => s.spaceId === spaceId);
  const derivedSpaceType =
    equipment?.spaceType?.toUpperCase() === "DARKROOM" ||
    selectedSpace?.type?.toUpperCase() === "DARKROOM"
      ? "DARKROOM"
      : "STUDIO";
  const [name, setName] = useState(equipment?.name ?? "");
  const [category, setCategory] = useState(
    equipment?.category ?? (derivedSpaceType === "DARKROOM" ? "Enlarger" : "Camera"),
  );
  const [variant, setVariant] = useState(equipment?.variant ?? "");
  const [description, setDescription] = useState(equipment?.description ?? "");
  const [specificationsJson, setSpecificationsJson] = useState(
    equipment?.specificationsJson ?? "",
  );
  const [quantityTotal, setQuantityTotal] = useState(
    equipment ? String(equipment.quantityTotal) : "1",
  );
  const [rentalPrice, setRentalPrice] = useState(
    equipment?.rentalPrice != null ? String(equipment.rentalPrice) : "",
  );
  const [status, setStatus] = useState<ProviderEquipmentStatus>(
    equipment?.status?.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  );
  const [conditionStatus, setConditionStatus] =
    useState<ProviderEquipmentConditionStatus>(
      (equipment?.conditionStatus?.toUpperCase() as ProviderEquipmentConditionStatus) ||
        "GOOD",
    );
  const [statusNote, setStatusNote] = useState(equipment?.statusNote ?? "");

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQty = Math.max(1, Number.parseInt(quantityTotal, 10) || 1);
    const parsedPrice =
      rentalPrice.trim() === "" ? null : Number(rentalPrice);

    const common = {
      equipmentType: derivedSpaceType,
      name: name.trim(),
      category: category.trim(),
      variant: variant.trim() || null,
      description: description.trim() || null,
      specificationsJson: specificationsJson.trim() || null,
      quantityTotal: parsedQty,
      rentalPrice: parsedPrice,
    };

    if (isEditMode) {
      onUpdate({
        ...common,
        status,
        conditionStatus,
        statusNote: statusNote.trim() || null,
      });
    } else {
      onCreate({
        spaceId,
        ...common,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-4"
      onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-modal-title"
        className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#e0e0da] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eeeeea] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
              Equipment management
            </p>
            <h2
              id="equipment-modal-title"
              className="mt-1 text-xl font-semibold text-[#20221f]">
              {isEditMode ? "Edit equipment" : "Add new equipment"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            {error && (
              <p
                role="alert"
                className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339] sm:col-span-2">
                {error}
              </p>
            )}

            {!isEditMode && (
              <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
                Studio / Darkroom (Space)
                <select
                  required
                  value={spaceId}
                  onChange={(event) => setSpaceId(event.target.value)}
                  className={inputClassName}>
                  <option value="" disabled>
                    Select studio or darkroom
                  </option>
                  {spaces.map((space) => (
                    <option key={space.spaceId} value={space.spaceId}>
                      {space.name} ({space.type})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
              Equipment name
              <input
                type="text"
                required
                maxLength={200}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Hasselblad 500C/M"
                className={inputClassName}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
              Owner type (EquipmentType)
              <input
                type="text"
                readOnly
                value={derivedSpaceType}
                className={`${inputClassName} bg-[#f8f8f5] text-[#777973]`}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClassName}>
                {!categories.includes(category) && category && (
                  <option value={category}>{category}</option>
                )}
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
              Variant / Model (optional)
              <input
                type="text"
                maxLength={150}
                value={variant}
                onChange={(event) => setVariant(event.target.value)}
                placeholder="e.g. 80mm f/2.8 Planar"
                className={inputClassName}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
              Total quantity
              <input
                type="number"
                required
                min={1}
                step={1}
                value={quantityTotal}
                onChange={(event) => setQuantityTotal(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
              Rental price (VND)
              <input
                type="number"
                min={0}
                step="0.01"
                value={rentalPrice}
                onChange={(event) => setRentalPrice(event.target.value)}
                placeholder="e.g. 350000"
                className={inputClassName}
              />
            </label>

            {isEditMode && (
              <>
                <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                  Status
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as ProviderEquipmentStatus)
                    }
                    className={inputClassName}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                  Condition status
                  <select
                    value={conditionStatus}
                    onChange={(event) =>
                      setConditionStatus(
                        event.target.value as ProviderEquipmentConditionStatus,
                      )
                    }
                    className={inputClassName}>
                    {conditionOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
                  Status / Maintenance note (optional)
                  <input
                    type="text"
                    maxLength={1000}
                    value={statusNote}
                    onChange={(event) => setStatusNote(event.target.value)}
                    placeholder="Reason for status or condition change"
                    className={inputClassName}
                  />
                </label>
              </>
            )}

            <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
              Description (optional)
              <textarea
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this equipment item..."
                className={textareaClassName}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
              Specifications JSON (optional)
              <input
                type="text"
                value={specificationsJson}
                onChange={(event) => setSpecificationsJson(event.target.value)}
                placeholder='e.g. {"mount":"FE","format":"35mm"}'
                className={inputClassName}
              />
            </label>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-[#eeeeea] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-[#d8d8d1] bg-white px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (!isEditMode && !spaceId)}
              className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
              {submitting
                ? "Saving…"
                : isEditMode
                  ? "Save changes"
                  : "Add equipment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
