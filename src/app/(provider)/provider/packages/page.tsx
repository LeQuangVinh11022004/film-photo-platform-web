"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import type { ServicePackage } from "@/features/service-package";

type ServicePackageRow = ServicePackage;

const packages: ServicePackageRow[] = [
  {
    id: "PK-3001",
    name: "Portrait Starter",
    description:
      "A simple portrait package with studio access and basic lighting.",
    price: 900000,
    duration: 120,
    isActive: true,
  },
  {
    id: "PK-3002",
    name: "Editorial Session",
    description: "Longer studio session for fashion and editorial photography.",
    price: 1800000,
    duration: 240,
    isActive: true,
  },
  {
    id: "PK-3003",
    name: "Product Campaign",
    description:
      "Product photography session with lighting and support equipment.",
    price: 1500000,
    duration: 180,
    isActive: true,
  },
  {
    id: "PK-3004",
    name: "Half-day Studio",
    description: "Flexible studio booking for commercial production teams.",
    price: 2500000,
    duration: 300,
    isActive: false,
  },
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
function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}
function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${remainder > 0 ? `${remainder}m` : ""}`.trim();
}

function exportPackages(rows: ServicePackageRow[]) {
  const header = [
    "Package ID",
    "Name",
    "Description",
    "Price",
    "Duration",
    "Status",
  ];
  const csv = [
    header,
    ...rows.map((item) => [
      item.id,
      item.name,
      item.description,
      item.price,
      item.duration,
      statusLabel(item.isActive),
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
  link.download = "service-packages.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function PackagesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selectedPackage, setSelectedPackage] =
    useState<ServicePackageRow | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPackages = packages.filter((item) => {
    const matchesQuery = `${item.name} ${item.description} ${item.id}`
      .toLowerCase()
      .includes(normalizedQuery);
    return matchesQuery && (!status || item.isActive === (status === "active"));
  });
  const activeCount = packages.filter((item) => item.isActive).length;
  const averagePrice = packages.length
    ? Math.round(
        packages.reduce((total, item) => total + item.price, 0) /
          packages.length,
      )
    : 0;

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="Provider workspace"
            title="Service packages"
            description="Configure the packages customers can discover and book from your provider account."
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-2">
          <span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">
            Sample data
          </span>
          <button
            type="button"
            onClick={() => exportPackages(filteredPackages)}
            className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">
            Export CSV
          </button>
        </div>
      </div>

      <section
        aria-label="Package summary"
        className="-mt-2 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total packages",
            value: packages.length.toString(),
            helper: "Packages in your catalogue",
          },
          {
            label: "Active packages",
            value: activeCount.toString(),
            helper: "Currently visible to customers",
          },
          {
            label: "Average price",
            value: formatPrice(averagePrice),
            helper: "Across all packages",
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
              All service packages
            </h2>
            <p className="mt-1 text-sm text-[#777973]">
              Showing {filteredPackages.length} of {packages.length} packages
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(180px,270px)_150px]">
            <label className="sr-only" htmlFor="package-search">
              Search packages
            </label>
            <input
              id="package-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, description or ID..."
              className={fieldClassName}
            />
            <label className="sr-only" htmlFor="package-status">
              Filter by status
            </label>
            <select
              id="package-status"
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
          <table className="w-full min-w-220 border-collapse text-left">
            <thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
              <tr>
                <th className="px-5 py-3">Package</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeea]">
              {filteredPackages.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#fcfcfa]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] text-xs font-semibold text-[#45644a]">
                        PK
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
                  <td className="max-w-xs px-4 py-3.5 text-sm text-[#686a64]">
                    <p className="truncate">{item.description}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {formatDuration(item.duration)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.isActive)}`}>
                      {statusLabel(item.isActive)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPackage(item)}
                      className="text-sm font-semibold text-[#39724b] hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPackages.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-[#777973]">
                    No packages match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
          onClick={() => setSelectedPackage(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-detail-title"
            className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                  {selectedPackage.id}
                </p>
                <h2
                  id="package-detail-title"
                  className="mt-1 text-xl font-semibold text-[#20221f]">
                  {selectedPackage.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                aria-label="Close package details"
                className="rounded-md px-2 py-1 text-lg text-[#777973] hover:bg-[#f0f0ec]">
                ×
              </button>
            </div>
            <dl className="mt-6 divide-y divide-[#eeeeea] text-sm">
              {[
                // ["Provider ID", selectedPackage.providerId],
                ["Description", selectedPackage.description],
                ["Price", formatPrice(selectedPackage.price)],
                ["Duration", formatDuration(selectedPackage.duration)],
                ["Status", statusLabel(selectedPackage.isActive)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <dt className="text-[#777973]">{label}</dt>
                  <dd className="max-w-[65%] text-right font-medium text-[#343630]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-[#858680]">
              Actions are ready to connect to the service-package API.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
