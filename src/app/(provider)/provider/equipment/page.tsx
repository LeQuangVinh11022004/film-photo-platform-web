"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import type { Equipment } from "@/features/equipment";
import { Pagination } from "@/shared/components/Pagination";
import { LayoutGrid, Table2 } from "lucide-react";
import { EquipmentModal } from "@/features/equipment/components/EquipmentModal";

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
  {
    id: "EQ-2006",
    name: "GoPro Hero 11",
    category: "Camera",
    price: 450000,
    quantity: 5,
    isAvailable: true,
  },
  {
    id: "EQ-2007",
    name: "DJI Ronin-S",
    category: "Stabilizer",
    price: 550000,
    quantity: 3,
    isAvailable: true,
  },
  {
    id: "EQ-2008",
    name: "Neewer LED Panel",
    category: "Lighting",
    price: 200000,
    quantity: 4,
    isAvailable: true,
  },
  {
    id: "EQ-2009",
    name: "Canon EF 50mm F1.8",
    category: "Lens",
    price: 150000,
    quantity: 2,
    isAvailable: true,
  },
];

const equipmentImages = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1759769191433-9560758fd4b7?q=80&w=746&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1570385404967-fe4e1b48454b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
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
  const tableRef = useRef<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentRow | null>(null);

  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [equipmentModalMode, setEquipmentModalMode] = useState<
    "create" | "edit"
  >("create");
  const [editingEquipment, setEditingEquipment] = useState<EquipmentRow | null>(
    null,
  );

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
  const totalFilteredEquipment = filteredEquipment.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEquipment = filteredEquipment.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const activeCount = equipment.filter((item) => item.isAvailable).length;
  const totalQuantity = equipment.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setEquipmentModalMode("create");
    setEquipmentModalOpen(true);
  };

  const handleEditEquipment = (item: EquipmentRow) => {
    setEditingEquipment(item);
    setEquipmentModalMode("edit");
    setEquipmentModalOpen(true);
  };

  const handleSubmitEquipment = (data: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    isAvailable: boolean;
  }) => {
    if (equipmentModalMode === "create") {
      console.log("Create equipment:", data);
    } else {
      console.log("Update equipment:", {
        id: editingEquipment?.id,
        ...data,
      });
    }

    setEquipmentModalOpen(false);
    setEditingEquipment(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

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

      <section
        ref={tableRef}
        className="scroll-mt-20 mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        {/* Header and top pagination */}
        <div className="flex flex-col gap-4 border-b border-[#e8e8e2] p-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#20221f]">
                Equipment catalogue
              </h2>
              <p className="mt-1 text-sm text-[#777973]">
                Showing {filteredEquipment.length} of {equipment.length}{" "}
                listings
              </p>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={totalFilteredEquipment}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleAddEquipment}
              className="h-9 w-fit shrink-0 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">
              + Add equipment
            </button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="grid gap-2 sm:grid-cols-[minmax(180px,240px)_135px_135px]">
                <label className="sr-only" htmlFor="equipment-search">
                  Search equipment
                </label>
                <input
                  id="equipment-search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, category or ID..."
                  className={fieldClassName}
                />

                <label className="sr-only" htmlFor="equipment-category">
                  Filter by category
                </label>
                <select
                  id="equipment-category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setCurrentPage(1);
                  }}
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
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setCurrentPage(1);
                  }}
                  className={fieldClassName}>
                  <option value="">All statuses</option>
                  <option value="available">Available</option>
                  <option value="inactive">Not Available</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewMode((current) =>
                    current === "table" ? "grid" : "table",
                  )
                }
                aria-label={
                  viewMode === "table"
                    ? "Switch to grid view"
                    : "Switch to table view"
                }
                title={
                  viewMode === "table"
                    ? "Switch to grid view"
                    : "Switch to table view"
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-md border border-[#d8d8d1] bg-white text-[#343630] transition-colors hover:bg-[#f3f5ef] sm:self-auto">
                {viewMode === "table" ? (
                  <LayoutGrid size={18} strokeWidth={1.8} />
                ) : (
                  <Table2 size={18} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Table view */}
        {viewMode === "table" ? (
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
                {paginatedEquipment.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#fcfcfa]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            equipmentImages[
                              Number(item.id.split("-")[1]) %
                                equipmentImages.length
                            ]
                          }
                          alt={item.name}
                          className="h-10 w-10 rounded-md bg-[#f0f1ec] object-cover"
                          loading="lazy"
                        />
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

                {paginatedEquipment.length === 0 && (
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
        ) : (
          /* Grid view */
          <div className="grid grid-cols-1 gap-4 bg-[#fafaf8] p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedEquipment.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-lg border border-[#e0e0da] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e9eee7]">
                  <img
                    src={
                      equipmentImages[
                        Number(item.id.split("-")[1]) % equipmentImages.length
                      ]
                    }
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <span
                    className={`absolute right-3 top-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${statusClass(item.isAvailable)}`}>
                    {statusLabel(item.isAvailable)}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium text-[#858680]">
                    {item.id}
                  </p>

                  <h3 className="mt-1 truncate text-base font-semibold text-[#20221f]">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-[#777973]">{item.category}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-[#686a64]">Daily price</span>
                    <span className="text-sm font-semibold text-[#20221f]">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-[#eeeeea] pt-3">
                    <span className="text-sm text-[#686a64]">Quantity</span>
                    <span className="text-sm font-semibold text-[#343630]">
                      {item.quantity} units
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEquipment(item)}
                    className="mt-4 h-9 w-full rounded-md border border-[#39724b] text-sm font-semibold text-[#39724b] transition-colors hover:bg-[#39724b] hover:text-white">
                    View details
                  </button>
                </div>
              </article>
            ))}

            {paginatedEquipment.length === 0 && (
              <div className="col-span-full px-5 py-12 text-center text-sm text-[#777973]">
                No equipment matches your filters.
              </div>
            )}
          </div>
        )}

        {/* Bottom pagination */}
        <div className="border-t border-[#e8e8e2] px-5 py-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalFilteredEquipment}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
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

      <EquipmentModal
        open={equipmentModalOpen}
        mode={equipmentModalMode}
        equipment={editingEquipment}
        onClose={() => {
          setEquipmentModalOpen(false);
          setEditingEquipment(null);
        }}
        onSubmit={handleSubmitEquipment}
      />
    </div>
  );
}
