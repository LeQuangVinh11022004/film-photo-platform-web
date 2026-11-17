"use client";

import { X } from "lucide-react";
import type { ProviderChemical } from "@/features/provider-chemical";

type Props = {
  chemical: ProviderChemical | null;
  darkroomName?: string;
  onClose: () => void;
  onAdjustStock: (chemical: ProviderChemical) => void;
};

function formatPrice(value: number | null) {
  if (value == null) return "—";
  return `${value.toLocaleString("vi-VN")} VND`;
}

export function ChemicalDetailsModal({
  chemical,
  darkroomName,
  onClose,
  onAdjustStock,
}: Props) {
  if (!chemical) return null;

  const rows: [string, string][] = [
    ["Darkroom", darkroomName ?? chemical.darkroomId],
    ["Chemical type", chemical.chemicalType],
    ["Brand", chemical.brand || "—"],
    ["Stock quantity", `${chemical.stockQuantity} ${chemical.stockUnit}`],
    ["Minimum stock", `${chemical.minimumStock} ${chemical.stockUnit}`],
    ["Low-stock alert", chemical.isLowStock ? "YES (Low stock)" : "No"],
    ["Unit cost", formatPrice(chemical.unitCost)],
    ["Expires on", chemical.expiresOn || "—"],
    ["Status", chemical.status],
    ["Status note", chemical.statusNote || "—"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chemical-detail-title"
        className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
              {chemical.chemicalId}
            </p>
            <h2 id="chemical-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">
              {chemical.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chemical details"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"
          >
            <X size={18} />
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[#eeeeea] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#777973]">{label}</dt>
              <dd className="max-w-[65%] text-right font-medium text-[#343630]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex justify-end gap-2 border-t border-[#eeeeea] pt-4">
          <button
            type="button"
            onClick={() => onAdjustStock(chemical)}
            className="h-9 rounded-md border border-[#39724b] px-3 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]"
          >
            Adjust stock
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
