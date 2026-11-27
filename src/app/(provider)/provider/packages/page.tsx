"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Layers, Package, Pencil, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import {
  createMyProviderServicePackage,
  createMyProviderServicePackageItem,
  deleteMyProviderServicePackage,
  deleteMyProviderServicePackageItem,
  getMyProviderServicePackage,
  listMyProviderServicePackageItems,
  listMyProviderServicePackages,
  updateMyProviderServicePackage,
} from "@/features/service-package/api";
import type {
  ProviderPackageComponentType,
  ProviderServicePackage,
  ProviderServicePackageItem,
  ProviderServicePackageRequest,
  ProviderServicePackageStatus,
} from "@/features/service-package";
import {
  createMyProviderService,
  deleteMyProviderService,
  getMyProviderServiceById,
  listMyProviderServices,
  updateMyProviderService,
} from "@/features/provider-service/api";
import type {
  ProviderService,
  ProviderServiceRequest,
  ProviderServiceStatus,
} from "@/features/provider-service";
import { listMyProviderSpaces } from "@/features/provider-space/api";
import type { ProviderSpace } from "@/features/provider-space";
import { listMyProviderEquipment } from "@/features/equipment/api";
import type { ProviderEquipment } from "@/features/equipment";
import { listMyProviderChemicals } from "@/features/provider-chemical/api";
import type { ProviderChemical } from "@/features/provider-chemical";
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
  const [activeTab, setActiveTab] = useState<"packages" | "services">(
    "packages",
  );

  // Packages state
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

  // Package form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1000000");
  const [usesPerMonth, setUsesPerMonth] = useState("4");
  const [validityMonths, setValidityMonths] = useState("1");
  const [formStatus, setFormStatus] =
    useState<ProviderServicePackageStatus>("ACTIVE");

  // Package Items state
  const [packageItems, setPackageItems] = useState<
    ProviderServicePackageItem[]
  >([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemError, setItemError] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [itemComponentType, setItemComponentType] =
    useState<ProviderPackageComponentType>("STUDIO");
  const [itemResourceId, setItemResourceId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemStepOrder, setItemStepOrder] = useState("1");
  const [itemDurationMinutes, setItemDurationMinutes] = useState("");
  const [itemChemicalQty, setItemChemicalQty] = useState("");
  const [itemNotes, setItemNotes] = useState("");

  // Owned resources for Package Item picker
  const [ownedSpaces, setOwnedSpaces] = useState<ProviderSpace[]>([]);
  const [ownedEquipment, setOwnedEquipment] = useState<ProviderEquipment[]>([]);
  const [ownedChemicals, setOwnedChemicals] = useState<ProviderChemical[]>([]);
  const [ownedServices, setOwnedServices] = useState<ProviderService[]>([]);
  const [pickerError, setPickerError] = useState("");

  // Standalone Services state
  const [serviceResult, setServiceResult] =
    useState<PagedResponse<ProviderService> | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [serviceStatus, setServiceStatus] = useState("");
  const [servicePage, setServicePage] = useState(1);
  const [serviceReloadKey, setServiceReloadKey] = useState(0);
  const [selectedService, setSelectedService] =
    useState<ProviderService | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<ProviderService | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [pendingDeleteService, setPendingDeleteService] =
    useState<ProviderService | null>(null);
  const [deletingService, setDeletingService] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("150000");
  const [serviceFormStatus, setServiceFormStatus] =
    useState<ProviderServiceStatus>("ACTIVE");

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

  useEffect(() => {
    let cancelled = false;
    listMyProviderServices({
      status: serviceStatus || undefined,
      page: servicePage,
      pageSize,
    })
      .then((data) => {
        if (!cancelled) {
          setServiceResult(data);
          setServiceError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setServiceError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setServiceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [servicePage, serviceStatus, serviceReloadKey]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      listMyProviderSpaces({ page: 1, pageSize: 100 }),
      listMyProviderEquipment({ page: 1, pageSize: 100 }),
      listMyProviderChemicals({ page: 1, pageSize: 100 }),
      listMyProviderServices({ page: 1, pageSize: 100 }),
    ]).then(([spRes, eqRes, chRes, svRes]) => {
      if (cancelled) return;
      if (spRes.status === "fulfilled") setOwnedSpaces(spRes.value.items);
      if (eqRes.status === "fulfilled") setOwnedEquipment(eqRes.value.items);
      if (chRes.status === "fulfilled") setOwnedChemicals(chRes.value.items);
      if (svRes.status === "fulfilled") setOwnedServices(svRes.value.items);
      if ([spRes, eqRes, chRes, svRes].some((result) => result.status === "rejected")) {
        setPickerError("Some package resources could not be loaded. Refresh the page to retry.");
      } else {
        setPickerError("");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [serviceReloadKey]);

  const studios = ownedSpaces.filter((s) => s.type.toUpperCase() === "STUDIO");
  const darkrooms = ownedSpaces.filter(
    (s) => s.type.toUpperCase() === "DARKROOM",
  );

  function getFirstResourceForComponentType(
    type: ProviderPackageComponentType,
  ) {
    if (type === "STUDIO") return studios[0]?.spaceId ?? "";
    if (type === "DARKROOM") return darkrooms[0]?.spaceId ?? "";
    if (type === "EQUIPMENT") return ownedEquipment[0]?.equipmentId ?? "";
    if (type === "CHEMICAL") return ownedChemicals[0]?.chemicalId ?? "";
    return ownedServices[0]?.serviceId ?? "";
  }

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

  const services = serviceResult?.items ?? [];
  const filteredServices = services.filter((item) =>
    `${item.name} ${item.description ?? ""} ${item.serviceId}`
      .toLowerCase()
      .includes(serviceQuery.trim().toLowerCase()),
  );

  async function openDetail(packageId: string) {
    setError("");
    setItemError("");
    setItemsLoading(true);
    try {
      const [pkgDetail, items] = await Promise.all([
        getMyProviderServicePackage(packageId),
        listMyProviderServicePackageItems(packageId),
      ]);
      setSelectedPackage(pkgDetail);
      setPackageItems(items);
      const initialType: ProviderPackageComponentType =
        studios.length > 0
          ? "STUDIO"
          : darkrooms.length > 0
            ? "DARKROOM"
            : ownedEquipment.length > 0
              ? "EQUIPMENT"
              : ownedChemicals.length > 0
                ? "CHEMICAL"
                : "SERVICE";
      setItemComponentType(initialType);
      setItemResourceId(getFirstResourceForComponentType(initialType));
      setItemQuantity("1");
      setItemStepOrder(String(Math.min(100, Math.max(0, ...items.map((item) => item.stepOrder)) + 1)));
      setItemDurationMinutes("");
      setItemChemicalQty("");
      setItemNotes("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setItemsLoading(false);
    }
  }

  async function handleAddPackageItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackage || !itemResourceId) return;
    setAddingItem(true);
    setItemError("");
    try {
      const created = await createMyProviderServicePackageItem(
        selectedPackage.packageId,
        {
          componentType: itemComponentType,
          resourceId: itemResourceId,
          quantity: Math.max(1, Number.parseInt(itemQuantity, 10) || 1),
          stepOrder: Number(itemStepOrder),
          includedDurationMinutes:
            itemDurationMinutes.trim() === ""
              ? null
              : Number.parseInt(itemDurationMinutes, 10),
          includedChemicalQuantity:
            itemChemicalQty.trim() === "" ? null : Number(itemChemicalQty),
          notes: itemNotes.trim() || null,
        },
      );
      setPackageItems((prev) => [...prev, created]);
      setItemStepOrder(String(Math.min(100, Number(itemStepOrder) + 1)));
      const refreshedPkg = await getMyProviderServicePackage(
        selectedPackage.packageId,
      );
      setSelectedPackage(refreshedPkg);
      setReloadKey((k) => k + 1);
      setItemNotes("");
    } catch (err) {
      setItemError(errorMessage(err));
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeletePackageItem(packageItemId: string) {
    if (!selectedPackage) return;
    setDeletingItemId(packageItemId);
    setItemError("");
    try {
      await deleteMyProviderServicePackageItem(
        selectedPackage.packageId,
        packageItemId,
      );
      setPackageItems((prev) =>
        prev.filter((item) => item.packageItemId !== packageItemId),
      );
      const refreshedPkg = await getMyProviderServicePackage(
        selectedPackage.packageId,
      );
      setSelectedPackage(refreshedPkg);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setItemError(errorMessage(err));
    } finally {
      setDeletingItemId(null);
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
      if ((result?.items.length ?? 0) <= 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  // Standalone Service handlers
  async function openServiceDetail(serviceId: string) {
    setServiceError("");
    try {
      setSelectedService(await getMyProviderServiceById(serviceId));
    } catch (err) {
      setServiceError(errorMessage(err));
    }
  }

  function startCreateService() {
    setServiceError("");
    setEditingService(null);
    setServiceName("");
    setServiceDescription("");
    setServicePrice("150000");
    setServiceFormStatus("ACTIVE");
    setServiceModalOpen(true);
  }

  function startEditService(item: ProviderService) {
    setServiceError("");
    setEditingService(item);
    setServiceName(item.name);
    setServiceDescription(item.description ?? "");
    setServicePrice(String(item.price));
    setServiceFormStatus(
      item.status.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    );
    setServiceModalOpen(true);
  }

  async function handleSaveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingService(true);
    setServiceError("");
    try {
      const payload: ProviderServiceRequest = {
        name: serviceName.trim(),
        description: serviceDescription.trim() || null,
        price: Math.max(0, Number(servicePrice) || 0),
        status: serviceFormStatus,
      };
      if (editingService) {
        const updated = await updateMyProviderService(
          editingService.serviceId,
          payload,
        );
        if (selectedService?.serviceId === updated.serviceId) {
          setSelectedService(updated);
        }
      } else {
        await createMyProviderService(payload);
      }
      setServiceModalOpen(false);
      setEditingService(null);
      setServiceReloadKey((k) => k + 1);
    } catch (err) {
      setServiceError(errorMessage(err));
    } finally {
      setSavingService(false);
    }
  }

  async function confirmDeleteService() {
    if (!pendingDeleteService) return;
    setDeletingService(true);
    setServiceError("");
    try {
      await deleteMyProviderService(pendingDeleteService.serviceId);
      if (selectedService?.serviceId === pendingDeleteService.serviceId) {
        setSelectedService(null);
      }
      setPendingDeleteService(null);
      if ((serviceResult?.items.length ?? 0) <= 1 && servicePage > 1) {
        setServicePage((p) => p - 1);
      } else {
        setServiceReloadKey((k) => k + 1);
      }
    } catch (err) {
      setServiceError(errorMessage(err));
    } finally {
      setDeletingService(false);
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
          {pickerError && <p role="alert" className="mb-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">{pickerError}</p>}
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

      {/* Tabs */}
      <nav
        aria-label="Packages and standalone services tabs"
        className="mt-4 mb-5 flex flex-wrap gap-2 border-b border-[#e0e0da] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("packages")}
          className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
            activeTab === "packages"
              ? "border-[#39724b] bg-[#e5f0e8] text-[#20221f]"
              : "border-transparent text-[#686a64] hover:border-[#d8d8d1] hover:bg-white"
          }`}>
          <Package size={16} />
          <span>Service Packages ({result?.totalItems ?? 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
            activeTab === "services"
              ? "border-[#39724b] bg-[#e5f0e8] text-[#20221f]"
              : "border-transparent text-[#686a64] hover:border-[#d8d8d1] hover:bg-white"
          }`}>
          <Layers size={16} />
          <span>Standalone Services ({serviceResult?.totalItems ?? 0})</span>
        </button>
      </nav>

      {/* ==================== SERVICE PACKAGES TAB ==================== */}
      {activeTab === "packages" && (
        <>
          <section
            aria-label="Package summary"
            className="grid gap-3 sm:grid-cols-3">
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

          {error && !modalOpen && !pendingDeletePackage && (
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
                              View & Items
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
        </>
      )}

      {/* ==================== STANDALONE SERVICES TAB ==================== */}
      {activeTab === "services" && (
        <>
          <section
            aria-label="Standalone services summary"
            className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total services",
                value: String(serviceResult?.totalItems ?? 0),
                helper: "Standalone services in your catalogue",
              },
              {
                label: "Active on this page",
                value: String(
                  services.filter((s) => s.status.toUpperCase() === "ACTIVE")
                    .length,
                ),
                helper: "Can be attached to bookings & packages",
              },
              {
                label: "Average service price",
                value: formatPrice(
                  services.length
                    ? Math.round(
                        services.reduce((sum, s) => sum + s.price, 0) /
                          services.length,
                      )
                    : 0,
                ),
                helper: "Across listed services",
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

          {serviceError && !serviceModalOpen && !pendingDeleteService && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">
              {serviceError}
            </p>
          )}

          <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#20221f]">
                    Standalone services
                  </h2>
                  <p className="mt-1 text-sm text-[#777973]">
                    Manage add-on services (e.g. film developing, scanning, lighting assistant) and attach them to packages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCreateService}
                  className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e]">
                  <Plus size={16} /> Add service
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(180px,300px)_160px]">
                <input
                  value={serviceQuery}
                  onChange={(event) => setServiceQuery(event.target.value)}
                  placeholder="Search service name or description..."
                  aria-label="Search standalone services"
                  className={fieldClassName}
                />
                <select
                  value={serviceStatus}
                  onChange={(event) => {
                    setServiceLoading(true);
                    setServiceStatus(event.target.value);
                    setServicePage(1);
                  }}
                  aria-label="Filter standalone services status"
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
                    <th className="px-5 py-3">Service</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeea]">
                  {serviceLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        Loading standalone services…
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((item) => (
                      <tr
                        key={item.serviceId}
                        className="transition-colors hover:bg-[#fcfcfa]">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-[#292b27]">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#777973]">
                            {item.serviceId.slice(0, 8)}
                          </p>
                        </td>
                        <td className="max-w-md px-4 py-3.5 text-sm text-[#686a64]">
                          <p className="truncate">{item.description || "—"}</p>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-[#20221f]">
                          {formatPrice(item.price)}
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
                              onClick={() =>
                                void openServiceDetail(item.serviceId)
                              }
                              className="rounded-md px-2 py-1 text-xs font-semibold text-[#39724b] hover:bg-[#e5f0e8]">
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditService(item)}
                              aria-label={`Edit ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]">
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteService(item)}
                              aria-label={`Delete ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {!serviceLoading && filteredServices.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        No standalone services found for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#e8e8e2] px-5 py-4">
              <Pagination
                currentPage={servicePage}
                totalItems={serviceResult?.totalItems ?? 0}
                itemsPerPage={pageSize}
                onPageChange={(nextPage) => {
                  setServiceLoading(true);
                  setServicePage(nextPage);
                }}
              />
            </div>
          </section>
        </>
      )}

      {/* Package Detail & Items Modal */}
      {selectedPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-4"
          onClick={() => setSelectedPackage(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-detail-title"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
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
            <dl className="mt-4 divide-y divide-[#eeeeea] text-sm">
              {[
                ["Description", selectedPackage.description || "—"],
                ["Price", formatPrice(selectedPackage.price)],
                ["Uses per month", `${selectedPackage.usesPerMonth} uses`],
                [
                  "Validity",
                  `${selectedPackage.validityMonths} ${selectedPackage.validityMonths === 1 ? "month" : "months"}`,
                ],
                ["Included items", `${packageItems.length} items`],
                ["Status", selectedPackage.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2">
                  <dt className="text-[#777973]">{label}</dt>
                  <dd className="max-w-[65%] text-right font-medium text-[#343630]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Package Items Section */}
            <div className="mt-6 border-t border-[#e8e8e2] pt-4">
              <h3 className="text-sm font-semibold text-[#20221f]">
                Package Items ({packageItems.length})
              </h3>
              <p className="mt-0.5 text-xs text-[#777973]">
                Attach studios, darkrooms, equipment, chemicals, or standalone services included in this package.
              </p>

              {itemsLoading ? (
                <p className="mt-3 text-xs text-[#777973]">
                  Loading package items…
                </p>
              ) : packageItems.length === 0 ? (
                <p className="mt-3 rounded-md border border-dashed border-[#d8d8d1] p-3 text-center text-xs text-[#777973]">
                  No items attached to this package yet.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[#eeeeea] rounded-md border border-[#e0e0da]">
                  {packageItems.map((pItem) => (
                    <li
                      key={pItem.packageItemId}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#e5f0e8] px-2 py-0.5 text-[11px] font-semibold text-[#39724b]">
                            {pItem.componentType}
                          </span>
                          <span className="font-medium text-[#20221f]">
                            {pItem.resourceName}
                          </span>
                          <span className="text-xs text-[#686a64]">
                            × {pItem.quantity}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-[#777973]">
                          {pItem.includedDurationMinutes != null && (
                            <span>
                              Duration: {pItem.includedDurationMinutes} mins
                            </span>
                          )}
                          {pItem.includedChemicalQuantity != null && (
                            <span>
                              Chemical qty: {pItem.includedChemicalQuantity}
                            </span>
                          )}
                          {pItem.notes && <span>Note: {pItem.notes}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={deletingItemId === pItem.packageItemId}
                        onClick={() =>
                          void handleDeletePackageItem(pItem.packageItemId)
                        }
                        aria-label={`Remove ${pItem.resourceName}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed] disabled:opacity-50">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add Item Form */}
              <form
                onSubmit={handleAddPackageItem}
                className="mt-4 grid gap-3 rounded-md border border-[#e8e8e2] bg-[#f8f8f5] p-3.5 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-medium text-[#454741]">
                  Component Type
                  <select
                    value={itemComponentType}
                    onChange={(event) => {
                      const nextType = event.target
                        .value as ProviderPackageComponentType;
                      setItemComponentType(nextType);
                      setItemResourceId(
                        getFirstResourceForComponentType(nextType),
                      );
                    }}
                    className={fieldClassName}>
                    <option value="STUDIO">STUDIO</option>
                    <option value="DARKROOM">DARKROOM</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="CHEMICAL">CHEMICAL</option>
                    <option value="SERVICE">SERVICE</option>
                  </select>
                </label>

                <label className="grid gap-1 text-xs font-medium text-[#454741]">
                  Resource
                  <select
                    required
                    value={itemResourceId}
                    onChange={(event) => setItemResourceId(event.target.value)}
                    className={fieldClassName}>
                    <option value="" disabled>
                      Select resource
                    </option>
                    {itemComponentType === "STUDIO" &&
                      studios.map((s) => (
                        <option key={s.spaceId} value={s.spaceId}>
                          {s.name}
                        </option>
                      ))}
                    {itemComponentType === "DARKROOM" &&
                      darkrooms.map((d) => (
                        <option key={d.spaceId} value={d.spaceId}>
                          {d.name}
                        </option>
                      ))}
                    {itemComponentType === "EQUIPMENT" &&
                      ownedEquipment.map((e) => (
                        <option key={e.equipmentId} value={e.equipmentId}>
                          {e.name}
                        </option>
                      ))}
                    {itemComponentType === "CHEMICAL" &&
                      ownedChemicals.map((c) => (
                        <option key={c.chemicalId} value={c.chemicalId}>
                          {c.name} ({c.stockUnit})
                        </option>
                      ))}
                    {itemComponentType === "SERVICE" &&
                      ownedServices.map((sv) => (
                        <option key={sv.serviceId} value={sv.serviceId}>
                          {sv.name}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="grid gap-1 text-xs font-medium text-[#454741]">
                  Quantity
                  <input
                    required
                    type="number"
                    min={1}
                    max={999}
                    value={itemQuantity}
                    onChange={(event) => setItemQuantity(event.target.value)}
                    className={fieldClassName}
                  />
                </label>

                <label className="grid gap-1 text-xs font-medium text-[#454741]">
                  Step order
                  <input required type="number" min={1} max={100} step={1} value={itemStepOrder} onChange={(event) => setItemStepOrder(event.target.value)} className={fieldClassName} />
                </label>

                <label className="grid gap-1 text-xs font-medium text-[#454741]">
                  Included Duration (minutes, optional)
                  <input
                    type="number"
                    min={1}
                    value={itemDurationMinutes}
                    onChange={(event) =>
                      setItemDurationMinutes(event.target.value)
                    }
                    placeholder="e.g. 120"
                    className={fieldClassName}
                  />
                </label>

                {itemComponentType === "CHEMICAL" && (
                  <label className="grid gap-1 text-xs font-medium text-[#454741]">
                    Included Chemical Qty (optional)
                    <input
                      type="number"
                      min={0.01}
                      step="0.01"
                      value={itemChemicalQty}
                      onChange={(event) =>
                        setItemChemicalQty(event.target.value)
                      }
                      placeholder="e.g. 0.5"
                      className={fieldClassName}
                    />
                  </label>
                )}

                <label className="grid gap-1 text-xs font-medium text-[#454741] sm:col-span-2">
                  Notes (optional)
                  <input
                    type="text"
                    maxLength={500}
                    value={itemNotes}
                    onChange={(event) => setItemNotes(event.target.value)}
                    placeholder="Optional usage notes for this package component..."
                    className={fieldClassName}
                  />
                </label>

                {itemError && (
                  <p
                    role="alert"
                    className="text-xs text-[#a34d42] sm:col-span-2">
                    {itemError}
                  </p>
                )}

                <div className="flex justify-end sm:col-span-2">
                  <button
                    type="submit"
                    disabled={addingItem || !itemResourceId}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#39724b] px-3.5 text-xs font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">
                    <Plus size={14} />
                    {addingItem ? "Attaching…" : "Attach item to package"}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-[#eeeeea] pt-4">
              <button
                type="button"
                onClick={() => {
                  const item = selectedPackage;
                  setSelectedPackage(null);
                  startEdit(item);
                }}
                className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]">
                Edit package
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
              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339] sm:col-span-2">
                  {error}
                </p>
              )}
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

      {/* Standalone Service Detail Modal */}
      {selectedService && !serviceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
          onClick={() => setSelectedService(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-detail-title"
            className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                  {selectedService.serviceId}
                </p>
                <h2
                  id="service-detail-title"
                  className="mt-1 text-xl font-semibold text-[#20221f]">
                  {selectedService.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                aria-label="Close service details"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-[#eeeeea] text-sm">
              {[
                ["Description", selectedService.description || "—"],
                ["Price", formatPrice(selectedService.price)],
                ["Status", selectedService.status],
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
                  const item = selectedService;
                  setSelectedService(null);
                  startEditService(item);
                }}
                className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]">
                Edit
              </button>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]">
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Standalone Service Create / Edit Modal */}
      {serviceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-4"
          onClick={() => setServiceModalOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            className="my-auto w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-4">
              <h2
                id="service-modal-title"
                className="text-lg font-semibold text-[#20221f]">
                {editingService
                  ? "Edit standalone service"
                  : "Add standalone service"}
              </h2>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSaveService}
              className="grid gap-4 p-6 sm:grid-cols-2">
              {serviceError && (
                <p
                  role="alert"
                  className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339] sm:col-span-2">
                  {serviceError}
                </p>
              )}
              <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
                Service name
                <input
                  required
                  maxLength={200}
                  value={serviceName}
                  onChange={(event) => setServiceName(event.target.value)}
                  placeholder="e.g. Film Developing & High-Res Scan"
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
                  value={servicePrice}
                  onChange={(event) => setServicePrice(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Status
                <select
                  value={serviceFormStatus}
                  onChange={(event) =>
                    setServiceFormStatus(
                      event.target.value as ProviderServiceStatus,
                    )
                  }
                  className={fieldClassName}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
                Description (optional)
                <textarea
                  rows={3}
                  value={serviceDescription}
                  onChange={(event) =>
                    setServiceDescription(event.target.value)
                  }
                  placeholder="Describe this standalone service..."
                  className="w-full rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15"
                />
              </label>
              <div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="h-9 rounded-md border border-[#d8d8d1] px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingService}
                  className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
                  {savingService
                    ? "Saving…"
                    : editingService
                      ? "Save changes"
                      : "Create service"}
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

      {pendingDeleteService && (
        <ConfirmDeleteDialog
          title="Delete this standalone service?"
          description={`“${pendingDeleteService.name}” will be permanently deleted. If it is linked to bookings or packages, set its status to INACTIVE instead.`}
          confirming={deletingService}
          error={serviceError || undefined}
          onCancel={() => {
            if (!deletingService) {
              setPendingDeleteService(null);
              setServiceError("");
            }
          }}
          onConfirm={() => void confirmDeleteService()}
        />
      )}
    </div>
  );
}
