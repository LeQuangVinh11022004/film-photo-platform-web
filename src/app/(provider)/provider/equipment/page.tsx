"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Camera,
  FlaskConical,
  PackagePlus,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { EquipmentModal } from "@/features/equipment/components/EquipmentModal";
import { EquipmentDetailsModal } from "@/features/equipment/components/EquipmentDetailsModal";
import { EquipmentAvailabilityModal } from "@/features/equipment/components/EquipmentAvailabilityModal";
import { ChemicalDetailsModal } from "@/features/equipment/components/ChemicalDetailsModal";
import {
  ChemicalModal,
  type ChemicalFormValues,
} from "@/features/equipment/components/ChemicalModal";
import {
  ChemicalStockAdjustmentModal,
  type StockAdjustmentFormValues,
} from "@/features/equipment/components/ChemicalStockAdjustmentModal";
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
  ProviderChemicalRequest,
  ProviderChemicalStockAdjustmentRequest,
} from "@/features/provider-chemical";
import { listMyProviderSpaces } from "@/features/provider-space/api";
import type { ProviderSpace } from "@/features/provider-space";
import {
  createMyProviderMaintenance,
  deleteMyProviderMaintenance,
  getMyProviderMaintenanceById,
  listMyProviderMaintenance,
  updateMyProviderMaintenance,
} from "@/features/provider-maintenance/api";
import type {
  ProviderMaintenance,
  ProviderMaintenanceResourceType,
  ProviderMaintenanceStatus,
} from "@/features/provider-maintenance";
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

function maintenanceStatusTone(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED") return "bg-[#e5f0e8] text-[#39724b]";
  if (normalized === "IN_PROGRESS" || normalized === "SCHEDULED")
    return "bg-[#f8edd9] text-[#93651e]";
  return "bg-[#f5e4e1] text-[#a34d42]";
}

function toLocalDateTimeInput(isoString: string | null | undefined) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EquipmentPage() {
  const { messages } = useProviderLanguage();
  const eq = messages.equipment;
  const [activeTab, setActiveTab] = useState<
    "equipment" | "chemicals" | "maintenance"
  >("equipment");
  const [spaces, setSpaces] = useState<ProviderSpace[]>([]);
  const [allEquipmentForPicker, setAllEquipmentForPicker] = useState<
    ProviderEquipment[]
  >([]);

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
  const [equipmentModalMode, setEquipmentModalMode] = useState<
    "create" | "edit"
  >("create");
  const [editingEquipment, setEditingEquipment] =
    useState<ProviderEquipment | null>(null);
  const [savingEquipment, setSavingEquipment] = useState(false);
  const [pendingDeleteEquipment, setPendingDeleteEquipment] =
    useState<ProviderEquipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState(false);
  const [managingAvailabilityEquipment, setManagingAvailabilityEquipment] =
    useState<ProviderEquipment | null>(null);

  // Chemicals state
  const [chemicalResult, setChemicalResult] =
    useState<PagedResponse<ProviderChemical> | null>(null);
  const [chemicalLoading, setChemicalLoading] = useState(true);
  const [chemicalError, setChemicalError] = useState("");
  const [pickerError, setPickerError] = useState("");
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
  const [chemicalForm, setChemicalForm] = useState<ChemicalFormValues>({
    darkroomId: "",
    name: "",
    chemicalType: "DEVELOPER",
    brand: "",
    stockQuantity: "1",
    stockUnit: "L",
    minimumStock: "0.5",
    unitCost: "",
    unitSellingPrice: "",
    expiresOn: "",
    status: "ACTIVE",
    statusNote: "",
  });

  // Chemical stock adjustment modal state
  const [adjustingChemical, setAdjustingChemical] =
    useState<ProviderChemical | null>(null);

  const [stockForm, setStockForm] = useState<StockAdjustmentFormValues>({
    movementType: "PURCHASE",
    quantityDelta: "1",
    unitCost: "",
    supplierOrReference: "",
    note: "",
  });

  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // Maintenance state
  const [maintenanceResult, setMaintenanceResult] =
    useState<PagedResponse<ProviderMaintenance> | null>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [maintenanceError, setMaintenanceError] = useState("");
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [maintenanceStatus, setMaintenanceStatus] = useState("");
  const [maintenanceQuery, setMaintenanceQuery] = useState("");
  const [maintenanceReloadKey, setMaintenanceReloadKey] = useState(0);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<ProviderMaintenance | null>(null);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] =
    useState<ProviderMaintenance | null>(null);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [pendingDeleteMaintenance, setPendingDeleteMaintenance] =
    useState<ProviderMaintenance | null>(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState<{
    resourceType: ProviderMaintenanceResourceType;
    resourceId: string;
    maintenanceDate: string;
    completedAt: string;
    description: string;
    repairNote: string;
    status: ProviderMaintenanceStatus;
    cost: string;
  }>({
    resourceType: "EQUIPMENT",
    resourceId: "",
    maintenanceDate: "",
    completedAt: "",
    description: "",
    repairNote: "",
    status: "SCHEDULED",
    cost: "",
  });

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      listMyProviderSpaces({ page: 1, pageSize: 100 }),
      listMyProviderEquipment({ page: 1, pageSize: 100 }),
    ]).then(([spaceResult, equipmentResult]) => {
      if (cancelled) return;
      if (spaceResult.status === "fulfilled") setSpaces(spaceResult.value.items);
      if (equipmentResult.status === "fulfilled") setAllEquipmentForPicker(equipmentResult.value.items);
      setPickerError(
        spaceResult.status === "rejected" || equipmentResult.status === "rejected"
          ? "Some resources could not be loaded for the picker. Refresh the page to retry."
          : "",
      );
    });
    return () => {
      cancelled = true;
    };
  }, [equipmentReloadKey]);

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

  useEffect(() => {
    let cancelled = false;
    listMyProviderMaintenance({
      status: maintenanceStatus || undefined,
      page: maintenancePage,
      pageSize,
    })
      .then((data) => {
        if (!cancelled) {
          setMaintenanceResult(data);
          setMaintenanceError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setMaintenanceError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setMaintenanceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [maintenancePage, maintenanceStatus, maintenanceReloadKey]);

  const studios = spaces.filter(
    (space) => space.type.toUpperCase() === "STUDIO",
  );
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

  const maintenanceItems = (maintenanceResult?.items ?? []).filter((item) =>
    `${item.resourceName} ${item.resourceType} ${item.description} ${item.repairNote ?? ""} ${item.maintenanceId}`
      .toLowerCase()
      .includes(maintenanceQuery.trim().toLowerCase()),
  );

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
      if (
        selectedEquipment?.equipmentId === pendingDeleteEquipment.equipmentId
      ) {
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
    setChemicalForm({
      darkroomId: darkrooms[0]?.spaceId ?? spaces[0]?.spaceId ?? "",
      name: "",
      chemicalType: "DEVELOPER",
      brand: "",
      stockQuantity: "1",
      stockUnit: "L",
      minimumStock: "0.5",
      unitCost: "",
      unitSellingPrice: "",
      expiresOn: "",
      status: "ACTIVE",
      statusNote: "",
    });
    setChemicalModalOpen(true);
  }

  function startEditChemical(item: ProviderChemical) {
    setChemicalError("");
    setEditingChemical(item);
    setChemicalForm({
      darkroomId: item.darkroomId,
      name: item.name,
      chemicalType: item.chemicalType,
      brand: item.brand ?? "",
      stockQuantity: String(item.stockQuantity),
      stockUnit: item.stockUnit,
      minimumStock: String(item.minimumStock),
      unitCost: item.unitCost != null ? String(item.unitCost) : "",
      unitSellingPrice: item.unitSellingPrice != null ? String(item.unitSellingPrice) : "",
      expiresOn: item.expiresOn ?? "",
      status: item.status.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      statusNote: item.statusNote ?? "",
    });
    setChemicalModalOpen(true);
  }

  async function handleSaveChemical(
    payload: ProviderChemicalRequest,
    darkroomId: string,
  ) {
    setSavingChemical(true);
    setChemicalError("");

    try {
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
          darkroomId,
        };
        await createMyProviderChemical(createPayload);
      }

      setChemicalModalOpen(false);
      setEditingChemical(null);
      setChemicalReloadKey((key) => key + 1);
    } catch (err) {
      setChemicalError(errorMessage(err));
    } finally {
      setSavingChemical(false);
    }
  }

  function startAdjustStock(item: ProviderChemical) {
    setChemicalError("");
    setAdjustingChemical(item);
    setStockForm({
      movementType: "PURCHASE",
      quantityDelta: "1",
      unitCost: item.unitCost != null ? String(item.unitCost) : "",
      supplierOrReference: "",
      note: "",
    });
  }

  async function handleAdjustStock(
    input: ProviderChemicalStockAdjustmentRequest,
  ) {
    if (!adjustingChemical) return;

    setSavingAdjustment(true);
    setChemicalError("");

    try {
      const updated = await adjustMyProviderChemicalStock(
        adjustingChemical.chemicalId,
        input,
      );

      if (selectedChemical?.chemicalId === updated.chemicalId) {
        setSelectedChemical(updated);
      }

      setAdjustingChemical(null);
      setChemicalReloadKey((key) => key + 1);
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

  // Maintenance handlers
  async function openMaintenanceDetail(maintenanceId: string) {
    setMaintenanceError("");
    try {
      setSelectedMaintenance(await getMyProviderMaintenanceById(maintenanceId));
    } catch (err) {
      setMaintenanceError(errorMessage(err));
    }
  }

  function getDefaultResourceForType(type: ProviderMaintenanceResourceType) {
    if (type === "STUDIO") return studios[0]?.spaceId ?? "";
    if (type === "DARKROOM") return darkrooms[0]?.spaceId ?? "";
    return (
      allEquipmentForPicker[0]?.equipmentId ??
      equipmentResult?.items[0]?.equipmentId ??
      ""
    );
  }

  function startCreateMaintenance() {
    setMaintenanceError("");
    setEditingMaintenance(null);
    const initialType: ProviderMaintenanceResourceType =
      allEquipmentForPicker.length > 0
        ? "EQUIPMENT"
        : studios.length > 0
          ? "STUDIO"
          : "DARKROOM";
    setMaintenanceForm({
      resourceType: initialType,
      resourceId: getDefaultResourceForType(initialType),
      maintenanceDate: toLocalDateTimeInput(new Date().toISOString()),
      completedAt: "",
      description: "",
      repairNote: "",
      status: "SCHEDULED",
      cost: "",
    });
    setMaintenanceModalOpen(true);
  }

  function startEditMaintenance(item: ProviderMaintenance) {
    setMaintenanceError("");
    setEditingMaintenance(item);
    const normalizedType: ProviderMaintenanceResourceType =
      item.resourceType.toUpperCase() === "STUDIO"
        ? "STUDIO"
        : item.resourceType.toUpperCase() === "DARKROOM"
          ? "DARKROOM"
          : "EQUIPMENT";
    setMaintenanceForm({
      resourceType: normalizedType,
      resourceId: item.equipmentId ?? item.studioId ?? item.darkroomId ?? "",
      maintenanceDate: toLocalDateTimeInput(item.maintenanceDate),
      completedAt: toLocalDateTimeInput(item.completedAt),
      description: item.description,
      repairNote: item.repairNote ?? "",
      status: (["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
        item.status.toUpperCase(),
      )
        ? item.status.toUpperCase()
        : "SCHEDULED") as ProviderMaintenanceStatus,
      cost: item.cost != null ? String(item.cost) : "",
    });
    setMaintenanceModalOpen(true);
  }

  async function handleSaveMaintenance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingMaintenance(true);
    setMaintenanceError("");
    try {
      const parsedDate = maintenanceForm.maintenanceDate
        ? new Date(maintenanceForm.maintenanceDate).toISOString()
        : new Date().toISOString();
      const parsedCost =
        maintenanceForm.cost.trim() === ""
          ? null
          : Number(maintenanceForm.cost);

      if (editingMaintenance) {
        const updated = await updateMyProviderMaintenance(
          editingMaintenance.maintenanceId,
          {
            maintenanceDate: parsedDate,
            completedAt: maintenanceForm.completedAt
              ? new Date(maintenanceForm.completedAt).toISOString()
              : null,
            description: maintenanceForm.description.trim(),
            repairNote: maintenanceForm.repairNote.trim() || null,
            status: maintenanceForm.status,
            cost: parsedCost,
          },
        );
        if (selectedMaintenance?.maintenanceId === updated.maintenanceId) {
          setSelectedMaintenance(updated);
        }
      } else {
        await createMyProviderMaintenance({
          studioId:
            maintenanceForm.resourceType === "STUDIO"
              ? maintenanceForm.resourceId
              : null,
          darkroomId:
            maintenanceForm.resourceType === "DARKROOM"
              ? maintenanceForm.resourceId
              : null,
          equipmentId:
            maintenanceForm.resourceType === "EQUIPMENT"
              ? maintenanceForm.resourceId
              : null,
          maintenanceDate: parsedDate,
          description: maintenanceForm.description.trim(),
          repairNote: maintenanceForm.repairNote.trim() || null,
          status: maintenanceForm.status,
          cost: parsedCost,
        });
      }
      setMaintenanceModalOpen(false);
      setEditingMaintenance(null);
      setMaintenanceReloadKey((k) => k + 1);
      setEquipmentReloadKey((k) => k + 1);
    } catch (err) {
      setMaintenanceError(errorMessage(err));
    } finally {
      setSavingMaintenance(false);
    }
  }

  async function confirmDeleteMaintenance() {
    if (!pendingDeleteMaintenance) return;
    setDeletingMaintenance(true);
    setMaintenanceError("");
    try {
      await deleteMyProviderMaintenance(pendingDeleteMaintenance.maintenanceId);
      if (
        selectedMaintenance?.maintenanceId ===
        pendingDeleteMaintenance.maintenanceId
      ) {
        setSelectedMaintenance(null);
      }
      setPendingDeleteMaintenance(null);
      if ((maintenanceResult?.items.length ?? 0) <= 1 && maintenancePage > 1) {
        setMaintenancePage((p) => p - 1);
      } else {
        setMaintenanceReloadKey((k) => k + 1);
      }
    } catch (err) {
      setMaintenanceError(errorMessage(err));
    } finally {
      setDeletingMaintenance(false);
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
          {pickerError && <p role="alert" className="mb-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">{pickerError}</p>}
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
        <button
          type="button"
          onClick={() => setActiveTab("maintenance")}
          className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
            activeTab === "maintenance"
              ? "border-[#39724b] bg-[#e5f0e8] text-[#20221f]"
              : "border-transparent text-[#686a64] hover:border-[#d8d8d1] hover:bg-white"
          }`}>
          <Wrench size={16} />
          <span>Maintenance Schedule ({maintenanceResult?.totalItems ?? 0})</span>
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
                              onClick={() => setManagingAvailabilityEquipment(item)}
                              title="Manage availability"
                              aria-label={`Manage availability for ${item.name}`}
                              className="rounded-md px-2 py-1 text-xs font-semibold text-[#39724b] hover:bg-[#e5f0e8]">
                              Availability
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

      {/* ==================== MAINTENANCE TAB ==================== */}
      {activeTab === "maintenance" && (
        <>
          <section
            aria-label="Maintenance summary"
            className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total maintenance logs",
                value: String(maintenanceResult?.totalItems ?? 0),
                helper: "Across studios, darkrooms, and equipment",
              },
              {
                label: "Active / Scheduled on page",
                value: String(
                  maintenanceItems.filter((i) =>
                    ["SCHEDULED", "IN_PROGRESS"].includes(
                      i.status.toUpperCase(),
                    ),
                  ).length,
                ),
                helper: "Scheduled or currently in progress",
              },
              {
                label: "Completed on page",
                value: String(
                  maintenanceItems.filter(
                    (i) => i.status.toUpperCase() === "COMPLETED",
                  ).length,
                ),
                helper: "Finished maintenance records",
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

          {maintenanceError && !maintenanceModalOpen && !pendingDeleteMaintenance && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">
              {maintenanceError}
            </p>
          )}

          <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#20221f]">
                    Maintenance logs & schedules
                  </h2>
                  <p className="mt-1 text-sm text-[#777973]">
                    Schedule and track maintenance for studios, darkrooms, and equipment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCreateMaintenance}
                  disabled={
                    spaces.length === 0 && allEquipmentForPicker.length === 0
                  }
                  className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">
                  <Plus size={16} /> Schedule maintenance
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={maintenanceQuery}
                  onChange={(event) => setMaintenanceQuery(event.target.value)}
                  placeholder="Search resource, description, repair note..."
                  aria-label="Search maintenance logs"
                  className={fieldClassName}
                />
                <select
                  value={maintenanceStatus}
                  onChange={(event) => {
                    setMaintenanceLoading(true);
                    setMaintenanceStatus(event.target.value);
                    setMaintenancePage(1);
                  }}
                  aria-label="Filter maintenance status"
                  className={fieldClassName}>
                  <option value="">All statuses</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-220 border-collapse text-left">
                <thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
                  <tr>
                    <th className="px-5 py-3">Resource</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Maintenance Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeea]">
                  {maintenanceLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        Loading maintenance logs…
                      </td>
                    </tr>
                  ) : (
                    maintenanceItems.map((item) => (
                      <tr
                        key={item.maintenanceId}
                        className="transition-colors hover:bg-[#fcfcfa]">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-[#292b27]">
                            {item.resourceName}
                          </p>
                          <p className="mt-0.5 text-xs text-[#777973]">
                            {item.maintenanceId.slice(0, 8)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          {item.resourceType}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          <p>
                            {new Date(item.maintenanceDate).toLocaleString()}
                          </p>
                          {item.completedAt && (
                            <p className="text-xs text-[#39724b]">
                              Done: {new Date(item.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="max-w-xs px-4 py-3.5 text-sm text-[#686a64]">
                          <p className="truncate">{item.description}</p>
                          {item.repairNote && (
                            <p className="truncate text-xs text-[#858680]">
                              Note: {item.repairNote}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#686a64]">
                          {formatPrice(item.cost)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${maintenanceStatusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                void openMaintenanceDetail(item.maintenanceId)
                              }
                              className="rounded-md px-2 py-1 text-xs font-semibold text-[#39724b] hover:bg-[#e5f0e8]">
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditMaintenance(item)}
                              aria-label={`Edit maintenance for ${item.resourceName}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]">
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteMaintenance(item)}
                              aria-label={`Delete maintenance for ${item.resourceName}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {!maintenanceLoading && maintenanceItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-[#777973]">
                        No maintenance logs found for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#e8e8e2] px-5 py-4">
              <Pagination
                currentPage={maintenancePage}
                totalItems={maintenanceResult?.totalItems ?? 0}
                itemsPerPage={pageSize}
                onPageChange={(nextPage) => {
                  setMaintenanceLoading(true);
                  setMaintenancePage(nextPage);
                }}
              />
            </div>
          </section>
        </>
      )}

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <EquipmentDetailsModal
          equipment={selectedEquipment}
          spaceName={
            selectedEquipment
              ? spaceNameById.get(selectedEquipment.spaceId)
              : undefined
          }
          onClose={() => setSelectedEquipment(null)}
          onEdit={(item) => {
            setSelectedEquipment(null);
            startEditEquipment(item);
          }}
          onManageAvailability={(item) => {
            setSelectedEquipment(null);
            setManagingAvailabilityEquipment(item);
          }}
        />
      )}

      {/* Equipment Availability Modal */}
      {managingAvailabilityEquipment && (
        <EquipmentAvailabilityModal
          equipment={managingAvailabilityEquipment}
          spaceName={
            managingAvailabilityEquipment
              ? spaceNameById.get(managingAvailabilityEquipment.spaceId)
              : undefined
          }
          isOpen={Boolean(managingAvailabilityEquipment)}
          onClose={() => setManagingAvailabilityEquipment(null)}
        />
      )}

      {/* Chemical Detail Modal */}
      {selectedChemical && (
        <ChemicalDetailsModal
          chemical={selectedChemical}
          darkroomName={
            selectedChemical
              ? spaceNameById.get(selectedChemical.darkroomId)
              : undefined
          }
          onClose={() => setSelectedChemical(null)}
          onAdjustStock={(item) => {
            setSelectedChemical(null);
            startAdjustStock(item);
          }}
        />
      )}

      {/* Chemical Create/Edit Modal */}
      {chemicalModalOpen && (
        <ChemicalModal
          open={chemicalModalOpen}
          chemical={editingChemical}
          darkrooms={darkrooms}
          values={chemicalForm}
          error={chemicalError || undefined}
          submitting={savingChemical}
          onChange={setChemicalForm}
          onClose={() => setChemicalModalOpen(false)}
          onSubmit={(payload, darkroomId) =>
            void handleSaveChemical(payload, darkroomId)
          }
        />
      )}

      {/* Stock Adjustment Modal */}
      {adjustingChemical && (
        <ChemicalStockAdjustmentModal
          chemical={adjustingChemical}
          values={stockForm}
          error={chemicalError || undefined}
          submitting={savingAdjustment}
          onChange={setStockForm}
          onClose={() => setAdjustingChemical(null)}
          onSubmit={(payload) => void handleAdjustStock(payload)}
        />
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

      {/* Maintenance Detail Modal */}
      {selectedMaintenance && !maintenanceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4"
          onClick={() => setSelectedMaintenance(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-detail-title"
            className="w-full max-w-lg rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                  {selectedMaintenance.maintenanceId}
                </p>
                <h2
                  id="maintenance-detail-title"
                  className="mt-1 text-xl font-semibold text-[#20221f]">
                  {selectedMaintenance.resourceName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaintenance(null)}
                aria-label="Close maintenance details"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-[#eeeeea] text-sm">
              {[
                ["Resource Type", selectedMaintenance.resourceType],
                ["Status", selectedMaintenance.status],
                [
                  "Scheduled Date",
                  new Date(selectedMaintenance.maintenanceDate).toLocaleString(),
                ],
                [
                  "Completed At",
                  selectedMaintenance.completedAt
                    ? new Date(selectedMaintenance.completedAt).toLocaleString()
                    : "—",
                ],
                ["Cost", formatPrice(selectedMaintenance.cost)],
                ["Description", selectedMaintenance.description],
                ["Repair Note", selectedMaintenance.repairNote || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-[#777973]">{label}</dt>
                  <dd className="text-right font-medium text-[#343630]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => startEditMaintenance(selectedMaintenance)}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#39724b] px-3 text-sm font-semibold text-white hover:bg-[#2f603e]">
                <Pencil size={15} /> Edit
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Maintenance Create/Edit Modal */}
      {maintenanceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setMaintenanceModalOpen(false);
          }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-form-title"
            className="my-auto w-full max-w-xl rounded-lg border border-[#e0e0da] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e8e8e2] px-5 py-4">
              <h2
                id="maintenance-form-title"
                className="text-lg font-semibold text-[#20221f]">
                {editingMaintenance
                  ? "Edit maintenance log"
                  : "Schedule maintenance"}
              </h2>
              <button
                type="button"
                onClick={() => setMaintenanceModalOpen(false)}
                aria-label="Close form"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#686a64] hover:bg-[#f0f0ec]">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSaveMaintenance}
              className="grid gap-4 p-5 sm:grid-cols-2">
              {!editingMaintenance && (
                <>
                  <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
                    Target Type
                    <select
                      value={maintenanceForm.resourceType}
                      onChange={(event) => {
                        const nextType = event.target
                          .value as ProviderMaintenanceResourceType;
                        setMaintenanceForm((cur) => ({
                          ...cur,
                          resourceType: nextType,
                          resourceId: getDefaultResourceForType(nextType),
                        }));
                      }}
                      className={fieldClassName}>
                      <option value="EQUIPMENT">Equipment</option>
                      <option value="STUDIO">Studio</option>
                      <option value="DARKROOM">Darkroom</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
                    Target Resource
                    <select
                      required
                      value={maintenanceForm.resourceId}
                      onChange={(event) =>
                        setMaintenanceForm((cur) => ({
                          ...cur,
                          resourceId: event.target.value,
                        }))
                      }
                      className={fieldClassName}>
                      <option value="" disabled>
                        Select resource
                      </option>
                      {maintenanceForm.resourceType === "STUDIO" &&
                        studios.map((s) => (
                          <option key={s.spaceId} value={s.spaceId}>
                            {s.name}
                          </option>
                        ))}
                      {maintenanceForm.resourceType === "DARKROOM" &&
                        darkrooms.map((d) => (
                          <option key={d.spaceId} value={d.spaceId}>
                            {d.name}
                          </option>
                        ))}
                      {maintenanceForm.resourceType === "EQUIPMENT" &&
                        allEquipmentForPicker.map((e) => (
                          <option key={e.equipmentId} value={e.equipmentId}>
                            {e.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </>
              )}
              <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
                Maintenance Date
                <input
                  required
                  type="datetime-local"
                  value={maintenanceForm.maintenanceDate}
                  onChange={(event) =>
                    setMaintenanceForm((cur) => ({
                      ...cur,
                      maintenanceDate: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
                Status
                <select
                  value={maintenanceForm.status}
                  onChange={(event) =>
                    setMaintenanceForm((cur) => ({
                      ...cur,
                      status: event.target.value as ProviderMaintenanceStatus,
                    }))
                  }
                  className={fieldClassName}>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </label>
              {editingMaintenance && (
                <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
                  Completed At (optional)
                  <input
                    type="datetime-local"
                    value={maintenanceForm.completedAt}
                    onChange={(event) =>
                      setMaintenanceForm((cur) => ({
                        ...cur,
                        completedAt: event.target.value,
                      }))
                    }
                    className={fieldClassName}
                  />
                </label>
              )}
              <label className="grid gap-1.5 text-sm font-medium text-[#454741]">
                Cost (VND, optional)
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={maintenanceForm.cost}
                  onChange={(event) =>
                    setMaintenanceForm((cur) => ({
                      ...cur,
                      cost: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">
                Description
                <textarea
                  required
                  rows={2}
                  maxLength={1000}
                  value={maintenanceForm.description}
                  onChange={(event) =>
                    setMaintenanceForm((cur) => ({
                      ...cur,
                      description: event.target.value,
                    }))
                  }
                  className="rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#454741] sm:col-span-2">
                Repair Note (optional)
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={maintenanceForm.repairNote}
                  onChange={(event) =>
                    setMaintenanceForm((cur) => ({
                      ...cur,
                      repairNote: event.target.value,
                    }))
                  }
                  className="rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15"
                />
              </label>
              {maintenanceError && (
                <p role="alert" className="text-sm text-[#a34d42] sm:col-span-2">
                  {maintenanceError}
                </p>
              )}
              <div className="flex justify-end gap-2 border-t border-[#eeeeea] pt-4 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setMaintenanceModalOpen(false)}
                  className="h-10 rounded-md border border-[#d8d8d1] px-4 text-sm font-semibold text-[#454741] hover:bg-[#f7f7f3]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMaintenance}
                  className="h-10 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60">
                  {savingMaintenance
                    ? "Saving…"
                    : editingMaintenance
                      ? "Save changes"
                      : "Schedule maintenance"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingDeleteMaintenance && (
        <ConfirmDeleteDialog
          title="Delete this maintenance record?"
          description={`Maintenance log for “${pendingDeleteMaintenance.resourceName}” will be permanently deleted.`}
          confirming={deletingMaintenance}
          error={maintenanceError || undefined}
          onCancel={() => {
            if (!deletingMaintenance) {
              setPendingDeleteMaintenance(null);
              setMaintenanceError("");
            }
          }}
          onConfirm={() => void confirmDeleteMaintenance()}
        />
      )}
    </div>
  );
}
