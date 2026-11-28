"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { Pencil, Trash2, Upload, X } from "lucide-react";
import {
    addMyProviderSpaceImage,
    createMyProviderSpaceAvailability,
    deleteMyProviderSpaceAvailability,
    deleteMyProviderSpaceImage,
    listMyProviderSpaceAvailability,
    updateMyProviderSpaceAvailability,
} from "../api";
import { uploadProviderSpaceImage } from "../api/uploadImage";
import { providerSpaceImageUrl } from "../imageUrl";
import type {
    ProviderSpace,
    ProviderSpaceAvailability,
    ProviderSpaceAvailabilityRequest,
    ProviderSpaceDetails,
} from "../types";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";

type PendingDeletion = { kind: "image" | "availability"; id: string; description: string };
type AvailabilityFormMode = "single" | "bulk";

type BulkAvailabilityConfig = {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    slotsPerDay: number;
    breakMinutes: number;
    roundToMinutes: number;
    status: ProviderSpaceAvailabilityRequest["status"];
    skipNonOperatingDays: boolean;
    skipExistingSlots: boolean;
};

const fieldClassName =
    "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

const blankAvailability: ProviderSpaceAvailabilityRequest = {
    availableDate: "",
    startTime: "09:00",
    endTime: "17:00",
    status: "AVAILABLE",
    price: null,
};

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

function displayTime(value: string) {
    return value.slice(0, 5);
}

function parseTimeToMinutes(hhmm: string): number | null {
    const [h, m] = hhmm.split(":").map(Number);
    if ([h, m].some(Number.isNaN)) return null;
    return h * 60 + m;
}

function minutesToHHMM(totalMinutes: number): string {
    const clamped = Math.max(0, Math.min(24 * 60, totalMinutes));
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calculateSlotPrice(startTime: string, endTime: string, hourlyRate?: number | null): number | null {
    if (hourlyRate == null || !startTime || !endTime) return null;

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    if (startMinutes == null || endMinutes == null) return null;

    const durationMinutes = endMinutes - startMinutes;
    if (durationMinutes <= 0) return null;

    return Math.round((durationMinutes / 60) * hourlyRate);
}

function parseOperatingHoursHint(raw?: ProviderSpaceDetails["operatingHours"]): {
    startTime?: string;
    endTime?: string;
    allowedDays?: Set<number>;
} {
    if (!raw) return {};
    const text =
        typeof raw === "string"
            ? raw.trim()
            : Object.entries(raw)
                  .filter(([, time]) => Boolean(time))
                  .map(([day, time]) => `${day}: ${time}`)
                  .join(" | ");

    if (!text) return {};

    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*h?\s*[-–to]+\s*(\d{1,2})(?::(\d{2}))?\s*h?/i);
    let startTime: string | undefined;
    let endTime: string | undefined;
    if (timeMatch) {
        const sh = Number(timeMatch[1]);
        const sm = Number(timeMatch[2] ?? 0);
        const eh = Number(timeMatch[3]);
        const em = Number(timeMatch[4] ?? 0);
        if (sh < 24 && sm < 60 && eh <= 24 && em < 60) {
            startTime = `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
            endTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
        }
    }

    const dayMap: Record<string, number> = {
        sun: 0,
        mon: 1,
        tue: 2,
        wed: 3,
        thu: 4,
        fri: 5,
        sat: 6,
    };
    let allowedDays: Set<number> | undefined;
    const rangeMatch = text.match(/\b(mon|tue|wed|thu|fri|sat|sun)\s*[-–]\s*(mon|tue|wed|thu|fri|sat|sun)\b/i);
    if (rangeMatch) {
        const startDay = dayMap[rangeMatch[1].toLowerCase()];
        const endDay = dayMap[rangeMatch[2].toLowerCase()];
        if (startDay !== undefined && endDay !== undefined) {
            allowedDays = new Set<number>();
            let cur = startDay;
            while (true) {
                allowedDays.add(cur);
                if (cur === endDay) break;
                cur = (cur + 1) % 7;
            }
        }
    }

    return { startTime, endTime, allowedDays };
}

function buildBulkAvailabilitySlots(
    config: BulkAvailabilityConfig,
    hourlyRate: number | null | undefined,
    allowedDays: Set<number> | undefined,
    existingSlotKeys: Set<string>,
): {
    slots: ProviderSpaceAvailabilityRequest[];
    dailyTemplate: Array<{ startTime: string; endTime: string }>;
    matchedDaysCount: number;
    skippedDuplicatesCount: number;
    slotMinutes: number;
    slotPrice: number | null;
    error?: string;
} {
    const emptyResult = {
        slots: [],
        dailyTemplate: [],
        matchedDaysCount: 0,
        skippedDuplicatesCount: 0,
        slotMinutes: 0,
        slotPrice: null,
    };

    if (!config.startDate || !config.endDate) {
        return { ...emptyResult, error: "Please select both start date and end date." };
    }
    if (config.endDate < config.startDate) {
        return { ...emptyResult, error: "End date must be on or after start date." };
    }
    if (!Number.isInteger(config.slotsPerDay) || config.slotsPerDay < 1) {
        return { ...emptyResult, error: "Slots per day must be at least 1." };
    }
    if (config.breakMinutes < 0 || Number.isNaN(config.breakMinutes)) {
        return { ...emptyResult, error: "Break duration cannot be negative." };
    }

    const dayStart = parseTimeToMinutes(config.startTime);
    const dayEnd = parseTimeToMinutes(config.endTime);
    if (dayStart == null || dayEnd == null || dayEnd <= dayStart) {
        return { ...emptyResult, error: "End time must be later than start time." };
    }

    const totalBreak = (config.slotsPerDay - 1) * config.breakMinutes;
    const usableMinutes = dayEnd - dayStart - totalBreak;
    if (usableMinutes <= 0) {
        return { ...emptyResult, error: "Operating hours are too short for the requested slots and break duration." };
    }

    let slotMinutes = Math.floor(usableMinutes / config.slotsPerDay);
    if (config.roundToMinutes > 0) {
        slotMinutes = Math.floor(slotMinutes / config.roundToMinutes) * config.roundToMinutes;
    }
    if (slotMinutes <= 0) {
        return { ...emptyResult, error: "Calculated slot duration is 0 minutes. Reduce slots per day or break time." };
    }

    const slotPrice = hourlyRate == null ? null : Math.round((slotMinutes / 60) * hourlyRate);

    const dailyTemplate: Array<{ startTime: string; endTime: string }> = [];
    for (let i = 0; i < config.slotsPerDay; i++) {
        const slotStartMin = dayStart + i * (slotMinutes + config.breakMinutes);
        const slotEndMin = slotStartMin + slotMinutes;
        if (slotEndMin > dayEnd) break;
        dailyTemplate.push({
            startTime: minutesToHHMM(slotStartMin),
            endTime: minutesToHHMM(slotEndMin),
        });
    }

    const slots: ProviderSpaceAvailabilityRequest[] = [];
    let matchedDaysCount = 0;
    let skippedDuplicatesCount = 0;

    const curDate = new Date(`${config.startDate}T00:00:00`);
    const lastDate = new Date(`${config.endDate}T00:00:00`);

    while (curDate <= lastDate) {
        const dayOfWeek = curDate.getDay();
        const isOperatingDay = !config.skipNonOperatingDays || !allowedDays || allowedDays.has(dayOfWeek);

        if (isOperatingDay) {
            matchedDaysCount += 1;
            const yyyy = curDate.getFullYear();
            const mm = String(curDate.getMonth() + 1).padStart(2, "0");
            const dd = String(curDate.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;

            for (const template of dailyTemplate) {
                const key = `${dateStr}|${template.startTime}|${template.endTime}`;
                if (config.skipExistingSlots && existingSlotKeys.has(key)) {
                    skippedDuplicatesCount += 1;
                    continue;
                }
                slots.push({
                    availableDate: dateStr,
                    startTime: template.startTime,
                    endTime: template.endTime,
                    status: config.status,
                    price: slotPrice,
                });
            }
        }

        curDate.setDate(curDate.getDate() + 1);
    }

    if (matchedDaysCount === 0) {
        return { ...emptyResult, error: "No operating days match the selected date range." };
    }

    return {
        slots,
        dailyTemplate,
        matchedDaysCount,
        skippedDuplicatesCount,
        slotMinutes,
        slotPrice,
    };
}

function humanizeKey(key: string): string {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

function formatAmenities(amenities?: unknown): string | null {
    if (!amenities) return null;
    if (Array.isArray(amenities)) {
        const items = amenities.map(String).map((s) => s.trim()).filter(Boolean);
        return items.length ? items.join(", ") : null;
    }
    if (typeof amenities === "string") {
        const trimmed = amenities.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            try {
                return formatAmenities(JSON.parse(trimmed));
            } catch {
                return trimmed;
            }
        }
        return trimmed || null;
    }
    if (typeof amenities === "object") {
        const items: string[] = [];
        for (const [key, value] of Object.entries(amenities as Record<string, unknown>)) {
            const label = humanizeKey(key);
            if (value === true) {
                items.push(label);
            } else if (value === false || value == null) {
                continue;
            } else if (Array.isArray(value)) {
                const sub = value.map(String).map((s) => s.trim()).filter(Boolean).join(", ");
                items.push(sub ? `${label}: ${sub}` : label);
            } else if (typeof value === "object") {
                const nested = formatAmenities(value);
                if (nested) items.push(`${label}: ${nested}`);
            } else {
                items.push(`${label}: ${String(value)}`);
            }
        }
        return items.length ? items.join(", ") : null;
    }
    return String(amenities);
}

function formatOperatingHours(hours?: unknown): string | null {
    if (!hours) return null;
    if (typeof hours === "string") {
        const trimmed = hours.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                return formatOperatingHours(JSON.parse(trimmed));
            } catch {
                return trimmed;
            }
        }
        return trimmed || null;
    }
    if (typeof hours === "object") {
        const items: string[] = [];
        for (const [day, time] of Object.entries(hours as Record<string, unknown>)) {
            if (!time) continue;
            const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
            if (typeof time === "string" || typeof time === "number") {
                items.push(`${dayLabel}: ${time}`);
            } else if (typeof time === "object") {
                items.push(`${dayLabel}: ${JSON.stringify(time)}`);
            }
        }
        return items.length ? items.join(" | ") : null;
    }
    return String(hours);
}

export function ProviderSpaceDetailsDialog({
    space,
    onClose,
    onEdit,
    onDelete,
    onRefresh,
    onUpdated,
}: {
    space: ProviderSpace;
    onClose: () => void;
    onEdit: (space: ProviderSpace) => void;
    onDelete: (space: ProviderSpace) => void;
    onRefresh: (spaceId: string) => Promise<void>;
    onUpdated: () => Promise<void>;
}) {
    const operatingHint = useMemo(
        () => parseOperatingHoursHint(space.details?.operatingHours),
        [space.details?.operatingHours],
    );

    const [availability, setAvailability] = useState<ProviderSpaceAvailability[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);
    const [availabilityError, setAvailabilityError] = useState("");
    const [availabilityNotice, setAvailabilityNotice] = useState("");
    const [formMode, setFormMode] = useState<AvailabilityFormMode>("single");

    const [form, setForm] = useState<ProviderSpaceAvailabilityRequest>(() => {
        const startTime = operatingHint.startTime ?? blankAvailability.startTime;
        const endTime = operatingHint.endTime ?? blankAvailability.endTime;
        return {
            ...blankAvailability,
            startTime,
            endTime,
            price: calculateSlotPrice(startTime, endTime, space.hourlyRate),
        };
    });

    const [bulkConfig, setBulkConfig] = useState<BulkAvailabilityConfig>(() => ({
        startDate: "",
        endDate: "",
        startTime: operatingHint.startTime ?? "09:00",
        endTime: operatingHint.endTime ?? "17:00",
        slotsPerDay: 2,
        breakMinutes: 30,
        roundToMinutes: 15,
        status: "AVAILABLE",
        skipNonOperatingDays: true,
        skipExistingSlots: true,
    }));

    const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
    const [savingAvailability, setSavingAvailability] = useState(false);
    const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState("");
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        listMyProviderSpaceAvailability(space.spaceId)
            .then((items) => {
                if (!cancelled) {
                    setAvailability(items);
                    setAvailabilityError("");
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) setAvailabilityError(errorMessage(error));
            })
            .finally(() => {
                if (!cancelled) setAvailabilityLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [space.spaceId]);

    const [prevSyncKey, setPrevSyncKey] = useState(
        `${space.hourlyRate ?? ""}|${operatingHint.startTime ?? ""}|${operatingHint.endTime ?? ""}`,
    );
    const currentSyncKey = `${space.hourlyRate ?? ""}|${operatingHint.startTime ?? ""}|${operatingHint.endTime ?? ""}`;
    if (prevSyncKey !== currentSyncKey) {
        setPrevSyncKey(currentSyncKey);
        if (!editingAvailabilityId) {
            setForm((current) => ({
                ...current,
                price: calculateSlotPrice(current.startTime, current.endTime, space.hourlyRate),
            }));
        }
        setBulkConfig((current) => ({
            ...current,
            startTime: operatingHint.startTime ?? current.startTime,
            endTime: operatingHint.endTime ?? current.endTime,
        }));
    }

    const existingSlotKeys = useMemo(() => {
        const keys = new Set<string>();
        for (const item of availability) {
            keys.add(`${item.availableDate}|${displayTime(item.startTime)}|${displayTime(item.endTime)}`);
        }
        return keys;
    }, [availability]);

    const bulkPreview = useMemo(
        () => buildBulkAvailabilitySlots(bulkConfig, space.hourlyRate, operatingHint.allowedDays, existingSlotKeys),
        [bulkConfig, space.hourlyRate, operatingHint.allowedDays, existingSlotKeys],
    );

    function updateTimeRange(field: "startTime" | "endTime", value: string) {
        setForm((current) => {
            const next = { ...current, [field]: value };
            const autoPrice = calculateSlotPrice(next.startTime, next.endTime, space.hourlyRate);
            return {
                ...next,
                price: autoPrice ?? current.price,
            };
        });
    }

    async function reloadAvailability() {
        const items = await listMyProviderSpaceAvailability(space.spaceId);
        setAvailability(items);
    }

    async function handleUploadImage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!imageFile) return;
        setUploadingImage(true);
        setImageError("");
        try {
            await uploadProviderSpaceImage(space.spaceId, imageFile);
            setImageFile(null);
            if (imageInputRef.current) imageInputRef.current.value = "";
            await onRefresh(space.spaceId);
            await onUpdated();
        } catch (error) {
            setImageError(errorMessage(error));
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleAddImageUrl(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(imageUrl.trim());
        } catch {
            setImageError("Enter a valid HTTP or HTTPS image URL.");
            return;
        }
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            setImageError("Enter a valid HTTP or HTTPS image URL.");
            return;
        }
        setUploadingImage(true);
        setImageError("");
        try {
            await addMyProviderSpaceImage(space.spaceId, imageUrl.trim());
            setImageUrl("");
            try {
                await onRefresh(space.spaceId);
                await onUpdated();
            } catch {
                setImageError("The image was added, but the list could not be refreshed. Reopen this space to see it.");
            }
        } catch (error) {
            setImageError(errorMessage(error));
        } finally {
            setUploadingImage(false);
        }
    }

    function requestDeleteImage(imageId: string) {
        setDeleteError("");
        setPendingDeletion({
            kind: "image",
            id: imageId,
            description: `This image from “${space.name}” will be permanently deleted.`,
        });
    }

    function requestDeleteAvailability(item: ProviderSpaceAvailability) {
        setDeleteError("");
        setPendingDeletion({
            kind: "availability",
            id: item.availabilityId,
            description: `The availability on ${item.availableDate} will be permanently deleted.`,
        });
    }

    async function confirmDelete() {
        if (!pendingDeletion) return;
        setDeleting(true);
        setDeleteError("");
        try {
            if (pendingDeletion.kind === "image") {
                await deleteMyProviderSpaceImage(space.spaceId, pendingDeletion.id);
                await onRefresh(space.spaceId);
                await onUpdated();
            } else {
                await deleteMyProviderSpaceAvailability(space.spaceId, pendingDeletion.id);
                if (editingAvailabilityId === pendingDeletion.id) resetAvailabilityForm();
                await reloadAvailability();
            }
            setPendingDeletion(null);
        } catch (error) {
            setDeleteError(errorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    function editAvailability(item: ProviderSpaceAvailability) {
        setFormMode("single");
        setAvailabilityNotice("");
        setEditingAvailabilityId(item.availabilityId);
        const normalizedStatus = item.status.toUpperCase();
        setForm({
            availableDate: item.availableDate,
            startTime: displayTime(item.startTime),
            endTime: displayTime(item.endTime),
            status:
                normalizedStatus === "BLOCKED"
                    ? "BLOCKED"
                    : normalizedStatus === "CLOSED"
                      ? "CLOSED"
                      : "AVAILABLE",
            price: item.price,
        });
    }

    function resetAvailabilityForm() {
        const startTime = operatingHint.startTime ?? blankAvailability.startTime;
        const endTime = operatingHint.endTime ?? blankAvailability.endTime;
        setForm({
            ...blankAvailability,
            startTime,
            endTime,
            price: calculateSlotPrice(startTime, endTime, space.hourlyRate),
        });
        setEditingAvailabilityId(null);
    }

    async function handleSaveAvailability(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (form.startTime >= form.endTime) {
            setAvailabilityError("Start time must be earlier than end time.");
            return;
        }
        setSavingAvailability(true);
        setAvailabilityError("");
        setAvailabilityNotice("");
        try {
            if (editingAvailabilityId) {
                await updateMyProviderSpaceAvailability(space.spaceId, editingAvailabilityId, form);
            } else {
                await createMyProviderSpaceAvailability(space.spaceId, form);
            }
            resetAvailabilityForm();
            await reloadAvailability();
        } catch (error) {
            setAvailabilityError(errorMessage(error));
        } finally {
            setSavingAvailability(false);
        }
    }

    async function handleBulkGenerateAvailability(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (bulkPreview.error || bulkPreview.slots.length === 0) return;

        setSavingAvailability(true);
        setAvailabilityError("");
        setAvailabilityNotice("");
        setBulkProgress({ current: 0, total: bulkPreview.slots.length });

        let createdCount = 0;
        try {
            for (let i = 0; i < bulkPreview.slots.length; i++) {
                await createMyProviderSpaceAvailability(space.spaceId, bulkPreview.slots[i]);
                createdCount += 1;
                setBulkProgress({ current: createdCount, total: bulkPreview.slots.length });
            }
            await reloadAvailability();
            setAvailabilityNotice(`Generated ${createdCount} availability slot${createdCount > 1 ? "s" : ""}.`);
        } catch (error) {
            if (createdCount > 0) {
                await reloadAvailability();
            }
            setAvailabilityError(
                createdCount > 0
                    ? `Created ${createdCount}/${bulkPreview.slots.length} slots before stopping: ${errorMessage(error)}`
                    : errorMessage(error),
            );
        } finally {
            setSavingAvailability(false);
            setBulkProgress(null);
        }
    }

    const formattedHourlyRate =
        space.hourlyRate == null ? "Not set" : `${space.hourlyRate.toLocaleString("vi-VN")} VND/h`;
    const formattedOperatingHours = formatOperatingHours(space.details?.operatingHours);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171815]/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="space-detail-title"
                className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#e0e0da] bg-white p-5 shadow-xl sm:p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-[#777973]">{space.spaceId}</p>
                        <h2 id="space-detail-title" className="mt-1 text-xl font-semibold text-[#20221f]">
                            {space.name}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close space details"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-[#777973] hover:bg-[#f0f0ec]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
                    {[
                        ["Type", space.type],
                        ["Address", space.address],
                        ["Capacity", space.capacity == null ? "Not set" : `${space.capacity} people`],
                        ["Hourly rate", formattedHourlyRate],
                        ["Status", space.status],
                    ].map(([label, value]) => (
                        <div key={label} className="border-b border-[#eeeeea] py-3">
                            <dt className="text-xs text-[#777973]">{label}</dt>
                            <dd className="mt-1 wrap-break-word text-sm font-medium text-[#343630]">{value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-4">
                    <p className="text-sm font-semibold text-[#343630]">Description</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#686a64]">
                        {space.description || "No description"}
                    </p>
                </div>

                {space.details && (
                    <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
                        <dt className="text-sm font-semibold text-[#343630] sm:col-span-2">Space details</dt>
                        {[
                            [
                                "Dimensions",
                                [space.details.lengthM, space.details.widthM, space.details.heightM]
                                    .filter((value) => value != null)
                                    .join(" × ") +
                                    (space.details.lengthM != null || space.details.widthM != null || space.details.heightM != null ? " m" : ""),
                            ],
                            ["Artistic style", formatAmenities(space.details.artisticStyle)],
                            ["Supported processes", formatAmenities(space.details.supportedProcesses)],
                            ["Lighting", formatAmenities(space.details.lightingConditions)],
                            ["Ventilation", formatAmenities(space.details.ventilationDetails)],
                            ["Acoustics", formatAmenities(space.details.acousticDetails)],
                            ["Usage policies", formatAmenities(space.details.usagePolicies)],
                            ["Amenities", formatAmenities(space.details.amenities)],
                            ["Operating hours", formatOperatingHours(space.details.operatingHours)],
                        ]
                            .filter(([, value]) => Boolean(value && String(value).trim() && String(value).trim() !== "m"))
                            .map(([label, value]) => (
                                <div key={label} className="border-b border-[#eeeeea] py-2">
                                    <dt className="text-xs text-[#777973]">{label}</dt>
                                    <dd className="mt-1 whitespace-pre-wrap text-sm text-[#343630]">
                                        {String(value)}
                                    </dd>
                                </div>
                            ))}
                    </dl>
                )}

                <section className="mt-5 border-t border-[#eeeeea] pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#343630]">Images</h3>
                        <span className="text-xs text-[#777973]">{space.images.length} images</span>
                    </div>
                    {imageError && (
                        <p
                            role="alert"
                            className="mt-3 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]"
                        >
                            {imageError}
                        </p>
                    )}
                    {space.images.length ? (
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {space.images.map((image) => (
                                <div
                                    key={image.imageId}
                                    className="group relative aspect-4/3 overflow-hidden rounded-md bg-[#f0f0ec]"
                                >
                                    <img
                                        src={providerSpaceImageUrl(image.imageUrl)}
                                        alt={space.name}
                                        onError={(e) => {
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80";
                                        }}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => requestDeleteImage(image.imageId)}
                                        aria-label="Delete image"
                                        title="Delete image"
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-[#a34d42] shadow-sm hover:bg-white"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-[#777973]">No images have been added.</p>
                    )}
                    <form onSubmit={handleAddImageUrl} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="space-image-url" className="sr-only">Image URL</label>
                        <input id="space-image-url" type="url" required maxLength={1000} value={imageUrl}
                            onChange={(event) => setImageUrl(event.target.value)} placeholder="https://example.com/image.jpg"
                            className={`${fieldClassName} min-w-0 flex-1`} />
                        <button type="submit" disabled={uploadingImage || !imageUrl.trim()}
                            className="h-10 shrink-0 rounded-md border border-[#d8d8d1] px-4 text-sm font-semibold text-[#343630] hover:bg-[#f7f7f3] disabled:opacity-60">
                            Add image URL
                        </button>
                    </form>
                    <form onSubmit={handleUploadImage} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="space-image-file" className="sr-only">
                            Choose image from this device
                        </label>
                        <input
                            ref={imageInputRef}
                            id="space-image-file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required
                            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                            className="min-w-0 flex-1 rounded-md border border-[#d8d8d1] bg-white px-3 py-2 text-sm text-[#343630] file:mr-3 file:rounded file:border-0 file:bg-[#f0f0ec] file:px-3 file:py-1 file:text-sm file:font-medium"
                        />
                        <button
                            type="submit"
                            disabled={uploadingImage || !imageFile}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60"
                        >
                            <Upload size={15} />
                            {uploadingImage ? "Uploading…" : "Upload image"}
                        </button>
                    </form>
                    <p className="mt-2 text-xs text-[#777973]">JPG, PNG, or WebP. Maximum 10 MB.</p>
                </section>

                <section className="mt-5 border-t border-[#eeeeea] pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#343630]">Availability</h3>
                        <span className="text-xs text-[#777973]">{availability.length} time slots</span>
                    </div>

                    {availabilityError && (
                        <p
                            role="alert"
                            className="mt-3 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]"
                        >
                            {availabilityError}
                        </p>
                    )}

                    {availabilityNotice && (
                        <p className="mt-3 rounded-md border border-[#c6decb] bg-[#f1f7f2] px-3 py-2 text-sm text-[#2f603e]">
                            {availabilityNotice}
                        </p>
                    )}

                    {availabilityLoading ? (
                        <p className="py-6 text-center text-sm text-[#777973]">Loading availability…</p>
                    ) : (
                        <div className="mt-3 max-h-64 overflow-auto rounded-md border border-[#eeeeea]">
                            <table className="w-full min-w-140 text-left">
                                <thead className="sticky top-0 bg-[#f8f8f5] text-xs font-semibold uppercase text-[#777973]">
                                    <tr>
                                        <th className="px-3 py-2">Date</th>
                                        <th className="px-3 py-2">Time</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Price</th>
                                        <th className="px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eeeeea]">
                                    {availability.map((item) => (
                                        <tr key={item.availabilityId}>
                                            <td className="px-3 py-2.5 text-sm text-[#454741]">{item.availableDate}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-[#454741]">
                                                {displayTime(item.startTime)}–{displayTime(item.endTime)}
                                            </td>
                                            <td className="px-3 py-2.5 text-sm text-[#454741]">{item.status}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-[#454741]">
                                                {item.price == null
                                                    ? "—"
                                                    : `${item.price.toLocaleString("vi-VN")} VND`}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => editAvailability(item)}
                                                        aria-label="Edit availability"
                                                        title="Edit availability"
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#555750] hover:bg-[#f0f0ec]"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => requestDeleteAvailability(item)}
                                                        aria-label="Delete availability"
                                                        title="Delete availability"
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#a34d42] hover:bg-[#fbefed]"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {availability.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-3 py-7 text-center text-sm text-[#777973]">
                                                No availability defined.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-4 rounded-md border border-[#e0e0da] bg-[#fafaf8] p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#e8e8e2] pb-3">
                            <div className="inline-flex rounded-md border border-[#d8d8d1] bg-white p-0.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormMode("single");
                                        setAvailabilityError("");
                                    }}
                                    className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        formMode === "single"
                                            ? "bg-[#39724b] text-white"
                                            : "text-[#555750] hover:bg-[#f0f0ec]"
                                    }`}
                                >
                                    {editingAvailabilityId ? "Edit single slot" : "Single slot"}
                                </button>
                                <button
                                    type="button"
                                    disabled={Boolean(editingAvailabilityId)}
                                    onClick={() => {
                                        setFormMode("bulk");
                                        setAvailabilityError("");
                                    }}
                                    className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                                        formMode === "bulk"
                                            ? "bg-[#39724b] text-white"
                                            : "text-[#555750] hover:bg-[#f0f0ec]"
                                    }`}
                                >
                                    Bulk generate
                                </button>
                            </div>

                            <p className="text-xs text-[#686a64]">
                                Operating hours:{" "}
                                <span className="font-medium text-[#343630]">
                                    {formattedOperatingHours || "Not specified"}
                                </span>{" "}
                                · Rate:{" "}
                                <span className="font-medium text-[#343630]">{formattedHourlyRate}</span>
                            </p>
                        </div>

                        {formMode === "single" ? (
                            <form onSubmit={handleSaveAvailability} className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Date
                                    <input
                                        type="date"
                                        required
                                        value={form.availableDate}
                                        onChange={(event) =>
                                            setForm((current) => ({ ...current, availableDate: event.target.value }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Start
                                    <input
                                        type="time"
                                        required
                                        value={form.startTime}
                                        onChange={(event) => updateTimeRange("startTime", event.target.value)}
                                        className={fieldClassName}
                                    />
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    End
                                    <input
                                        type="time"
                                        required
                                        value={form.endTime}
                                        onChange={(event) => updateTimeRange("endTime", event.target.value)}
                                        className={fieldClassName}
                                    />
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-3">
                                    Status
                                    <select
                                        value={form.status}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                status: event.target.value as ProviderSpaceAvailabilityRequest["status"],
                                            }))
                                        }
                                        className={fieldClassName}
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="BLOCKED">Blocked</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-3">
                                    Price (VND)
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 500000"
                                        value={form.price ?? ""}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                price: event.target.value === "" ? null : Number(event.target.value),
                                            }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>
                                <div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-6">
                                    <button
                                        type="submit"
                                        disabled={savingAvailability}
                                        className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60"
                                    >
                                        {savingAvailability
                                            ? "Saving…"
                                            : editingAvailabilityId
                                              ? "Update slot"
                                              : "Add availability"}
                                    </button>
                                    {editingAvailabilityId && (
                                        <button
                                            type="button"
                                            onClick={resetAvailabilityForm}
                                            className="h-9 rounded-md border border-[#d8d8d1] px-3 text-sm font-medium text-[#555750] hover:bg-white"
                                        >
                                            Cancel edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleBulkGenerateAvailability}
                                className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6"
                            >
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-3">
                                    Start date
                                    <input
                                        type="date"
                                        required
                                        value={bulkConfig.startDate}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({
                                                ...current,
                                                startDate: event.target.value,
                                                endDate:
                                                    !current.endDate || current.endDate < event.target.value
                                                        ? event.target.value
                                                        : current.endDate,
                                            }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-3">
                                    End date
                                    <input
                                        type="date"
                                        required
                                        min={bulkConfig.startDate || undefined}
                                        value={bulkConfig.endDate}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({ ...current, endDate: event.target.value }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>

                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Daily open time
                                    <input
                                        type="time"
                                        required
                                        value={bulkConfig.startTime}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({ ...current, startTime: event.target.value }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Daily close time
                                    <input
                                        type="time"
                                        required
                                        value={bulkConfig.endTime}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({ ...current, endTime: event.target.value }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Slots per day
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        required
                                        value={bulkConfig.slotsPerDay}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({
                                                ...current,
                                                slotsPerDay: Math.max(1, Number(event.target.value) || 1),
                                            }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>

                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Break between slots (min)
                                    <input
                                        type="number"
                                        min="0"
                                        step="5"
                                        required
                                        value={bulkConfig.breakMinutes}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({
                                                ...current,
                                                breakMinutes: Math.max(0, Number(event.target.value) || 0),
                                            }))
                                        }
                                        className={fieldClassName}
                                    />
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Round slot duration
                                    <select
                                        value={bulkConfig.roundToMinutes}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({
                                                ...current,
                                                roundToMinutes: Number(event.target.value),
                                            }))
                                        }
                                        className={fieldClassName}
                                    >
                                        <option value={0}>Exact minutes</option>
                                        <option value={15}>Multiple of 15 min</option>
                                        <option value={30}>Multiple of 30 min</option>
                                        <option value={60}>Full hours (60 min)</option>
                                    </select>
                                </label>
                                <label className="min-w-0 grid gap-1.5 text-xs font-medium text-[#555750] lg:col-span-2">
                                    Default status
                                    <select
                                        value={bulkConfig.status}
                                        onChange={(event) =>
                                            setBulkConfig((current) => ({
                                                ...current,
                                                status: event.target.value as ProviderSpaceAvailabilityRequest["status"],
                                            }))
                                        }
                                        className={fieldClassName}
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="BLOCKED">Blocked</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </label>

                                <div className="flex flex-wrap gap-4 text-xs text-[#454741] sm:col-span-2 lg:col-span-6">
                                    {operatingHint.allowedDays && (
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={bulkConfig.skipNonOperatingDays}
                                                onChange={(event) =>
                                                    setBulkConfig((current) => ({
                                                        ...current,
                                                        skipNonOperatingDays: event.target.checked,
                                                    }))
                                                }
                                                className="h-4 w-4 rounded border-[#d8d8d1] accent-[#39724b]"
                                            />
                                            Follow operating days ({formattedOperatingHours})
                                        </label>
                                    )}
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={bulkConfig.skipExistingSlots}
                                            onChange={(event) =>
                                                setBulkConfig((current) => ({
                                                    ...current,
                                                    skipExistingSlots: event.target.checked,
                                                }))
                                            }
                                            className="h-4 w-4 rounded border-[#d8d8d1] accent-[#39724b]"
                                        />
                                        Skip slots that already exist
                                    </label>
                                </div>

                                <div className="rounded-md border border-[#e0e0da] bg-white p-3 text-xs text-[#454741] sm:col-span-2 lg:col-span-6">
                                    {bulkPreview.error ? (
                                        <p className="text-[#9c4339]">{bulkPreview.error}</p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="font-semibold text-[#20221f]">
                                                    Preview: {bulkPreview.slots.length} new slot
                                                    {bulkPreview.slots.length === 1 ? "" : "s"} across{" "}
                                                    {bulkPreview.matchedDaysCount} day
                                                    {bulkPreview.matchedDaysCount === 1 ? "" : "s"}
                                                </span>
                                                <span className="text-[#686a64]">
                                                    {bulkPreview.slotMinutes} min/slot ·{" "}
                                                    {bulkPreview.slotPrice == null
                                                        ? "Price not set"
                                                        : `${bulkPreview.slotPrice.toLocaleString("vi-VN")} VND/slot`}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {bulkPreview.dailyTemplate.map((slot, index) => (
                                                    <span
                                                        key={index}
                                                        className="rounded bg-[#f0f0ec] px-2 py-0.5 font-mono text-[11px] text-[#343630]"
                                                    >
                                                        Slot {index + 1}: {slot.startTime}–{slot.endTime}
                                                    </span>
                                                ))}
                                            </div>
                                            {bulkPreview.skippedDuplicatesCount > 0 && (
                                                <p className="text-[#777973]">
                                                    ({bulkPreview.skippedDuplicatesCount} duplicate slot
                                                    {bulkPreview.skippedDuplicatesCount === 1 ? "" : "s"} skipped)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-6">
                                    <button
                                        type="submit"
                                        disabled={
                                            savingAvailability ||
                                            Boolean(bulkPreview.error) ||
                                            bulkPreview.slots.length === 0
                                        }
                                        className="h-9 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-60"
                                    >
                                        {savingAvailability && bulkProgress
                                            ? `Generating ${bulkProgress.current}/${bulkProgress.total}…`
                                            : `Generate ${bulkPreview.slots.length} slot${bulkPreview.slots.length === 1 ? "" : "s"}`}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </section>

                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#eeeeea] pt-4">
                    <button
                        type="button"
                        onClick={() => onDelete(space)}
                        className="mr-auto inline-flex h-9 items-center gap-2 rounded-md border border-[#e6c3bd] px-3 text-sm font-semibold text-[#a34d42] hover:bg-[#fbefed]"
                    >
                        <Trash2 size={15} />
                        Delete space
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(space)}
                        className="h-9 rounded-md border border-[#39724b] px-4 text-sm font-semibold text-[#39724b] hover:bg-[#f3f5ef]"
                    >
                        Edit space
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]"
                    >
                        Close
                    </button>
                </div>
            </section>

            {pendingDeletion && (
                <ConfirmDeleteDialog
                    title="Delete this item?"
                    description={pendingDeletion.description}
                    error={deleteError || undefined}
                    confirming={deleting}
                    onCancel={() => {
                        if (!deleting) setPendingDeletion(null);
                    }}
                    onConfirm={() => void confirmDelete()}
                />
            )}
        </div>
    );
}