"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import type { Equipment } from "@/features/equipment";

type EquipmentRow = Equipment;

const equipment: EquipmentRow[] = [
  {
    id: "EQ-2001",
    name: "Sony A7 IV",
    category: "Camera",
    price: 650000,
    quantity: 3,
    isAvailable: true,
  },
  {
    id: "EQ-2002",
    name: "Godox AD600Pro",
    category: "Lighting",
    price: 250000,
    quantity: 4,
    isAvailable: true,
  },
  {
    id: "EQ-2003",
    name: "Sigma 24-70mm F2.8",
    category: "Lens",
    price: 350000,
    quantity: 2,
    isAvailable: true,
  },
  {
    id: "EQ-2004",
    name: "Manfrotto Tripod",
    category: "Support",
    price: 120000,
    quantity: 6,
    isAvailable: true,
  },
  {
    id: "EQ-2005",
    name: "Wireless Mic Kit",
    category: "Audio",
    price: 180000,
    quantity: 2,
    isAvailable: false,
  },
];

const fieldClassName =
  "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function statusClass(isAvailable: boolean) {
  return isAvailable
    ? "bg-[#e5f0e8] text-[#39724b]"
    : "bg-[#f5e4e1] text-[#a34d42]";
}

function statusLabel(isAvailable: boolean) {
  return isAvailable ? "Available" : "Not Available";
}

function exportEquipment(rows: EquipmentRow[]) {
  const header = [
    "Equipment ID",
    "Name",
    "Category",
    "Price",
    "Quantity",
    "Status",
  ];
  const csv = [
    header,
    ...rows.map((item) => [
      item.id,
      item.name,
      item.category,
      item.price,
      item.quantity,
      statusLabel(item.isAvailable),
    ]),
  ]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "equipment.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export default function EquipmentPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentRow | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const categories = [...new Set(equipment.map((item) => item.category))];
  const filteredEquipment = equipment.filter((item) => {
    const matchesQuery = `${item.name} ${item.category} ${item.id}`
      .toLowerCase()
      .includes(normalizedQuery);
    return (
      matchesQuery &&
      (!category || item.category === category) &&
      (!status || item.isAvailable === (status === "available"))
    );
  });

  const activeCount = equipment.filter((item) => item.isAvailable).length;
  const totalQuantity = equipment.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="Provider workspace"
            title="Equipment"
            description="Manage the equipment listings and stock offered by your provider account."
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-2">
          <span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">
            Sample data
          </span>
          <button
            type="button"
            onClick={() => exportEquipment(filteredEquipment)}
            className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">
            Export CSV
          </button>
        </div>
      </div>

      <section
        aria-label="Equipment summary"
        className="-mt-2 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total equipment",
            value: equipment.length.toString(),
            helper: "Equipment listings in your catalogue",
          },
          {
            label: "Active listings",
            value: activeCount.toString(),
            helper: "Currently available to customers",
          },
          {
            label: "Total quantity",
            value: totalQuantity.toString(),
            helper: "Units across all listings",
          },
        ].map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-[#e0e0da] bg-white p-4">
            <p className="text-sm text-[#686a64]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#20221f]">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-[#858680]">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-[#20221f]">
              Equipment catalogue
            </h2>
            <p className="mt-1 text-sm text-[#777973]">
              Showing {filteredEquipment.length} of {equipment.length} listings
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(180px,240px)_135px_135px]">
            <label className="sr-only" htmlFor="equipment-search">
              Search equipment
            </label>
            <input
              id="equipment-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, category or ID..."
              className={fieldClassName}
            />
            <label className="sr-only" htmlFor="equipment-category">
              Filter by category
            </label>
            <select
              id="equipment-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={fieldClassName}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="equipment-status">
              Filter by status
            </label>
            <select
              id="equipment-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={fieldClassName}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-215 border-collapse text-left">
            <thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
              <tr>
                <th className="px-5 py-3">Equipment</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeea]">
              {filteredEquipment.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#fcfcfa]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] text-xs font-semibold text-[#45644a]">
                        EQ
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#292b27]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#777973]">
                          {item.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {item.category}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.isAvailable)}`}>
                      {statusLabel(item.isAvailable)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedEquipment(item)}
                      className="text-sm font-semibold text-[#39724b] hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEquipment.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-[#777973]">
                    No equipment matches your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedEquipment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
          onClick={() => setSelectedEquipment(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipment-detail-title"
            className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                  {selectedEquipment.id}
                </p>
                <h2
                  id="equipment-detail-title"
                  className="mt-1 text-xl font-semibold text-[#20221f]">
                  {selectedEquipment.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEquipment(null)}
                aria-label="Close equipment details"
                className="rounded-md px-2 py-1 text-lg text-[#777973] hover:bg-[#f0f0ec]">
                ×
              </button>
            </div>
            <dl className="mt-6 divide-y divide-[#eeeeea] text-sm">
              {[
                // ["Provider ID", selectedEquipment.providerId],
                ["Category", selectedEquipment.category],
                ["Price", formatPrice(selectedEquipment.price)],
                ["Quantity", selectedEquipment.quantity.toString()],
                ["Status", statusLabel(selectedEquipment.isAvailable)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <dt className="text-[#777973]">{label}</dt>
                  <dd className="text-right font-medium text-[#343630]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-[#858680]">
              Actions are ready to connect to the equipment API.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
