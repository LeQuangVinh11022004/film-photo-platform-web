"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import type {
  ProviderChemical,
  ProviderChemicalMovementType,
  ProviderChemicalStockAdjustmentRequest,
} from "@/features/provider-chemical";

const fieldClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

export type StockAdjustmentFormValues = {
  movementType: ProviderChemicalMovementType;
  quantityDelta: string;
  unitCost: string;
  supplierOrReference: string;
  note: string;
};

type Props = {
  chemical: ProviderChemical | null;
  values: StockAdjustmentFormValues;
  error?: string;
  submitting: boolean;
  onChange: (values: StockAdjustmentFormValues) => void;
  onClose: () => void;
  onSubmit: (payload: ProviderChemicalStockAdjustmentRequest) => void;
};

export function ChemicalStockAdjustmentModal({
  chemical,
  values,
  error,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  if (!chemical) return null;

  const set = <K extends keyof StockAdjustmentFormValues,>(
    key: K,
    value: StockAdjustmentFormValues[K],
  ) => onChange({ ...values, [key]: value });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawDelta = Number(values.quantityDelta);
    const quantityDelta =
      (values.movementType === "CONSUMPTION" || values.movementType === "WASTE") &&
      rawDelta > 0
        ? -rawDelta
        : rawDelta;

    onSubmit({
      movementType: values.movementType,
      quantityDelta,
      unitCost: values.unitCost.trim() === "" ? null : Number(values.unitCost),
      supplierOrReference: values.supplierOrReference.trim() || null,
      note: values.note.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-adjust-title"
        className="w-full max-w-md rounded-lg border border-[#e0e0da] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-4">
          <div>
            <h2 id="stock-adjust-title" className="text-lg font-semibold text-[#20221f]">Adjust stock</h2>
            <p className="text-xs text-[#777973]">
              {chemical.name} (Current: {chemical.stockQuantity} {chemical.stockUnit})
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-6">
          {error && (
            <p role="alert" className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">{error}</p>
          )}

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Movement type
            <select value={values.movementType} onChange={(e) => set("movementType", e.target.value as ProviderChemicalMovementType)} className={fieldClassName}>
              <option value="PURCHASE">PURCHASE (+ restock)</option>
              <option value="CONSUMPTION">CONSUMPTION (- usage)</option>
              <option value="ADJUSTMENT">ADJUSTMENT (+/- delta)</option>
              <option value="WASTE">WASTE (- expired/spilled)</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Quantity delta ({chemical.stockUnit})
            <input type="number" required step="0.001" value={values.quantityDelta} onChange={(e) => set("quantityDelta", e.target.value)} className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Unit cost (VND, optional)
            <input type="number" min={0} step="0.01" value={values.unitCost} onChange={(e) => set("unitCost", e.target.value)} className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Supplier or reference (optional)
            <input maxLength={255} value={values.supplierOrReference} onChange={(e) => set("supplierOrReference", e.target.value)} placeholder="e.g. PO-2026-11" className={fieldClassName} />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
            Note (optional)
            <input maxLength={1000} value={values.note} onChange={(e) => set("note", e.target.value)} placeholder="Reason for adjustment" className={fieldClassName} />
          </label>

          <div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4">
            <button type="button" onClick={onClose} className="h-9 rounded-md border border-[#d8d8d1] px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]">Cancel</button>
            <button type="submit" disabled={submitting} className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
              {submitting ? "Saving…" : "Record movement"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
