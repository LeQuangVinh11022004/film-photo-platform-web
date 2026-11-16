"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import {
  createMyProviderServicePackage,
  deleteMyProviderServicePackage,
  getMyProviderServicePackage,
  listMyProviderServicePackages,
  updateMyProviderServicePackage,
} from "@/features/service-package/api";
import type {
  ProviderServicePackage,
  ProviderServicePackageRequest,
  ProviderServicePackageStatus,
} from "@/features/service-package";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";
import type { PagedResponse } from "@/types";

const pageSize = 15;
const fieldClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return (
      data?.message ??
      (error.response
        ? "The request failed. Please try again."
        : "Cannot reach the backend. Check that the API is running.")
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function statusTone(status: string) {
  return status.toUpperCase() === "ACTIVE"
    ? "bg-[#e5f0e8] text-[#39724b]"
    : "bg-[#f5e4e1] text-[#a34d42]";
}

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function exportPackages(rows: ProviderServicePackage[]) {
  const header = [
    "Package ID",
    "Name",
    "Description",
    "Price (VND)",
    "Uses / Month",
    "Validity (Months)",
    "Status",
  ];
  const csv = [
    header,
    ...rows.map((item) => [
      item.packageId,
      item.name,
      item.description ?? "",
      item.price,
      item.usesPerMonth,
      item.validityMonths,
      item.status,
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
  const { messages } = useProviderLanguage();
  const pkg = messages.packages;
  const [result, setResult] =
    useState<PagedResponse<ProviderServicePackage> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedPackage, setSelectedPackage] =
    useState<ProviderServicePackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<ProviderServicePackage | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDeletePackage, setPendingDeletePackage] =
    useState<ProviderServicePackage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1000000");
  const [usesPerMonth, setUsesPerMonth] = useState("4");
  const [validityMonths, setValidityMonths] = useState("1");
  const [formStatus, setFormStatus] =
    useState<ProviderServicePackageStatus>("ACTIVE");

  useEffect(() => {
    let cancelled = false;
    listMyProviderServicePackages({
      status: status || undefined,
      page: currentPage,
      pageSize,
    })
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentPage, status, reloadKey]);

  const packages = result?.items ?? [];
  const filteredPackages = packages.filter((item) =>
    `${item.name} ${item.description ?? ""} ${item.packageId}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  const activeCount = packages.filter(
    (item) => item.status.toUpperCase() === "ACTIVE",
  ).length;
  const averagePrice = packages.length
    ? Math.round(
        packages.reduce((total, item) => total + item.price, 0) /
          packages.length,
      )
    : 0;

  async function openDetail(packageId: string) {
    setError("");
    try {
      setSelectedPackage(await getMyProviderServicePackage(packageId));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function startCreate() {
    setError("");
    setEditingPackage(null);
    setName("");
    setDescription("");
    setPrice("1000000");
    setUsesPerMonth("4");
    setValidityMonths("1");
    setFormStatus("ACTIVE");
    setModalOpen(true);
  }

  function startEdit(item: ProviderServicePackage) {
    setError("");
    setEditingPackage(item);
    setName(item.name);
    setDescription(item.description ?? "");
    setPrice(String(item.price));
    setUsesPerMonth(String(item.usesPerMonth));
    setValidityMonths(String(item.validityMonths));
    setFormStatus(
      item.status.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    );
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: ProviderServicePackageRequest = {
        name: name.trim(),
        description: description.trim() || null,
        price: Math.max(0, Number(price) || 0),
        usesPerMonth: Math.max(1, Number.parseInt(usesPerMonth, 10) || 1),
        validityMonths: Math.max(1, Number.parseInt(validityMonths, 10) || 1),
        status: formStatus,
      };
      if (editingPackage) {
        const updated = await updateMyProviderServicePackage(
          editingPackage.packageId,
          payload,
        );
        if (selectedPackage?.packageId === updated.packageId) {
          setSelectedPackage(updated);
        }
      } else {
        await createMyProviderServicePackage(payload);
      }
      setModalOpen(false);
      setEditingPackage(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDeletePackage) return;
    setDeleting(true);
    setError("");
    try {
      await deleteMyProviderServicePackage(pendingDeletePackage.packageId);
      if (selectedPackage?.packageId === pendingDeletePackage.packageId) {
        setSelectedPackage(null);
      }
      setPendingDeletePackage(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow={messages.common.providerWorkspace}
            title={pkg.title}
            description={pkg.description}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-2">
          <button
            type="button"
            onClick={() => exportPackages(filteredPackages)}
            disabled={!filteredPackages.length}
            className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36] disabled:opacity-50">
            {messages.common.exportCsv}
          </button>
        </div>
      </div>

      <section
        aria-label="Package summary"
        className="mt-3 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total packages",
            value: String(result?.totalItems ?? 0),
            helper: "Packages in your catalogue",
          },
          {
            label: "Active on this page",
            value: String(activeCount),
            helper: "Currently visible to customers",
          },
          {
            label: "Average price",
            value: formatPrice(averagePrice),
            helper: "Across listed packages",
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

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">
          {error}
        </p>
      )}

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#20221f]">
                All service packages
              </h2>
              <p className="mt-1 text-sm text-[#777973]">
                {result?.totalItems ?? 0} total packages
              </p>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e]">
              <Plus size={16} /> Add package
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(180px,300px)_160px]">
            <input
              id="package-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, description or ID..."
              aria-label="Search packages"
              className={fieldClassName}
            />
            <select
              id="package-status"
              value={status}
              onChange={(event) => {
                setLoading(true);
                setStatus(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className={fieldClassName}>
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
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
                <th className="px-4 py-3">Uses / Month</th>
                <th className="px-4 py-3">Validity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeea]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-[#777973]">
                    Loading service packages…
                  </td>
                </tr>
              ) : (
                filteredPackages.map((item) => (
                  <tr
                    key={item.packageId}
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
                            {item.packageId.slice(0, 8)} · {item.itemCount}{" "}
                            items
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-sm text-[#686a64]">
                      <p className="truncate">{item.description || "—"}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-[#20221f]">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#686a64]">
                      {item.usesPerMonth} uses
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#686a64]">
                      {item.validityMonths}{" "}
                      {item.validityMonths === 1 ? "month" : "months"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => void openDetail(item.packageId)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-[#39724b] hover:bg-[#e5f0e8]">
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]">
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeletePackage(item)}
                          aria-label={`Delete ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredPackages.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-[#777973]">
                    No service packages found for these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#e8e8e2] px-5 py-4">
          <Pagination
            currentPage={currentPage}
            totalItems={result?.totalItems ?? 0}
            itemsPerPage={pageSize}
            onPageChange={(nextPage) => {
              setLoading(true);
              setCurrentPage(nextPage);
            }}
          />
        </div>
      </section>

      {/* Package Detail Modal */}
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
                  {selectedPackage.packageId}
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
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-[#eeeeea] text-sm">
              {[
                ["Description", selectedPackage.description || "—"],
                ["Price", formatPrice(selectedPackage.price)],
                ["Uses per month", `${selectedPackage.usesPerMonth} uses`],
                [
                  "Validity",
                  `${selectedPackage.validityMonths} ${selectedPackage.validityMonths === 1 ? "month" : "months"}`,
                ],
                ["Included items", `${selectedPackage.itemCount} items`],
                ["Status", selectedPackage.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-[#777973]">{label}</dt>
                  <dd className="max-w-[65%] text-right font-medium text-[#343630]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex justify-end gap-2 border-t border-[#eeeeea] pt-4">
              <button
                type="button"
                onClick={() => {
                  const item = selectedPackage;
                  setSelectedPackage(null);
                  startEdit(item);
                }}
                className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]">
                Edit
              </button>
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]">
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Package Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-4"
          onClick={() => setModalOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-modal-title"
            className="my-auto w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-4">
              <h2
                id="package-modal-title"
                className="text-lg font-semibold text-[#20221f]">
                {editingPackage
                  ? "Edit service package"
                  : "Add service package"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
                Package name
                <input
                  required
                  maxLength={200}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Monthly Darkroom Pass"
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Price (VND)
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Status
                <select
                  value={formStatus}
                  onChange={(event) =>
                    setFormStatus(
                      event.target.value as ProviderServicePackageStatus,
                    )
                  }
                  className={fieldClassName}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Uses per month (1–365)
                <input
                  type="number"
                  required
                  min={1}
                  max={365}
                  step={1}
                  value={usesPerMonth}
                  onChange={(event) => setUsesPerMonth(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Validity months (1–120)
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  step={1}
                  value={validityMonths}
                  onChange={(event) => setValidityMonths(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
                Description (optional)
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe what is included in this package..."
                  className="w-full rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15"
                />
              </label>
              <div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 rounded-md border border-[#d8d8d1] px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
                  {saving
                    ? "Saving…"
                    : editingPackage
                      ? "Save changes"
                      : "Create package"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingDeletePackage && (
        <ConfirmDeleteDialog
          title="Delete this service package?"
          description={`“${pendingDeletePackage.name}” will be permanently deleted. If it has orders or subscriptions, set its status to INACTIVE instead.`}
          confirming={deleting}
          error={error || undefined}
          onCancel={() => {
            if (!deleting) {
              setPendingDeletePackage(null);
              setError("");
            }
          }}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  );
}
