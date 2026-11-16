"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { AlertTriangle, Camera, FlaskConical, PackagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { EquipmentModal } from "@/features/equipment/components/EquipmentModal";
import {
  createMyProviderEquipment,
  deleteMyProviderEquipment,
  getMyProviderEquipment,
  listMyProviderEquipment,
  updateMyProviderEquipment,
} from "@/features/equipment/api";
import type {
  ProviderEquipment,
  ProviderEquipmentCreateRequest,
  ProviderEquipmentUpdateRequest,
} from "@/features/equipment";
import {
  adjustMyProviderChemicalStock,
  createMyProviderChemical,
  deleteMyProviderChemical,
  getMyProviderChemical,
  listMyProviderChemicals,
  updateMyProviderChemical,
} from "@/features/provider-chemical/api";
import type {
  ProviderChemical,
  ProviderChemicalCreateRequest,
  ProviderChemicalMovementType,
  ProviderChemicalRequest,
  ProviderChemicalStatus,
  ProviderChemicalStockAdjustmentRequest,
} from "@/features/provider-chemical";
import { listMyProviderSpaces } from "@/features/provider-space/api";
import type { ProviderSpace } from "@/features/provider-space";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";
import type { PagedResponse } from "@/types";

const pageSize = 15;
const fieldClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const categories = [
  "Camera",
  "Lens",
  "Lighting",
  "Darkroom",
  "Enlarger",
  "Film Processor",
  "Audio",
  "Support",
  "Other",
];

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

function conditionTone(condition: string) {
  const normalized = condition.toUpperCase();
  if (normalized === "GOOD") return "bg-[#e5f0e8] text-[#39724b]";
  if (normalized === "NEEDS_REPAIR" || normalized === "UNDER_MAINTENANCE")
    return "bg-[#f8edd9] text-[#93651e]";
  return "bg-[#f5e4e1] text-[#a34d42]";
}

function formatPrice(value: number | null) {
  if (value == null) return "—";
  return `${value.toLocaleString("vi-VN")} VND`;
}

export default function EquipmentPage() {
  const { messages } = useProviderLanguage();
  const eq = messages.equipment;
  const [activeTab, setActiveTab] = useState<"equipment" | "chemicals">("equipment");
  const [spaces, setSpaces] = useState<ProviderSpace[]>([]);

  // Equipment state
  const [equipmentResult, setEquipmentResult] =
    useState<PagedResponse<ProviderEquipment> | null>(null);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [equipmentError, setEquipmentError] = useState("");
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [equipmentSpaceId, setEquipmentSpaceId] = useState("");
  const [equipmentStatus, setEquipmentStatus] = useState("");
  const [equipmentCategory, setEquipmentCategory] = useState("");
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [equipmentReloadKey, setEquipmentReloadKey] = useState(0);
  const [selectedEquipment, setSelectedEquipment] =
    useState<ProviderEquipment | null>(null);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [equipmentModalVersion, setEquipmentModalVersion] = useState(0);
  const [equipmentModalMode, setEquipmentModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingEquipment, setEditingEquipment] =
    useState<ProviderEquipment | null>(null);
  const [savingEquipment, setSavingEquipment] = useState(false);
  const [pendingDeleteEquipment, setPendingDeleteEquipment] =
    useState<ProviderEquipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState(false);

  // Chemicals state
  const [chemicalResult, setChemicalResult] =
    useState<PagedResponse<ProviderChemical> | null>(null);
  const [chemicalLoading, setChemicalLoading] = useState(true);
  const [chemicalError, setChemicalError] = useState("");
  const [chemicalPage, setChemicalPage] = useState(1);
  const [chemicalDarkroomId, setChemicalDarkroomId] = useState("");
  const [chemicalStatus, setChemicalStatus] = useState("");
  const [chemicalQuery, setChemicalQuery] = useState("");
  const [chemicalReloadKey, setChemicalReloadKey] = useState(0);
  const [selectedChemical, setSelectedChemical] =
    useState<ProviderChemical | null>(null);
  const [chemicalModalOpen, setChemicalModalOpen] = useState(false);
  const [editingChemical, setEditingChemical] =
    useState<ProviderChemical | null>(null);
  const [savingChemical, setSavingChemical] = useState(false);
  const [pendingDeleteChemical, setPendingDeleteChemical] =
    useState<ProviderChemical | null>(null);
  const [deletingChemical, setDeletingChemical] = useState(false);

  // Chemical form state
  const [chemDarkroom, setChemDarkroom] = useState("");
  const [chemName, setChemName] = useState("");
  const [chemType, setChemType] = useState("DEVELOPER");
  const [chemBrand, setChemBrand] = useState("");
  const [chemStockQuantity, setChemStockQuantity] = useState("1");
  const [chemStockUnit, setChemStockUnit] = useState("L");
  const [chemMinimumStock, setChemMinimumStock] = useState("0.5");
  const [chemUnitCost, setChemUnitCost] = useState("");
  const [chemExpiresOn, setChemExpiresOn] = useState("");
  const [chemStatus, setChemStatus] = useState<ProviderChemicalStatus>("ACTIVE");
  const [chemStatusNote, setChemStatusNote] = useState("");

  // Chemical stock adjustment modal state
  const [adjustingChemical, setAdjustingChemical] =
    useState<ProviderChemical | null>(null);
  const [movementType, setMovementType] =
    useState<ProviderChemicalMovementType>("PURCHASE");
  const [quantityDelta, setQuantityDelta] = useState("1");
  const [adjustUnitCost, setAdjustUnitCost] = useState("");
  const [supplierOrReference, setSupplierOrReference] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listMyProviderSpaces({ page: 1, pageSize: 100 })
      .then((res) => {
        if (!cancelled) setSpaces(res.items);
      })
      .catch(() => {
        // Spaces list optional for display labels
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    listMyProviderEquipment({
      spaceId: equipmentSpaceId || undefined,
      status: equipmentStatus || undefined,
      category: equipmentCategory || undefined,
      page: equipmentPage,
      pageSize,
    })
      .then((data) => {
        if (!cancelled) {
          setEquipmentResult(data);
          setEquipmentError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setEquipmentError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setEquipmentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    equipmentPage,
    equipmentSpaceId,
    equipmentStatus,
    equipmentCategory,
    equipmentReloadKey,
  ]);

  useEffect(() => {
    let cancelled = false;
    listMyProviderChemicals({
      darkroomId: chemicalDarkroomId || undefined,
      status: chemicalStatus || undefined,
      page: chemicalPage,
      pageSize,
    })
      .then((data) => {
        if (!cancelled) {
          setChemicalResult(data);
          setChemicalError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setChemicalError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setChemicalLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chemicalPage, chemicalDarkroomId, chemicalStatus, chemicalReloadKey]);

  const darkrooms = spaces.filter(
    (space) => space.type.toUpperCase() === "DARKROOM",
  );
  const spaceNameById = new Map(spaces.map((s) => [s.spaceId, s.name]));

  const equipmentItems = (equipmentResult?.items ?? []).filter((item) =>
    `${item.name} ${item.category} ${item.equipmentType} ${item.variant ?? ""} ${item.equipmentId}`
      .toLowerCase()
      .includes(equipmentQuery.trim().toLowerCase()),
  );

  const chemicalItems = (chemicalResult?.items ?? []).filter((item) =>
    `${item.name} ${item.chemicalType} ${item.brand ?? ""} ${item.chemicalId}`
      .toLowerCase()
      .includes(chemicalQuery.trim().toLowerCase()),
  );

  const lowStockCount = (chemicalResult?.items ?? []).filter(
    (item) => item.isLowStock,
  ).length;

  async function openEquipmentDetail(equipmentId: string) {
    setEquipmentError("");
    try {
      setSelectedEquipment(await getMyProviderEquipment(equipmentId));
    } catch (err) {
      setEquipmentError(errorMessage(err));
    }
  }

  function startCreateEquipment() {
    setEquipmentError("");
    setEditingEquipment(null);
    setEquipmentModalMode("create");
    setEquipmentModalVersion((v) => v + 1);
    setEquipmentModalOpen(true);
  }

  function startEditEquipment(item: ProviderEquipment) {
    setEquipmentError("");
    setEditingEquipment(item);
    setEquipmentModalMode("edit");
    setEquipmentModalVersion((v) => v + 1);
    setEquipmentModalOpen(true);
  }

  async function handleCreateEquipment(input: ProviderEquipmentCreateRequest) {
    setSavingEquipment(true);
    setEquipmentError("");
    try {
      await createMyProviderEquipment(input);
      setEquipmentModalOpen(false);
      setEquipmentReloadKey((k) => k + 1);
    } catch (err) {
      setEquipmentError(errorMessage(err));
    } finally {
      setSavingEquipment(false);
    }
  }

  async function handleUpdateEquipment(input: ProviderEquipmentUpdateRequest) {
    if (!editingEquipment) return;
    setSavingEquipment(true);
    setEquipmentError("");
    try {
      const updated = await updateMyProviderEquipment(
        editingEquipment.equipmentId,
        input,
      );
      setEquipmentModalOpen(false);
      setEditingEquipment(null);
      if (selectedEquipment?.equipmentId === updated.equipmentId) {
        setSelectedEquipment(updated);
      }
      setEquipmentReloadKey((k) => k + 1);
    } catch (err) {
      setEquipmentError(errorMessage(err));
    } finally {
      setSavingEquipment(false);
    }
  }

  async function confirmDeleteEquipment() {
    if (!pendingDeleteEquipment) return;
    setDeletingEquipment(true);
    setEquipmentError("");
    try {
      await deleteMyProviderEquipment(pendingDeleteEquipment.equipmentId);
      if (selectedEquipment?.equipmentId === pendingDeleteEquipment.equipmentId) {
        setSelectedEquipment(null);
      }
      setPendingDeleteEquipment(null);
      if ((equipmentResult?.items.length ?? 0) <= 1 && equipmentPage > 1) {
        setEquipmentPage((p) => p - 1);
      } else {
        setEquipmentReloadKey((k) => k + 1);
      }
    } catch (err) {
      setEquipmentError(errorMessage(err));
    } finally {
      setDeletingEquipment(false);
    }
  }

  // Chemical handlers
  async function openChemicalDetail(chemicalId: string) {
    setChemicalError("");
    try {
      setSelectedChemical(await getMyProviderChemical(chemicalId));
    } catch (err) {
      setChemicalError(errorMessage(err));
    }
  }

  function startCreateChemical() {
    setChemicalError("");
    setEditingChemical(null);
    setChemDarkroom(darkrooms[0]?.spaceId ?? spaces[0]?.spaceId ?? "");
    setChemName("");
    setChemType("DEVELOPER");
    setChemBrand("");
    setChemStockQuantity("1");
    setChemStockUnit("L");
    setChemMinimumStock("0.5");
    setChemUnitCost("");
    setChemExpiresOn("");
    setChemStatus("ACTIVE");
    setChemStatusNote("");
    setChemicalModalOpen(true);
  }

  function startEditChemical(item: ProviderChemical) {
    setChemicalError("");
    setEditingChemical(item);
    setChemDarkroom(item.darkroomId);
    setChemName(item.name);
    setChemType(item.chemicalType);
    setChemBrand(item.brand ?? "");
    setChemStockQuantity(String(item.stockQuantity));
    setChemStockUnit(item.stockUnit);
    setChemMinimumStock(String(item.minimumStock));
    setChemUnitCost(item.unitCost != null ? String(item.unitCost) : "");
    setChemExpiresOn(item.expiresOn ?? "");
    setChemStatus(
      item.status.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    );
    setChemStatusNote(item.statusNote ?? "");
    setChemicalModalOpen(true);
  }

  async function handleSaveChemical(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingChemical(true);
    setChemicalError("");
    try {
      const payload: ProviderChemicalRequest = {
        name: chemName.trim(),
        chemicalType: chemType.trim(),
        brand: chemBrand.trim() || null,
        stockQuantity: Math.max(0, Number(chemStockQuantity) || 0),
        stockUnit: chemStockUnit.trim() || "L",
        minimumStock: Math.max(0, Number(chemMinimumStock) || 0),
        unitCost: chemUnitCost.trim() === "" ? null : Number(chemUnitCost),
        expiresOn: chemExpiresOn.trim() || null,
        status: chemStatus,
        statusNote: chemStatusNote.trim() || null,
      };

      if (editingChemical) {
        const updated = await updateMyProviderChemical(
          editingChemical.chemicalId,
          payload,
        );
        if (selectedChemical?.chemicalId === updated.chemicalId) {
          setSelectedChemical(updated);
        }
      } else {
        const createPayload: ProviderChemicalCreateRequest = {
          ...payload,
          darkroomId: chemDarkroom,
        };
        await createMyProviderChemical(createPayload);
      }
      setChemicalModalOpen(false);
      setEditingChemical(null);
      setChemicalReloadKey((k) => k + 1);
    } catch (err) {
      setChemicalError(errorMessage(err));
    } finally {
      setSavingChemical(false);
    }
  }

  function startAdjustStock(item: ProviderChemical) {
    setChemicalError("");
    setAdjustingChemical(item);
    setMovementType("PURCHASE");
    setQuantityDelta("1");
    setAdjustUnitCost(item.unitCost != null ? String(item.unitCost) : "");
    setSupplierOrReference("");
    setAdjustNote("");
  }

  async function handleAdjustStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adjustingChemical) return;
    setSavingAdjustment(true);
    setChemicalError("");
    try {
      const rawDelta = Number(quantityDelta);
      const signedDelta =
        (movementType === "CONSUMPTION" || movementType === "WASTE") &&
        rawDelta > 0
          ? -rawDelta
          : rawDelta;
      const input: ProviderChemicalStockAdjustmentRequest = {
        movementType,
        quantityDelta: signedDelta,
        unitCost: adjustUnitCost.trim() === "" ? null : Number(adjustUnitCost),
        supplierOrReference: supplierOrReference.trim() || null,
        note: adjustNote.trim() || null,
      };
      const updated = await adjustMyProviderChemicalStock(
        adjustingChemical.chemicalId,
        input,
      );
      if (selectedChemical?.chemicalId === updated.chemicalId) {
        setSelectedChemical(updated);
      }
      setAdjustingChemical(null);
      setChemicalReloadKey((k) => k + 1);
    } catch (err) {
      setChemicalError(errorMessage(err));
    } finally {
      setSavingAdjustment(false);
    }
  }

  async function confirmDeleteChemical() {
    if (!pendingDeleteChemical) return;
    setDeletingChemical(true);
    setChemicalError("");
    try {
      await deleteMyProviderChemical(pendingDeleteChemical.chemicalId);
      if (selectedChemical?.chemicalId === pendingDeleteChemical.chemicalId) {
        setSelectedChemical(null);
      }
      setPendingDeleteChemical(null);
      if ((chemicalResult?.items.length ?? 0) <= 1 && chemicalPage > 1) {
        setChemicalPage((p) => p - 1);
      } else {
        setChemicalReloadKey((k) => k + 1);
      }
    } catch (err) {
      setChemicalError(errorMessage(err));
    } finally {
      setDeletingChemical(false);
    }
  }

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow={messages.common.providerWorkspace}
            title={eq.title}
            description="Manage studio/darkroom equipment and darkroom chemical consumables."
          />
        </div>
      </div>

      {/* Tabs */}
      <nav
        aria-label="Resource type tabs"
        className="mt-4 mb-5 flex flex-wrap gap-2 border-b border-[#e0e0da] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("equipment")}
          className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
            activeTab === "equipment"
              ? "border-[#39724b] bg-[#e5f0e8] text-[#20221f]"
              : "border-transparent text-[#686a64] hover:border-[#d8d8d1] hover:bg-white"
          }`}>
          <Camera size={16} />
          <span>Equipment ({equipmentResult?.totalItems ?? 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("chemicals")}
          className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
            activeTab === "chemicals"
              ? "border-[#39724b] bg-[#e5f0e8] text-[#20221f]"
              : "border-transparent text-[#686a64] hover:border-[#d8d8d1] hover:bg-white"
          }`}>
          <FlaskConical size={16} />
          <span>Darkroom Chemicals ({chemicalResult?.totalItems ?? 0})</span>
          {lowStockCount > 0 && (
            <span className="rounded-full bg-[#f5e4e1] px-2 py-0.5 text-xs font-bold text-[#a34d42]">
              {lowStockCount} low stock
            </span>
          )}
        </button>
      </nav>

      {/* ==================== EQUIPMENT TAB ==================== */}
      {activeTab === "equipment" && (
        <>
          <section
            aria-label="Equipment summary"
            className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total equipment",
                value: String(equipmentResult?.totalItems ?? 0),
                helper: "Across your studios and darkrooms",
              },
              {
                label: "Active on this page",
                value: String(
                  equipmentItems.filter(
                    (i) => i.status.toUpperCase() === "ACTIVE",
                  ).length,
                ),
                helper: "Available for booking & packages",
              },
              {
                label: "Total units on page",
                value: String(
                  equipmentItems.reduce((sum, i) => sum + i.quantityTotal, 0),
                ),
                helper: "Combined unit count",
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

          {equipmentError && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">
              {equipmentError}
            </p>
          )}

          <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#20221f]">
                    Equipment catalogue
                  </h2>
                  <p className="mt-1 text-sm text-[#777973]">
                    {equipmentResult?.totalItems ?? 0} total items
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCreateEquipment}
                  disabled={spaces.length === 0}
                  className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">
                  <Plus size={16} /> Add equipment
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  value={equipmentQuery}
                  onChange={(event) => setEquipmentQuery(event.target.value)}
                  placeholder="Search name, category, variant..."
                  aria-label="Search equipment"
                  className={fieldClassName}
                />
                <select
                  value={equipmentSpaceId}
                  onChange={(event) => {
                    setEquipmentLoading(true);
                    setEquipmentSpaceId(event.target.value);
                    setEquipmentPage(1);
                  }}
                  aria-label="Filter by space"
                  className={fieldClassName}>
                  <option value="">All spaces</option>
                  {spaces.map((space) => (
                    <option key={space.spaceId} value={space.spaceId}>
                      {space.name} ({space.type})
                    </option>
                  ))}
                </select>
                <select
                  value={equipmentCategory}
                  onChange={(event) => {
                    setEquipmentLoading(true);
                    setEquipmentCategory(event.target.value);
                    setEquipmentPage(1);
                  }}
                  aria-label="Filter by category"
                  className={fieldClassName}>
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={equipmentStatus}
                  onChange={(event) => {
                    setEquipmentLoading(true);
                    setEquipmentStatus(event.target.value);
                    setEquipmentPage(1);
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
                    <th className="px-5 py-3">Equipment</th>
                    <th className="px-4 py-3">Space</th>
                    <th className="px-4 py-3">Category / Type</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Condition</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeea]">
                  {equipmentLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        Loading equipment…
                      </td>
                    </tr>
                  ) : (
                    equipmentItems.map((item) => (
                      <tr
                        key={item.equipmentId}
                        className="transition-colors hover:bg-[#fcfcfa]">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-[#292b27]">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#777973]">
                            {item.variant ? `${item.variant} · ` : ""}
                            {item.equipmentId.slice(0, 8)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          <p className="font-medium text-[#343630]">
                            {spaceNameById.get(item.spaceId) ??
                              item.spaceId.slice(0, 8)}
                          </p>
                          <p className="text-xs text-[#858680]">
                            {item.spaceType}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          <p>{item.category}</p>
                          <p className="text-xs text-[#858680]">
                            {item.equipmentType}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          {item.quantityTotal}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          {formatPrice(item.rentalPrice)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${conditionTone(item.conditionStatus)}`}>
                            {item.conditionStatus}
                          </span>
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
                                void openEquipmentDetail(item.equipmentId)
                              }
                              className="rounded-md px-2 py-1 text-xs font-semibold text-[#39724b] hover:bg-[#e5f0e8]">
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditEquipment(item)}
                              aria-label={`Edit ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]">
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteEquipment(item)}
                              aria-label={`Delete ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {!equipmentLoading && equipmentItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        No equipment found for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#e8e8e2] px-5 py-4">
              <Pagination
                currentPage={equipmentPage}
                totalItems={equipmentResult?.totalItems ?? 0}
                itemsPerPage={pageSize}
                onPageChange={(nextPage) => {
                  setEquipmentLoading(true);
                  setEquipmentPage(nextPage);
                }}
              />
            </div>
          </section>
        </>
      )}

      {/* ==================== CHEMICALS TAB ==================== */}
      {activeTab === "chemicals" && (
        <>
          <section
            aria-label="Chemicals summary"
            className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total chemicals",
                value: String(chemicalResult?.totalItems ?? 0),
                helper: "Consumables across your darkrooms",
              },
              {
                label: "Low-stock alerts",
                value: String(lowStockCount),
                helper: "Stock at or below minimum threshold",
              },
              {
                label: "Darkrooms available",
                value: String(darkrooms.length),
                helper: "Darkroom spaces in your catalogue",
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

          {chemicalError && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">
              {chemicalError}
            </p>
          )}

          <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#20221f]">
                    Darkroom chemicals & consumables
                  </h2>
                  <p className="mt-1 text-sm text-[#777973]">
                    Track stock levels, low-stock warnings, and stock movement
                    adjustments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCreateChemical}
                  disabled={darkrooms.length === 0}
                  className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">
                  <Plus size={16} /> Add chemical
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  value={chemicalQuery}
                  onChange={(event) => setChemicalQuery(event.target.value)}
                  placeholder="Search chemical name, type, brand..."
                  aria-label="Search chemicals"
                  className={fieldClassName}
                />
                <select
                  value={chemicalDarkroomId}
                  onChange={(event) => {
                    setChemicalLoading(true);
                    setChemicalDarkroomId(event.target.value);
                    setChemicalPage(1);
                  }}
                  aria-label="Filter by darkroom"
                  className={fieldClassName}>
                  <option value="">All darkrooms</option>
                  {darkrooms.map((dr) => (
                    <option key={dr.spaceId} value={dr.spaceId}>
                      {dr.name}
                    </option>
                  ))}
                </select>
                <select
                  value={chemicalStatus}
                  onChange={(event) => {
                    setChemicalLoading(true);
                    setChemicalStatus(event.target.value);
                    setChemicalPage(1);
                  }}
                  aria-label="Filter chemical status"
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
                    <th className="px-5 py-3">Chemical</th>
                    <th className="px-4 py-3">Darkroom</th>
                    <th className="px-4 py-3">Type / Brand</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Min Stock</th>
                    <th className="px-4 py-3">Unit Cost</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeea]">
                  {chemicalLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        Loading chemicals…
                      </td>
                    </tr>
                  ) : (
                    chemicalItems.map((item) => (
                      <tr
                        key={item.chemicalId}
                        className="transition-colors hover:bg-[#fcfcfa]">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#292b27]">
                              {item.name}
                            </p>
                            {item.isLowStock && (
                              <span
                                title="Low stock warning"
                                className="inline-flex items-center gap-1 rounded-full bg-[#f5e4e1] px-2 py-0.5 text-[11px] font-semibold text-[#a34d42]">
                                <AlertTriangle size={12} /> Low stock
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[#777973]">
                            {item.chemicalId.slice(0, 8)}
                            {item.expiresOn ? ` · Exp: ${item.expiresOn}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          {spaceNameById.get(item.darkroomId) ??
                            item.darkroomId.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          <p>{item.chemicalType}</p>
                          <p className="text-xs text-[#858680]">
                            {item.brand || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-[#20221f]">
                          {item.stockQuantity} {item.stockUnit}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          {item.minimumStock} {item.stockUnit}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          {formatPrice(item.unitCost)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                void openChemicalDetail(item.chemicalId)
                              }
                              className="rounded-md px-2 py-1 text-xs font-semibold text-[#39724b] hover:bg-[#e5f0e8]">
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => startAdjustStock(item)}
                              title="Adjust stock"
                              aria-label={`Adjust stock for ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#39724b] hover:bg-[#e5f0e8]">
                              <PackagePlus size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditChemical(item)}
                              aria-label={`Edit ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]">
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteChemical(item)}
                              aria-label={`Delete ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {!chemicalLoading && chemicalItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        No darkroom chemicals found for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#e8e8e2] px-5 py-4">
              <Pagination
                currentPage={chemicalPage}
                totalItems={chemicalResult?.totalItems ?? 0}
                itemsPerPage={pageSize}
                onPageChange={(nextPage) => {
                  setChemicalLoading(true);
                  setChemicalPage(nextPage);
                }}
              />
            </div>
          </section>
        </>
      )}

      {/* Equipment Detail Modal */}
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
                  {selectedEquipment.equipmentId}
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
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-[#eeeeea] text-sm">
              {[
                [
                  "Space",
                  `${spaceNameById.get(selectedEquipment.spaceId) ?? selectedEquipment.spaceId} (${selectedEquipment.spaceType})`,
                ],
                ["Equipment type", selectedEquipment.equipmentType],
                ["Category", selectedEquipment.category],
                ["Variant", selectedEquipment.variant || "—"],
                ["Quantity", String(selectedEquipment.quantityTotal)],
                ["Rental price", formatPrice(selectedEquipment.rentalPrice)],
                ["Condition", selectedEquipment.conditionStatus],
                ["Status", selectedEquipment.status],
                ["Status note", selectedEquipment.statusNote || "—"],
                ["Description", selectedEquipment.description || "—"],
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
                  const item = selectedEquipment;
                  setSelectedEquipment(null);
                  startEditEquipment(item);
                }}
                className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]">
                Edit
              </button>
              <button
                type="button"
                onClick={() => setSelectedEquipment(null)}
                className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]">
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Chemical Detail Modal */}
      {selectedChemical && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
          onClick={() => setSelectedChemical(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chemical-detail-title"
            className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                  {selectedChemical.chemicalId}
                </p>
                <h2
                  id="chemical-detail-title"
                  className="mt-1 text-xl font-semibold text-[#20221f]">
                  {selectedChemical.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChemical(null)}
                aria-label="Close chemical details"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-[#eeeeea] text-sm">
              {[
                [
                  "Darkroom",
                  spaceNameById.get(selectedChemical.darkroomId) ??
                    selectedChemical.darkroomId,
                ],
                ["Chemical type", selectedChemical.chemicalType],
                ["Brand", selectedChemical.brand || "—"],
                [
                  "Stock quantity",
                  `${selectedChemical.stockQuantity} ${selectedChemical.stockUnit}`,
                ],
                [
                  "Minimum stock",
                  `${selectedChemical.minimumStock} ${selectedChemical.stockUnit}`,
                ],
                [
                  "Low-stock alert",
                  selectedChemical.isLowStock ? "YES (Low stock)" : "No",
                ],
                ["Unit cost", formatPrice(selectedChemical.unitCost)],
                ["Expires on", selectedChemical.expiresOn || "—"],
                ["Status", selectedChemical.status],
                ["Status note", selectedChemical.statusNote || "—"],
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
                  const item = selectedChemical;
                  setSelectedChemical(null);
                  startAdjustStock(item);
                }}
                className="h-9 rounded-md border border-[#39724b] px-3 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]">
                Adjust stock
              </button>
              <button
                type="button"
                onClick={() => setSelectedChemical(null)}
                className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]">
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Chemical Create/Edit Modal */}
      {chemicalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/35 p-4"
          onClick={() => setChemicalModalOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chemical-modal-title"
            className="my-auto w-full max-w-xl rounded-lg border border-[#e0e0da] bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-4">
              <h2
                id="chemical-modal-title"
                className="text-lg font-semibold text-[#20221f]">
                {editingChemical ? "Edit chemical" : "Add darkroom chemical"}
              </h2>
              <button
                type="button"
                onClick={() => setChemicalModalOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSaveChemical}
              className="grid gap-4 p-6 sm:grid-cols-2">
              {chemicalError && (
                <p
                  role="alert"
                  className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339] sm:col-span-2">
                  {chemicalError}
                </p>
              )}
              {!editingChemical && (
                <label className="grid gap-1.5 text-sm font-medium text-[#343630] sm:col-span-2">
                  Darkroom
                  <select
                    required
                    value={chemDarkroom}
                    onChange={(event) => setChemDarkroom(event.target.value)}
                    className={fieldClassName}>
                    <option value="" disabled>
                      Select darkroom
                    </option>
                    {darkrooms.map((dr) => (
                      <option key={dr.spaceId} value={dr.spaceId}>
                        {dr.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Name
                <input
                  required
                  maxLength={200}
                  value={chemName}
                  onChange={(event) => setChemName(event.target.value)}
                  placeholder="e.g. Ilford ID-11 Developer"
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Chemical type
                <select
                  value={chemType}
                  onChange={(event) => setChemType(event.target.value)}
                  className={fieldClassName}>
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="STOP_BATH">STOP_BATH</option>
                  <option value="FIXER">FIXER</option>
                  <option value="HYPO_CLEAR">HYPO_CLEAR</option>
                  <option value="WETTING_AGENT">WETTING_AGENT</option>
                  <option value="TONER">TONER</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Brand (optional)
                <input
                  maxLength={100}
                  value={chemBrand}
                  onChange={(event) => setChemBrand(event.target.value)}
                  placeholder="e.g. Ilford, Kodak"
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Stock unit
                <input
                  required
                  maxLength={30}
                  value={chemStockUnit}
                  onChange={(event) => setChemStockUnit(event.target.value)}
                  placeholder="e.g. L, mL, pack"
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Stock quantity
                <input
                  type="number"
                  required
                  min={0}
                  step="0.001"
                  value={chemStockQuantity}
                  onChange={(event) => setChemStockQuantity(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Minimum stock (low-stock threshold)
                <input
                  type="number"
                  required
                  min={0}
                  step="0.001"
                  value={chemMinimumStock}
                  onChange={(event) => setChemMinimumStock(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Unit cost (VND, optional)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={chemUnitCost}
                  onChange={(event) => setChemUnitCost(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Expires on (optional)
                <input
                  type="date"
                  value={chemExpiresOn}
                  onChange={(event) => setChemExpiresOn(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Status
                <select
                  value={chemStatus}
                  onChange={(event) =>
                    setChemStatus(event.target.value as ProviderChemicalStatus)
                  }
                  className={fieldClassName}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Status note (optional)
                <input
                  maxLength={1000}
                  value={chemStatusNote}
                  onChange={(event) => setChemStatusNote(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setChemicalModalOpen(false)}
                  className="h-9 rounded-md border border-[#d8d8d1] px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingChemical}
                  className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
                  {savingChemical
                    ? "Saving…"
                    : editingChemical
                      ? "Save changes"
                      : "Add chemical"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingChemical && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
          onClick={() => setAdjustingChemical(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-adjust-title"
            className="w-full max-w-md rounded-lg border border-[#e0e0da] bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-4">
              <div>
                <h2
                  id="stock-adjust-title"
                  className="text-lg font-semibold text-[#20221f]">
                  Adjust stock
                </h2>
                <p className="text-xs text-[#777973]">
                  {adjustingChemical.name} (Current:{" "}
                  {adjustingChemical.stockQuantity}{" "}
                  {adjustingChemical.stockUnit})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingChemical(null)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdjustStock} className="grid gap-4 p-6">
              {chemicalError && (
                <p
                  role="alert"
                  className="rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">
                  {chemicalError}
                </p>
              )}
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Movement type
                <select
                  value={movementType}
                  onChange={(event) =>
                    setMovementType(
                      event.target.value as ProviderChemicalMovementType,
                    )
                  }
                  className={fieldClassName}>
                  <option value="PURCHASE">PURCHASE (+ restock)</option>
                  <option value="CONSUMPTION">CONSUMPTION (- usage)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (+/- delta)</option>
                  <option value="WASTE">WASTE (- expired/spilled)</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Quantity delta ({adjustingChemical.stockUnit})
                <input
                  type="number"
                  required
                  step="0.001"
                  value={quantityDelta}
                  onChange={(event) => setQuantityDelta(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Unit cost (VND, optional)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={adjustUnitCost}
                  onChange={(event) => setAdjustUnitCost(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Supplier or reference (optional)
                <input
                  maxLength={255}
                  value={supplierOrReference}
                  onChange={(event) =>
                    setSupplierOrReference(event.target.value)
                  }
                  placeholder="e.g. PO-2026-11"
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#343630]">
                Note (optional)
                <input
                  maxLength={1000}
                  value={adjustNote}
                  onChange={(event) => setAdjustNote(event.target.value)}
                  placeholder="Reason for adjustment"
                  className={fieldClassName}
                />
              </label>
              <div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4">
                <button
                  type="button"
                  onClick={() => setAdjustingChemical(null)}
                  className="h-9 rounded-md border border-[#d8d8d1] px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdjustment}
                  className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
                  {savingAdjustment ? "Saving…" : "Record movement"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <EquipmentModal
        key={equipmentModalVersion}
        open={equipmentModalOpen}
        mode={equipmentModalMode}
        spaces={spaces}
        equipment={editingEquipment}
        error={equipmentError || undefined}
        submitting={savingEquipment}
        onClose={() => {
          setEquipmentModalOpen(false);
          setEditingEquipment(null);
        }}
        onCreate={(data) => void handleCreateEquipment(data)}
        onUpdate={(data) => void handleUpdateEquipment(data)}
      />

      {pendingDeleteEquipment && (
        <ConfirmDeleteDialog
          title="Delete this equipment?"
          description={`“${pendingDeleteEquipment.name}” will be permanently deleted. If it has booking or package history, set its status to INACTIVE instead.`}
          confirming={deletingEquipment}
          error={equipmentError || undefined}
          onCancel={() => {
            if (!deletingEquipment) {
              setPendingDeleteEquipment(null);
              setEquipmentError("");
            }
          }}
          onConfirm={() => void confirmDeleteEquipment()}
        />
      )}

      {pendingDeleteChemical && (
        <ConfirmDeleteDialog
          title="Delete this chemical?"
          description={`“${pendingDeleteChemical.name}” will be permanently deleted. If it has stock movement or package history, set its status to INACTIVE instead.`}
          confirming={deletingChemical}
          error={chemicalError || undefined}
          onCancel={() => {
            if (!deletingChemical) {
              setPendingDeleteChemical(null);
              setChemicalError("");
            }
          }}
          onConfirm={() => void confirmDeleteChemical()}
        />
      )}
    </div>
  );
}
