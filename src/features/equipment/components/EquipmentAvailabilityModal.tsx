"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Layers,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { listMyProviderSpaceAvailability } from "@/features/provider-space/api";
import type { ProviderSpaceAvailability } from "@/features/provider-space";
import {
  createMyProviderEquipmentAvailability,
  deleteMyProviderEquipmentAvailability,
  listMyProviderEquipmentAvailability,
  updateMyProviderEquipmentAvailability,
} from "../api";
import type {
  ProviderEquipment,
  ProviderEquipmentAvailability,
  ProviderEquipmentAvailabilityRequest,
} from "../types";

type Props = {
  equipment: ProviderEquipment | null;
  spaceName?: string;
  isOpen: boolean;
  onClose: () => void;
};

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

function displayTime(value: string | undefined | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

function formatPrice(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value.toLocaleString("vi-VN")} VND`;
}

function statusTone(status: string | undefined | null) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "AVAILABLE") return "bg-[#e5f0e8] text-[#39724b]";
  if (normalized === "BLOCKED" || normalized === "CLOSED") return "bg-[#f5e4e1] text-[#a34d42]";
  return "bg-[#f8edd9] text-[#93651e]";
}

function todayDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysToDateString(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type BulkConfig = {
  startDate: string;
  endDate: string;
  onlyAvailableSpaceSlots: boolean;
  status: string;
  price: number;
  skipExistingSlots: boolean;
};

export function EquipmentAvailabilityModal({
  equipment,
  spaceName,
  isOpen,
  onClose,
}: Props) {
  const [availability, setAvailability] = useState<
    ProviderEquipmentAvailability[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Form mode & single form state
  const [formMode, setFormMode] = useState<"single" | "bulk">("single");
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);

  const defaultPrice = equipment?.rentalPrice ?? 0;

  const [form, setForm] = useState<ProviderEquipmentAvailabilityRequest>({
    availableDate: todayDateString(),
    startTime: "08:00",
    endTime: "18:00",
    status: "AVAILABLE",
    price: defaultPrice,
  });

  // Bulk config state (synced from space availability)
  const [bulkConfig, setBulkConfig] = useState<BulkConfig>({
    startDate: todayDateString(),
    endDate: addDaysToDateString(todayDateString(), 6),
    onlyAvailableSpaceSlots: true,
    status: "AVAILABLE",
    price: defaultPrice,
    skipExistingSlots: true,
  });
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [spaceAvailability, setSpaceAvailability] = useState<
    ProviderSpaceAvailability[]
  >([]);
  const [loadingSpaceAvailability, setLoadingSpaceAvailability] =
    useState(false);
  const [spaceAvailabilityError, setSpaceAvailabilityError] = useState("");

  // Delete dialog
  const [pendingDeleteSlot, setPendingDeleteSlot] =
    useState<ProviderEquipmentAvailability | null>(null);
  const [deletingSlot, setDeletingSlot] = useState(false);

  const equipmentId = equipment?.equipmentId;
  const spaceId = equipment?.spaceId;

  const loadAvailability = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listMyProviderEquipmentAvailability(
        equipmentId,
        {
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      );
      setAvailability(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [equipmentId, fromDate, toDate]);

  useEffect(() => {
    if (!isOpen || !equipmentId) return;
    let cancelled = false;
    listMyProviderEquipmentAvailability(equipmentId, {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    })
      .then((data) => {
        if (!cancelled) {
          setAvailability(data);
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
  }, [isOpen, equipmentId, fromDate, toDate]);

  const loadSpaceAvailability = useCallback(async () => {
    if (!spaceId) return;
    if (
      bulkConfig.startDate &&
      bulkConfig.endDate &&
      bulkConfig.startDate > bulkConfig.endDate
    ) {
      return;
    }
    setLoadingSpaceAvailability(true);
    setSpaceAvailabilityError("");
    try {
      const data = await listMyProviderSpaceAvailability(spaceId, {
        fromDate: bulkConfig.startDate || undefined,
        toDate: bulkConfig.endDate || undefined,
      });
      setSpaceAvailability(data);
    } catch (err) {
      setSpaceAvailability([]);
      setSpaceAvailabilityError(errorMessage(err));
    } finally {
      setLoadingSpaceAvailability(false);
    }
  }, [spaceId, bulkConfig.startDate, bulkConfig.endDate]);

  useEffect(() => {
    if (!isOpen || !spaceId || formMode !== "bulk") return;
    if (
      bulkConfig.startDate &&
      bulkConfig.endDate &&
      bulkConfig.startDate > bulkConfig.endDate
    ) {
      return;
    }
    let cancelled = false;
    listMyProviderSpaceAvailability(spaceId, {
      fromDate: bulkConfig.startDate || undefined,
      toDate: bulkConfig.endDate || undefined,
    })
      .then((data) => {
        if (!cancelled) {
          setSpaceAvailability(data);
          setSpaceAvailabilityError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSpaceAvailability([]);
          setSpaceAvailabilityError(errorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSpaceAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, spaceId, formMode, bulkConfig.startDate, bulkConfig.endDate]);

  const resetSingleForm = () => {
    setEditingAvailabilityId(null);
    setForm({
      availableDate: todayDateString(),
      startTime: "08:00",
      endTime: "18:00",
      status: "AVAILABLE",
      price: equipment?.rentalPrice ?? 0,
    });
  };

  const handleEditClick = (slot: ProviderEquipmentAvailability) => {
    setFormMode("single");
    setEditingAvailabilityId(slot.availabilityId);
    setForm({
      availableDate: slot.availableDate,
      startTime: displayTime(slot.startTime),
      endTime: displayTime(slot.endTime),
      status: slot.status,
      price: slot.price,
    });
    setError("");
    setNotice("");
  };

  const handleSaveSingle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!equipment) return;

    if (form.startTime >= form.endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editingAvailabilityId) {
        await updateMyProviderEquipmentAvailability(
          equipment.equipmentId,
          editingAvailabilityId,
          form,
        );
        setNotice("Availability slot updated successfully.");
      } else {
        await createMyProviderEquipmentAvailability(
          equipment.equipmentId,
          form,
        );
        setNotice("Availability slot created successfully.");
      }
      resetSingleForm();
      await loadAvailability();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Set of existing slot keys: "date|HH:MM|HH:MM"
  const existingSlotKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const item of availability) {
      keys.add(
        `${item.availableDate}|${displayTime(item.startTime)}|${displayTime(item.endTime)}`,
      );
    }
    return keys;
  }, [availability]);

  // Bulk preview calculation from space availability
  const bulkPreview = useMemo(() => {
    if (
      bulkConfig.startDate &&
      bulkConfig.endDate &&
      bulkConfig.startDate > bulkConfig.endDate
    ) {
      return {
        slots: [],
        matchedSpaceSlotsCount: 0,
        skippedCount: 0,
        error: "Start date must be before or equal to end date.",
      };
    }

    if (spaceAvailabilityError) {
      return {
        slots: [],
        matchedSpaceSlotsCount: 0,
        skippedCount: 0,
        error: spaceAvailabilityError,
      };
    }

    const slots: ProviderEquipmentAvailabilityRequest[] = [];
    let matchedSpaceSlotsCount = 0;
    let skippedCount = 0;

    for (const spaceSlot of spaceAvailability) {
      if (
        bulkConfig.onlyAvailableSpaceSlots &&
        (spaceSlot.status ?? "").toUpperCase() !== "AVAILABLE"
      ) {
        continue;
      }
      if (bulkConfig.startDate && spaceSlot.availableDate < bulkConfig.startDate) {
        continue;
      }
      if (bulkConfig.endDate && spaceSlot.availableDate > bulkConfig.endDate) {
        continue;
      }

      matchedSpaceSlotsCount++;
      const startTime = displayTime(spaceSlot.startTime);
      const endTime = displayTime(spaceSlot.endTime);
      const key = `${spaceSlot.availableDate}|${startTime}|${endTime}`;

      if (bulkConfig.skipExistingSlots && existingSlotKeys.has(key)) {
        skippedCount++;
        continue;
      }

      slots.push({
        availableDate: spaceSlot.availableDate,
        startTime,
        endTime,
        status: bulkConfig.status,
        price: bulkConfig.price,
      });
    }

    return {
      slots,
      matchedSpaceSlotsCount,
      skippedCount,
      error: "",
    };
  }, [spaceAvailability, spaceAvailabilityError, bulkConfig, existingSlotKeys]);

  const handleBulkGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!equipment || bulkPreview.error || bulkPreview.slots.length === 0) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    setBulkProgress({ current: 0, total: bulkPreview.slots.length });

    let successCount = 0;
    try {
      for (let i = 0; i < bulkPreview.slots.length; i++) {
        await createMyProviderEquipmentAvailability(
          equipment.equipmentId,
          bulkPreview.slots[i],
        );
        successCount++;
        setBulkProgress({ current: successCount, total: bulkPreview.slots.length });
      }
      setNotice(`Successfully created ${successCount} availability slots.`);
      await loadAvailability();
    } catch (err) {
      setError(
        `Generated ${successCount}/${bulkPreview.slots.length} slots before error: ${errorMessage(err)}`,
      );
      await loadAvailability();
    } finally {
      setSaving(false);
      setBulkProgress(null);
    }
  };

  const handleDeleteSlot = async () => {
    if (!equipment || !pendingDeleteSlot) return;
    setDeletingSlot(true);
    setError("");
    try {
      await deleteMyProviderEquipmentAvailability(
        equipment.equipmentId,
        pendingDeleteSlot.availabilityId,
      );
      setPendingDeleteSlot(null);
      setNotice("Availability slot removed.");
      if (editingAvailabilityId === pendingDeleteSlot.availabilityId) {
        resetSingleForm();
      }
      await loadAvailability();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingSlot(false);
    }
  };

  if (!isOpen || !equipment) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/45 p-4"
        onClick={onClose}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="equipment-availability-title"
          className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-[#e0e0da] bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#eeeeea] px-6 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f0e8] px-2.5 py-0.5 text-xs font-semibold text-[#39724b]">
                  <Calendar size={12} />
                  Availability
                </span>
                <span className="text-xs text-[#777973]">
                  {spaceName ? `${spaceName} · ` : ""}{equipment.category}
                </span>
              </div>
              <h2
                id="equipment-availability-title"
                className="mt-1 text-xl font-bold text-[#20221f]"
              >
                {equipment.name}
              </h2>
              <p className="mt-0.5 text-xs text-[#777973]">
                ID: {equipment.equipmentId} · Default Rental:{" "}
                <span className="font-semibold text-[#343630]">
                  {formatPrice(equipment.rentalPrice)}
                </span>{" "}
                · Qty: {equipment.quantityTotal}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close availability dialog"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Notices and Errors */}
            {error && (
              <p
                role="alert"
                className="mb-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3.5 py-2.5 text-sm text-[#9c4339]"
              >
                {error}
              </p>
            )}
            {notice && (
              <p className="mb-4 rounded-md border border-[#c6decb] bg-[#f1f7f2] px-3.5 py-2.5 text-sm text-[#2f603e]">
                {notice}
              </p>
            )}

            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e8e8e2] bg-[#fbfbf9] p-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-[#555750]">
                  Filter range:
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  aria-label="From date"
                  title="From date"
                  className="h-8 rounded-md border border-[#d8d8d1] bg-white px-2.5 text-xs text-[#343630] outline-none focus:border-[#39724b]"
                />
                <span className="text-xs text-[#777973]">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  aria-label="To date"
                  title="To date"
                  className="h-8 rounded-md border border-[#d8d8d1] bg-white px-2.5 text-xs text-[#343630] outline-none focus:border-[#39724b]"
                />
                {(fromDate || toDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                    }}
                    className="text-xs font-medium text-[#777973] underline hover:text-[#20221f]"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#777973]">
                  {availability.length} slot{availability.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => void loadAvailability()}
                  disabled={loading}
                  aria-label="Refresh availability list"
                  title="Refresh list"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d8d8d1] bg-white text-[#555750] hover:bg-[#f0f0ec] disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            {/* Slots Table */}
            <div className="max-h-60 overflow-y-auto rounded-lg border border-[#e0e0da]">
              <table className="w-full min-w-[500px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#f8f8f5] text-xs font-semibold uppercase tracking-wider text-[#777973]">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Time Range</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeea]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-[#777973]"
                      >
                        Loading availability slots…
                      </td>
                    </tr>
                  ) : availability.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-[#777973]"
                      >
                        No availability slots defined for this equipment. Add a
                        single slot or use Bulk generate below.
                      </td>
                    </tr>
                  ) : (
                    availability.map((slot) => (
                      <tr
                        key={slot.availabilityId}
                        className={`transition-colors hover:bg-[#fcfcfa] ${
                          editingAvailabilityId === slot.availabilityId
                            ? "bg-[#f1f7f2]"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2.5 text-sm font-medium text-[#20221f]">
                          {slot.availableDate}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-sm text-[#454741]">
                          <span className="inline-flex items-center gap-1 font-mono text-xs">
                            <Clock size={12} className="text-[#777973]" />
                            {displayTime(slot.startTime)} –{" "}
                            {displayTime(slot.endTime)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone(
                              slot.status,
                            )}`}
                          >
                            {slot.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-sm font-medium text-[#343630]">
                          {formatPrice(slot.price)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditClick(slot)}
                              title="Edit slot"
                              aria-label="Edit slot"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteSlot(slot)}
                              title="Delete slot"
                              aria-label="Delete slot"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Management Form: Single Slot vs Bulk Generate */}
            <div className="mt-5 rounded-lg border border-[#e0e0da] bg-[#fafaf8] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#e8e8e2] pb-3">
                <div className="inline-flex rounded-md border border-[#d8d8d1] bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode("single");
                      setError("");
                    }}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                      formMode === "single"
                        ? "bg-[#39724b] text-white"
                        : "text-[#555750] hover:bg-[#f0f0ec]"
                    }`}
                  >
                    {editingAvailabilityId ? "Edit slot" : "Single slot"}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(editingAvailabilityId)}
                    onClick={() => {
                      setFormMode("bulk");
                      setError("");
                    }}
                    className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      formMode === "bulk"
                        ? "bg-[#39724b] text-white"
                        : "text-[#555750] hover:bg-[#f0f0ec]"
                    }`}
                  >
                    <Layers size={13} />
                    Bulk generate
                  </button>
                </div>

                <span className="text-xs text-[#777973]">
                  {formMode === "single"
                    ? editingAvailabilityId
                      ? "Editing existing slot"
                      : "Add a single date & time slot"
                    : "Generate multiple availability slots automatically"}
                </span>
              </div>

              {formMode === "single" ? (
                /* Single Slot Form */
                <form
                  onSubmit={handleSaveSingle}
                  className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5"
                >
                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    Available Date
                    <input
                      type="date"
                      required
                      value={form.availableDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          availableDate: e.target.value,
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    Start Time
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    End Time
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    Status
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className={fieldClassName}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </label>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    Price (VND)
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          price: Number(e.target.value),
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-5">
                    {editingAvailabilityId && (
                      <button
                        type="button"
                        onClick={resetSingleForm}
                        className="h-9 rounded-md border border-[#d8d8d1] px-3.5 text-sm font-medium text-[#555750] hover:bg-white"
                      >
                        Cancel edit
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60"
                    >
                      {saving
                        ? "Saving…"
                        : editingAvailabilityId
                        ? "Update slot"
                        : "Add slot"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Bulk Generate Form (Synced with Room Availability) */
                <form
                  onSubmit={handleBulkGenerate}
                  className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#d8e6dc] bg-[#f1f7f2] px-3 py-2 text-xs text-[#2f603e] sm:col-span-2 lg:col-span-4">
                    <span>
                      Bulk generation syncs directly with availability slots of{" "}
                      <strong>{spaceName ?? equipment.spaceId}</strong>.
                    </span>
                    <button
                      type="button"
                      onClick={() => void loadSpaceAvailability()}
                      disabled={loadingSpaceAvailability}
                      className="inline-flex items-center gap-1 font-semibold underline hover:text-[#20221f] disabled:opacity-50"
                    >
                      <RefreshCw
                        size={12}
                        className={loadingSpaceAvailability ? "animate-spin" : ""}
                      />
                      Refresh room slots
                    </button>
                  </div>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    From Date (Optional)
                    <input
                      type="date"
                      value={bulkConfig.startDate}
                      onChange={(e) =>
                        setBulkConfig((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                          endDate:
                            prev.endDate && e.target.value && prev.endDate < e.target.value
                              ? e.target.value
                              : prev.endDate,
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    To Date (Optional)
                    <input
                      type="date"
                      value={bulkConfig.endDate}
                      min={bulkConfig.startDate || undefined}
                      onChange={(e) =>
                        setBulkConfig((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    Equipment Price (VND)
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      value={bulkConfig.price}
                      onChange={(e) =>
                        setBulkConfig((prev) => ({
                          ...prev,
                          price: Number(e.target.value),
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750]">
                    Equipment Status
                    <select
                      value={bulkConfig.status}
                      onChange={(e) =>
                        setBulkConfig((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className={fieldClassName}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </label>

                  <div className="flex flex-wrap items-center gap-5 sm:col-span-2 lg:col-span-4">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#555750]">
                      <input
                        type="checkbox"
                        checked={bulkConfig.onlyAvailableSpaceSlots}
                        onChange={(e) =>
                          setBulkConfig((prev) => ({
                            ...prev,
                            onlyAvailableSpaceSlots: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-[#d8d8d1] text-[#39724b] focus:ring-[#39724b]"
                      />
                      Only include AVAILABLE room slots
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#555750]">
                      <input
                        type="checkbox"
                        checked={bulkConfig.skipExistingSlots}
                        onChange={(e) =>
                          setBulkConfig((prev) => ({
                            ...prev,
                            skipExistingSlots: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-[#d8d8d1] text-[#39724b] focus:ring-[#39724b]"
                      />
                      Skip slots already added to equipment
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e8e2] pt-3 sm:col-span-2 lg:col-span-4">
                    <div className="text-xs text-[#686a64]">
                      {loadingSpaceAvailability ? (
                        <span>Loading room availability…</span>
                      ) : bulkPreview.error ? (
                        <span className="text-[#a34d42]">
                          {bulkPreview.error}
                        </span>
                      ) : bulkPreview.matchedSpaceSlotsCount === 0 ? (
                        <span className="text-[#93651e]">
                          No matching room availability slots found in this range.
                        </span>
                      ) : (
                        <span>
                          Found{" "}
                          <strong className="text-[#20221f]">
                            {bulkPreview.matchedSpaceSlotsCount}
                          </strong>{" "}
                          room slot{bulkPreview.matchedSpaceSlotsCount === 1 ? "" : "s"} · Will add{" "}
                          <strong className="text-[#39724b]">
                            {bulkPreview.slots.length}
                          </strong>{" "}
                          slot{bulkPreview.slots.length === 1 ? "" : "s"}
                          {bulkPreview.skippedCount > 0 && (
                            <span className="text-[#777973]">
                              {" "}
                              ({bulkPreview.skippedCount} already exist)
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        loadingSpaceAvailability ||
                        Boolean(bulkPreview.error) ||
                        bulkPreview.slots.length === 0
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60"
                    >
                      {saving && bulkProgress
                        ? `Generating ${bulkProgress.current}/${bulkProgress.total}…`
                        : `Add ${bulkPreview.slots.length} slot${bulkPreview.slots.length === 1 ? "" : "s"}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-[#eeeeea] px-6 py-3.5">
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

      {/* Delete Confirmation Dialog */}
      {pendingDeleteSlot && (
        <ConfirmDeleteDialog
          title="Delete availability slot?"
          description={`Are you sure you want to delete the slot on ${pendingDeleteSlot.availableDate} (${displayTime(
            pendingDeleteSlot.startTime,
          )} – ${displayTime(pendingDeleteSlot.endTime)})?`}
          confirming={deletingSlot}
          error={error || undefined}
          onCancel={() => {
            if (!deletingSlot) {
              setPendingDeleteSlot(null);
            }
          }}
          onConfirm={() => void handleDeleteSlot()}
        />
      )}
    </>
  );
}
