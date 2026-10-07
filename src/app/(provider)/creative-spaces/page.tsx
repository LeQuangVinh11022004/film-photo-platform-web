"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import type { CreativeSpace } from "@/features/creative-space";

type CreativeSpaceRow = CreativeSpace;

const spaces: CreativeSpaceRow[] = [
  { id: "SP-1001", name: "North Light Studio", address: "12 Nguyen Van Dau, Binh Thanh", capacity: 8, isActive: true },
  { id: "SP-1002", name: "Cyclorama Room", address: "48A Le Van Sy, Phu Nhuan", capacity: 10, isActive: true },
  { id: "SP-1003", name: "Product Corner", address: "48A Le Van Sy, Phu Nhuan", capacity: 4, isActive: true },
  { id: "SP-1004", name: "Vintage Room", address: "91 Vo Van Tan, District 3", capacity: 6, isActive: false },
  { id: "SP-1005", name: "Rooftop Set", address: "25 Tran Quoc Toan, District 3", capacity: 12, isActive: true },
];

const fieldClassName = "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function statusClass(isActive: boolean) {
  return isActive ? "bg-[#e5f0e8] text-[#39724b]" : "bg-[#f5e4e1] text-[#a34d42]";
}

function statusLabel(isActive: boolean) {
  return isActive ? "Active" : "Inactive";
}

function exportSpaces(rows: CreativeSpaceRow[]) {
  const header = ["Space ID", "Name", "Description", "Address", "Capacity", "Status"];
  const csv = [header, ...rows.map((space) => [space.id, space.name, space.address, space.capacity, statusLabel(space.isActive)])]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "creative-spaces.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function CreativeSpacesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<CreativeSpaceRow | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSpaces = spaces.filter((space) => {
    const matchesQuery = `${space.name} ${space.address} ${space.id}`.toLowerCase().includes(normalizedQuery);
    return matchesQuery && (!status || (status === "active" ? space.isActive : !space.isActive));
  });

  const activeCount = spaces.filter((space) => space.isActive).length;
  const totalCapacity = spaces.reduce((total, space) => total + space.capacity, 0);

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <PageHeader eyebrow="Provider workspace" title="Creative spaces" description="Manage the spaces customers can reserve from your provider account." />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-2">
          <span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">Sample data</span>
          <button type="button" onClick={() => exportSpaces(filteredSpaces)} className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">Export CSV</button>
        </div>
      </div>

      <section aria-label="Creative space summary" className="-mt-2 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total spaces", value: spaces.length.toString(), helper: "All spaces in your catalogue" },
          { label: "Active spaces", value: activeCount.toString(), helper: "Currently available for booking" },
          { label: "Total capacity", value: totalCapacity.toString(), helper: "Maximum people across all spaces" },
        ].map((metric) => (
          <article key={metric.label} className="rounded-lg border border-[#e0e0da] bg-white p-4">
            <p className="text-sm text-[#686a64]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#20221f]">{metric.value}</p>
            <p className="mt-1 text-xs text-[#858680]">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-[#20221f]">All creative spaces</h2>
            <p className="mt-1 text-sm text-[#777973]">Showing {filteredSpaces.length} of {spaces.length} spaces</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(180px,260px)_150px]">
            <label className="sr-only" htmlFor="space-search">Search creative spaces</label>
            <input id="space-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, address or ID..." className={fieldClassName} />
            <label className="sr-only" htmlFor="space-status">Filter by status</label>
            <select id="space-status" value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClassName}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

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
              {filteredSpaces.map((space) => (
                <tr key={space.id} className="transition-colors hover:bg-[#fcfcfa]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] text-xs font-semibold text-[#45644a]">SP</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#292b27]">{space.name}</p>
                        <p className="mt-0.5 text-xs text-[#777973]">{space.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">{space.address}</td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">{space.capacity} people</td>
                  <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(space.isActive)}`}>{statusLabel(space.isActive)}</span></td>
                  <td className="px-5 py-3.5 text-right"><button type="button" onClick={() => setSelectedSpace(space)} className="text-sm font-semibold text-[#39724b] hover:underline">View</button></td>
                </tr>
              ))}
              {filteredSpaces.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#777973]">No creative spaces match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4" onClick={() => setSelectedSpace(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="space-detail-title" className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">{selectedSpace.id}</p><h2 id="space-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">{selectedSpace.name}</h2></div>
              <button type="button" onClick={() => setSelectedSpace(null)} aria-label="Close space details" className="rounded-md px-2 py-1 text-lg text-[#777973] hover:bg-[#f0f0ec]">×</button>
            </div>
            {/* <dl className="mt-6 divide-y divide-[#eeeeea] text-sm">
              {[["Provider ID", selectedSpace.providerId], ["Description", selectedSpace.description], ["Address", selectedSpace.address], ["Capacity", `${selectedSpace.capacity} people`], ["Status", statusLabel(selectedSpace.isActive)]].map(([label, value]) => <div key={label} className="flex justify-between gap-6 py-3"><dt className="shrink-0 text-[#777973]">{label}</dt><dd className="text-right font-medium text-[#343630]">{value}</dd></div>)}
            </dl> */}
            <p className="mt-4 text-xs text-[#858680]">Actions are ready to connect to the creative-space API.</p>
          </section>
        </div>
      )}
    </div>
  );
}
