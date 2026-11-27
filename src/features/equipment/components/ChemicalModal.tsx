"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import type {
  ProviderChemical,
  ProviderChemicalStatus,
  ProviderChemicalRequest,
} from "@/features/provider-chemical";
import type { ProviderSpace } from "@/features/provider-space";

const fieldClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

export type ChemicalFormValues = {
  darkroomId: string;
  name: string;
  chemicalType: string;
  brand: string;
  stockQuantity: string;
  stockUnit: string;
  minimumStock: string;
  unitCost: string;
  unitSellingPrice: string;
  expiresOn: string;
  status: ProviderChemicalStatus;
  statusNote: string;
};

type Props = {
  open: boolean;
  chemical: ProviderChemical | null;
  darkrooms: ProviderSpace[];
  values: ChemicalFormValues;
  error?: string;
  submitting: boolean;
  onChange: (values: ChemicalFormValues) => void;
  onClose: () => void;
  onSubmit: (payload: ProviderChemicalRequest, darkroomId: string) => void;
};

export function ChemicalModal({
  open,
  chemical,
  darkrooms,
  values,
  error,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  const set = <K extends keyof ChemicalFormValues,>(key: K, value: ChemicalFormValues[K]) =>
    onChange({ ...values, [key]: value });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(
      {
        name: values.name.trim(),
        chemicalType: values.chemicalType.trim(),
        brand: values.brand.trim() || null,
        stockQuantity: Math.max(0, Number(values.stockQuantity) || 0),
        stockUnit: values.stockUnit.trim() || "L",
        minimumStock: Math.max(0, Number(values.minimumStock) || 0),
        unitCost: values.unitCost.trim() === "" ? null : Number(values.unitCost),
        unitSellingPrice: Number(values.unitSellingPrice),
        expiresOn: values.expiresOn.trim() || null,
        status: values.status,
        statusNote: values.statusNote.trim() || null,
      },
      values.darkroomId,
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chemical-modal-title"
        className="my-auto w-full max-w-xl rounded-lg border border-[#e0e0da] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-4">
          <h2 id="chemical-modal-title" className="text-lg font-semibold text-[#20221f]">
            {chemical ? "Edit chemical" : "Add darkroom chemical"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
          {error && (
            <p role="alert" className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339] sm:col-span-2">
              {error}
            </p>
          )}

          {!chemical && (
            <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
              Darkroom
              <select required value={values.darkroomId} onChange={(e) => set("darkroomId", e.target.value)} className={fieldClassName}>
                <option value="" disabled>Select darkroom</option>
                {darkrooms.map((room) => (
                  <option key={room.spaceId} value={room.spaceId}>{room.name}</option>
                ))}
              </select>
            </label>
          )}

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Name
            <input required maxLength={200} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ilford ID-11 Developer" className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Chemical type
            <select value={values.chemicalType} onChange={(e) => set("chemicalType", e.target.value)} className={fieldClassName}>
              {["DEVELOPER", "STOP_BATH", "FIXER", "HYPO_CLEAR", "WETTING_AGENT", "TONER", "OTHER"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Brand (optional)
            <input maxLength={100} value={values.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Ilford, Kodak" className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Stock unit
            <input required maxLength={30} value={values.stockUnit} onChange={(e) => set("stockUnit", e.target.value)} placeholder="e.g. L, mL, pack" className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Stock quantity
            <input type="number" required min={0} step="0.001" value={values.stockQuantity} onChange={(e) => set("stockQuantity", e.target.value)} className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Minimum stock (low-stock threshold)
            <input type="number" required min={0} step="0.001" value={values.minimumStock} onChange={(e) => set("minimumStock", e.target.value)} className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Unit cost (VND, optional)
            <input type="number" min={0} step="0.01" value={values.unitCost} onChange={(e) => set("unitCost", e.target.value)} className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Unit selling price (VND)
            <input type="number" required min={0.01} max={9999999999.99} step="0.01" value={values.unitSellingPrice} onChange={(e) => set("unitSellingPrice", e.target.value)} className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Expires on (optional)
            <input type="date" value={values.expiresOn} onChange={(e) => set("expiresOn", e.target.value)} className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Status
            <select value={values.status} onChange={(e) => set("status", e.target.value as ProviderChemicalStatus)} className={fieldClassName}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Status note (optional)
            <input maxLength={1000} value={values.statusNote} onChange={(e) => set("statusNote", e.target.value)} className={fieldClassName} />
          </label>

          <div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4 sm:col-span-2">
            <button type="button" onClick={onClose} className="h-9 rounded-md border border-[#d8d8d1] px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
              {submitting ? "Saving…" : chemical ? "Save changes" : "Add chemical"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
