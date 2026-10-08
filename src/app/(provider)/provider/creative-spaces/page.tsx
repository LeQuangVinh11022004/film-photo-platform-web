"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import type { CreativeSpace } from "@/features/creative-space";
import { Pagination } from "@/shared/components/Pagination";
import { CreativeSpaceModal } from "@/features/creative-space/components/CreativeSpaceModal";
import { LayoutGrid, MapPin, Table2 } from "lucide-react";

type CreativeSpaceRow = CreativeSpace;

const spaces: CreativeSpaceRow[] = [
  {
    id: "SP-1001",
    name: "North Light Studio",
    address: "12 Nguyen Van Dau, Binh Thanh",
    capacity: 8,
    isActive: true,
  },
  {
    id: "SP-1002",
    name: "Cyclorama Room",
    address: "48A Le Van Sy, Phu Nhuan",
    capacity: 10,
    isActive: true,
  },
  {
    id: "SP-1003",
    name: "Product Corner",
    address: "48A Le Van Sy, Phu Nhuan",
    capacity: 4,
    isActive: true,
  },
  {
    id: "SP-1004",
    name: "Vintage Room",
    address: "91 Vo Van Tan, District 3",
    capacity: 6,
    isActive: false,
  },
  {
    id: "SP-1005",
    name: "Rooftop Set",
    address: "25 Tran Quoc Toan, District 3",
    capacity: 12,
    isActive: true,
  },
  {
    id: "SP-1006",
    name: "Outdoor Garden",
    address: "12 Nguyen Van Dau, Binh Thanh",
    capacity: 15,
    isActive: true,
  },
  {
    id: "SP-1007",
    name: "Black Box Studio",
    address: "48A Le Van Sy, Phu Nhuan",
    capacity: 20,
    isActive: false,
  },
  {
    id: "SP-1008",
    name: "Loft Space",
    address: "91 Vo Van Tan, District 3",
    capacity: 10,
    isActive: true,
  },
  {
    id: "SP-1009",
    name: "Industrial Set",
    address: "25 Tran Quoc Toan, District 3",
    capacity: 8,
    isActive: true,
  },
  {
    id: "SP-1010",
    name: "Minimalist Room",
    address: "12 Nguyen Van Dau, Binh Thanh",
    capacity: 6,
    isActive: true,
  },
  {
    id: "SP-1011",
    name: "Artistic Studio",
    address: "48A Le Van Sy, Phu Nhuan",
    capacity: 10,
    isActive: true,
  },
  {
    id: "SP-1012",
    name: "Classic Set",
    address: "91 Vo Van Tan, District 3",
    capacity: 12,
    isActive: false,
  },
  {
    id: "SP-1013",
    name: "Modern Loft",
    address: "25 Tran Quoc Toan, District 3",
    capacity: 15,
    isActive: true,
  },
  {
    id: "SP-1014",
    name: "Photography Corner",
    address: "12 Nguyen Van Dau, Binh Thanh",
    capacity: 8,
    isActive: true,
  },
  {
    id: "SP-1015",
    name: "Cinematic Room",
    address: "48A Le Van Sy, Phu Nhuan",
    capacity: 10,
    isActive: true,
  },
  {
    id: "SP-1016",
    name: "Perfecto Darkroom",
    address: "91 Vo Van Tan, District 3",
    capacity: 20,
    isActive: false,
  },
  {
    id: "SP-1017",
    name: "Sunset Terrace",
    address: "25 Tran Quoc Toan, District 3",
    capacity: 12,
    isActive: true,
  },
  {
    id: "SP-1018",
    name: "Vintage Loft",
    address: "12 Nguyen Van Dau, Binh Thanh",
    capacity: 10,
    isActive: true,
  },
  {
    id: "SP-1019",
    name: "Industrial Studio",
    address: "48A Le Van Sy, Phu Nhuan",
    capacity: 15,
    isActive: true,
  },
  {
    id: "SP-1020",
    name: "Minimalist Set",
    address: "91 Vo Van Tan, District 3",
    capacity: 8,
    isActive: true,
  },
];

const spaceImages = [
  "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1603425013520-e0b30e6e37dc?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1698899114708-36cc73fb5654?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1610719885572-e032f944dcf9?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1787572972355-aaa6ae7433fe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

const fieldClassName =
  "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function statusClass(isActive: boolean) {
  return isActive
    ? "bg-[#e5f0e8] text-[#39724b]"
    : "bg-[#f5e4e1] text-[#a34d42]";
}

function statusLabel(isActive: boolean) {
  return isActive ? "Active" : "Inactive";
}

function exportSpaces(rows: CreativeSpaceRow[]) {
  const header = [
    "Space ID",
    "Name",
    "Description",
    "Address",
    "Capacity",
    "Status",
  ];
  const csv = [
    header,
    ...rows.map((space) => [
      space.id,
      space.name,
      space.address,
      space.capacity,
      statusLabel(space.isActive),
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
  link.download = "creative-spaces.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function CreativeSpacesPage() {
  const tableRef = useRef<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<CreativeSpaceRow | null>(
    null,
  );

  const [spaceModalOpen, setSpaceModalOpen] = useState(false);
  const [spaceModalMode, setSpaceModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingSpace, setEditingSpace] = useState<CreativeSpaceRow | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSpaces = spaces.filter((space) => {
    const matchesQuery = `${space.name} ${space.address} ${space.id}`
      .toLowerCase()
      .includes(normalizedQuery);
    return (
      matchesQuery &&
      (!status || (status === "active" ? space.isActive : !space.isActive))
    );
  });

  const totalFilteredSpaces = filteredSpaces.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSpaces = filteredSpaces.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const activeCount = spaces.filter((space) => space.isActive).length;
  const totalCapacity = spaces.reduce(
    (total, space) => total + space.capacity,
    0,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleAddSpace = () => {
    setEditingSpace(null);
    setSpaceModalMode("create");
    setSpaceModalOpen(true);
  };

  const handleEditSpace = (space: CreativeSpaceRow) => {
    setEditingSpace(space);
    setSpaceModalMode("edit");
    setSpaceModalOpen(true);
  };

  const handleDeleteSpace = (space: CreativeSpaceRow) => {
    console.log("Delete creative space:", space);
  };

  const handleCloseSpaceModal = () => {
    setSpaceModalOpen(false);
    setEditingSpace(null);
  };

  const handleSubmitSpace = (data: {
    name: string;
    address: string;
    capacity: number;
    isActive: boolean;
  }) => {
    if (spaceModalMode === "create") {
      console.log("Create creative space:", data);
    } else {
      console.log("Update creative space:", {
        id: editingSpace?.id,
        ...data,
      });
    }
    handleCloseSpaceModal();
  };

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="Provider workspace"
            title="Creative spaces"
            description="Manage the spaces customers can reserve from your provider account."
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-2">
          <span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">
            Sample data
          </span>
          <button
            type="button"
            onClick={() => exportSpaces(filteredSpaces)}
            className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <section
        aria-label="Creative space summary"
        className="-mt-2 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total spaces",
            value: spaces.length.toString(),
            helper: "All spaces in your catalogue",
          },
          {
            label: "Active spaces",
            value: activeCount.toString(),
            helper: "Currently available for booking",
          },
          {
            label: "Total capacity",
            value: totalCapacity.toString(),
            helper: "Maximum people across all spaces",
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

      {spaces.length === 0 ? (
        <>
          {/* No creative spaces */}
          <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9eee7]">
                <span className="text-lg font-semibold text-[#45644a]">SP</span>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#20221f]">
                No creative spaces yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#777973]">
                You haven&apos;t added any creative spaces yet. Add your first
                space to make it available for customers to reserve.
              </p>

              <button
                type="button"
                onClick={handleAddSpace}
                className="mt-5 h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">
                + Add new space
              </button>
            </div>
          </section>
        </>
      ) : (
        <section
          ref={tableRef}
          className="scroll-mt-20 mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
          {/* Filter and search controls */}
          <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#20221f]">
                  All creative spaces
                </h2>
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={totalFilteredSpaces}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleAddSpace}
                className="h-9 w-fit shrink-0 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]">
                + Add new space
              </button>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="grid gap-2 sm:grid-cols-[minmax(180px,260px)_150px]">
                  <label className="sr-only" htmlFor="space-search">
                    Search creative spaces
                  </label>

                  <input
                    id="space-search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search name, address or ID..."
                    className={fieldClassName}
                  />

                  <label className="sr-only" htmlFor="space-status">
                    Filter by status
                  </label>

                  <select
                    id="space-status"
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setCurrentPage(1);
                    }}
                    className={fieldClassName}>
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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

          {/* List of creative spaces */}
          {/* Creative spaces: Table / Grid */}
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-205 border-collapse text-left">
                <thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
                  <tr>
                    <th className="px-5 py-3">Space</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eeeeea]">
                  {paginatedSpaces.map((space) => (
                    <tr
                      key={space.id}
                      className="transition-colors hover:bg-[#fcfcfa]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] text-xs font-semibold text-[#45644a]">
                            SP
                          </span>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#292b27]">
                              {space.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[#777973]">
                              {space.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-[#686a64]">
                        {space.address}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-[#686a64]">
                        {space.capacity} people
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(space.isActive)}`}>
                          {statusLabel(space.isActive)}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedSpace(space)}
                          className="text-sm font-semibold text-[#39724b] hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {paginatedSpaces.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        No creative spaces match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 bg-[#fafaf8] p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedSpaces.map((space) => (
                <article
                  key={space.id}
                  className="group overflow-hidden rounded-lg border border-[#e0e0da] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cdd2c5] hover:shadow-md">
                  {/* Thumbnail */}
                  <div className="relative aspect-4/3 overflow-hidden bg-[#e9eee7]">
                    <img
                      src={
                        spaceImages[
                          Number(space.id.split("-")[1]) % spaceImages.length
                        ]
                      }
                      alt={space.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover"
                    />

                    <span
                      className={`absolute right-3 top-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${statusClass(space.isActive)}`}>
                      {statusLabel(space.isActive)}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="p-4">
                    <p className="text-xs font-medium text-[#858680]">
                      {space.id}
                    </p>

                    <h3 className="mt-1 truncate text-base font-semibold text-[#20221f]">
                      {space.name}
                    </h3>

                    <p className="mt-2 flex min-h-10 items-start gap-2 text-sm leading-5 text-[#686a64]">
                      <span className="shrink-0" aria-hidden="true">
                        <MapPin name="map-pin" size="16px" />
                      </span>
                      <span>{space.address}</span>
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-[#eeeeea] pt-3">
                      <span className="text-sm text-[#686a64]">Capacity</span>
                      <span className="text-sm font-semibold text-[#343630]">
                        {space.capacity} people
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSpace(space)}
                      className="mt-4 h-9 w-full rounded-md border border-[#39724b] text-sm font-semibold text-[#39724b] transition-colors hover:bg-[#39724b] hover:text-white">
                      View details
                    </button>
                  </div>
                </article>
              ))}

              {paginatedSpaces.length === 0 && (
                <div className="col-span-full px-5 py-12 text-center text-sm text-[#777973]">
                  No creative spaces match your filters.
                </div>
              )}
            </div>
          )}

          {/* Pagination controls at the bottom */}
          <div className="border-t border-[#e8e8e2] px-5 py-4">
            <Pagination
              currentPage={currentPage}
              totalItems={totalFilteredSpaces}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      )}

      {selectedSpace && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
          onClick={() => setSelectedSpace(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="space-detail-title"
            className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                  {selectedSpace.id}
                </p>
                <h2
                  id="space-detail-title"
                  className="mt-1 text-xl font-semibold text-[#20221f]">
                  {selectedSpace.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpace(null)}
                aria-label="Close space details"
                className="rounded-md px-2 py-1 text-lg text-[#777973] hover:bg-[#f0f0ec]">
                ×
              </button>
            </div>
            {/* <dl className="mt-6 divide-y divide-[#eeeeea] text-sm">
              {[["Provider ID", selectedSpace.providerId], ["Description", selectedSpace.description], ["Address", selectedSpace.address], ["Capacity", `${selectedSpace.capacity} people`], ["Status", statusLabel(selectedSpace.isActive)]].map(([label, value]) => <div key={label} className="flex justify-between gap-6 py-3"><dt className="shrink-0 text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}
            </dl> */}
            <p className="mt-4 text-xs text-[#858680]">
              Actions are ready to connect to the creative-space API.
            </p>
          </section>
        </div>
      )}

      <CreativeSpaceModal
        open={spaceModalOpen}
        mode={spaceModalMode}
        space={editingSpace}
        onClose={handleCloseSpaceModal}
        onSubmit={handleSubmitSpace}
      />
    </div>
  );
}
