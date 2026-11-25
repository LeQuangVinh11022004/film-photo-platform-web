"use client";

import { X } from "lucide-react";
import type { ProviderEquipment } from "@/features/equipment";

type Props = {
  equipment: ProviderEquipment | null;
  spaceName?: string;
  onClose: () => void;
  onEdit: (equipment: ProviderEquipment) => void;
  onManageAvailability?: (equipment: ProviderEquipment) => void;
};

function formatPrice(value: number | null) {
  if (value == null) return "—";
  return `${value.toLocaleString("vi-VN")} VND`;
}

export function EquipmentDetailsModal({
  equipment,
  spaceName,
  onClose,
  onEdit,
  onManageAvailability,
}: Props) {
  if (!equipment) return null;

  const rows: [string, string][] = [
    ["Space", `${spaceName ?? equipment.spaceId} (${equipment.spaceType})`],
    ["Equipment type", equipment.equipmentType],
    ["Category", equipment.category],
    ["Variant", equipment.variant || "—"],
    ["Quantity", String(equipment.quantityTotal)],
    ["Rental price", formatPrice(equipment.rentalPrice)],
    ["Condition", equipment.conditionStatus],
    ["Status", equipment.status],
    ["Status note", equipment.statusNote || "—"],
    ["Description", equipment.description || "—"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-detail-title"
        className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
              {equipment.equipmentId}
            </p>
            <h2 id="equipment-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">
              {equipment.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close equipment details"
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
          {onManageAvailability && (
            <button
              type="button"
              onClick={() => onManageAvailability(equipment)}
              className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#e5f0e8]"
            >
              Availability
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(equipment)}
            className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]"
          >
            Edit
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
