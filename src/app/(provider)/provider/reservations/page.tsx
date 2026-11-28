"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import {
  cancelProviderBooking,
  checkInProviderBooking,
  checkInProviderBookingSegment,
  checkOutProviderBooking,
  checkOutProviderBookingSegment,
  getProviderBooking,
  listProviderBookingAllocations,
  listProviderBookings,
  reallocateProviderBookingSchedule,
} from "@/features/reservation/api";
import type {
  ProviderBooking,
  ProviderBookingAllocation,
  ProviderBookingCancellation,
} from "@/features/reservation";
import {
  listMyProviderSpaceAvailability,
  listMyProviderSpaces,
} from "@/features/provider-space/api";
import type { ProviderSpaceAvailability } from "@/features/provider-space";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";

type ReallocationSlotOption = ProviderSpaceAvailability & {
  spaceName: string;
  spaceType: string;
};

function slotCoversAllocation(slot: ProviderSpaceAvailability, alloc: ProviderBookingAllocation) {
  const startDate = new Date(alloc.startAt);
  const endDate = new Date(alloc.endAt);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return true;
  const allocDate = alloc.startAt.slice(0, 10);
  if (slot.availableDate !== allocDate) return false;
  const slotStart = new Date(`${slot.availableDate}T${slot.startTime.slice(0, 8)}Z`).getTime();
  const slotEnd = new Date(`${slot.availableDate}T${slot.endTime.slice(0, 8)}Z`).getTime();
  return slotStart <= startDate.getTime() && slotEnd >= endDate.getTime();
}

const pageSize = 20;
const fieldClassName =
  "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function statusClass(status: string) {
  if (["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(status.toUpperCase())) return "bg-[#e5f0e8] text-[#39724b]";
  if (status.toUpperCase() === "AWAITING_DEPOSIT") return "bg-[#f8edd9] text-[#93651e]";
  return "bg-[#f5e4e1] text-[#a34d42]";
}

function statusLabel(status: string) {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function displayTime(value: string) {
  return value.slice(0, 5);
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? (error.response ? "The request failed. Please try again." : "Cannot reach the backend. Check that the API is running.");
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function exportReservations(rows: ProviderBooking[]) {
  const header = [
    "Booking ID",
    "Start time",
    "End time",
    "Total amount",
    "Status",
    "Created at",
  ];
  const csv = [
    header,
    ...rows.map((item) => [
      item.bookingId,
      `${item.bookingDate} ${displayTime(item.startTime)}`,
      `${item.bookingDate} ${displayTime(item.endTime)}`,
      item.totalAmount,
      statusLabel(item.status),
      formatCreatedAt(item.createdAt),
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
  link.download = "reservations.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReservationsPage() {
  const { messages } = useProviderLanguage();
  const res = messages.reservations;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [reservations, setReservations] = useState<ProviderBooking[]>([]);
  const [totalReservations, setTotalReservations] = useState(0);
  const [allReservationsCount, setAllReservationsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [actionNeedsRefresh, setActionNeedsRefresh] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [cancellation, setCancellation] = useState<ProviderBookingCancellation | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ProviderBooking | null>(null);
  const [allocations, setAllocations] = useState<ProviderBookingAllocation[]>([]);
  const [spaceSlots, setSpaceSlots] = useState<ReallocationSlotOption[]>([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const [reallocatingId, setReallocatingId] = useState<string | null>(null);
  const [selectedSlotBySchedule, setSelectedSlotBySchedule] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listProviderBookings({ status: status || undefined, page, pageSize }),
      status
        ? listProviderBookings({ page: 1, pageSize: 1 })
        : Promise.resolve(null),
      listProviderBookings({ status: "AWAITING_DEPOSIT", page: 1, pageSize: 1 }),
      listProviderBookings({ status: "CONFIRMED", page: 1, pageSize: 1 }),
    ]).then(([queue, allQueue, pending, confirmed]) => {
      if (cancelled) return;
      setReservations(queue.items);
      setTotalReservations(queue.totalItems);
      setAllReservationsCount(allQueue ? allQueue.totalItems : queue.totalItems);
      setPendingCount(pending.totalItems);
      setConfirmedCount(confirmed.totalItems);
      setError("");
    }).catch((requestError: unknown) => {
      if (!cancelled) setError(errorMessage(requestError));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [page, reloadKey, status]);

  async function loadReallocationOptions(bookingDate: string): Promise<ReallocationSlotOption[]> {
    const spacesResult = await listMyProviderSpaces({ status: "ACTIVE", page: 1, pageSize: 100 });
    const activeSpaces = spacesResult.items ?? [];
    const results = await Promise.allSettled(
      activeSpaces.map(async (space) => {
        const slots = await listMyProviderSpaceAvailability(space.spaceId, {
          fromDate: bookingDate,
          toDate: bookingDate,
        });
        return slots.map((slot) => ({
          ...slot,
          spaceName: space.name,
          spaceType: space.type.toUpperCase(),
        }));
      }),
    );
    const merged: ReallocationSlotOption[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") merged.push(...r.value);
    }
    return merged;
  }

  async function openReservation(bookingId: string) {
    setError("");
    setDecisionError("");
    setActionMessage("");
    setCancellation(null);
    setActionNeedsRefresh(false);
    setAllocations([]);
    setSpaceSlots([]);
    setSelectedSlotBySchedule({});
    setAllocationsLoading(true);
    try {
      const [booking, allocs] = await Promise.all([
        getProviderBooking(bookingId),
        listProviderBookingAllocations(bookingId),
      ]);
      setSelectedReservation(booking);
      setAllocations(allocs);
      if (booking.status.toUpperCase() === "CONFIRMED") {
        try {
          const slots = await loadReallocationOptions(booking.bookingDate);
          setSpaceSlots(slots);
        } catch (requestError) {
          setDecisionError(`Could not load availability for reallocation: ${errorMessage(requestError)}`);
        }
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setAllocationsLoading(false);
    }
  }

  async function handleReallocate(scheduleId: string) {
    if (!selectedReservation) return;
    const availabilityId = selectedSlotBySchedule[scheduleId];
    if (!availabilityId) return;
    setReallocatingId(scheduleId);
    setDecisionError("");
    setActionMessage("");
    try {
      const updatedBooking = await reallocateProviderBookingSchedule(
        selectedReservation.bookingId,
        scheduleId,
        availabilityId,
      );
      setSelectedReservation(updatedBooking);
      setSelectedSlotBySchedule((cur) => ({ ...cur, [scheduleId]: "" }));
      const [refreshedAllocs, refreshedSlots] = await Promise.all([
        listProviderBookingAllocations(selectedReservation.bookingId),
        loadReallocationOptions(updatedBooking.bookingDate),
      ]);
      setAllocations(refreshedAllocs);
      setSpaceSlots(refreshedSlots);
      setActionMessage("Schedule reallocated successfully.");
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setDecisionError(errorMessage(requestError));
    } finally {
      setReallocatingId(null);
    }
  }

  async function handleBookingAction(action: "check-in" | "check-out" | "cancel", scheduleId?: string) {
    if (!selectedReservation) return;
    const confirmation = action === "cancel" ? res.confirmCancel : action === "check-in" ? res.confirmCheckIn : res.confirmCheckOut;
    if (!window.confirm(confirmation)) return;
    const bookingId = selectedReservation.bookingId;
    setSavingAction(true);
    setDecisionError("");
    setActionMessage("");
    try {
      if (action === "cancel") {
        setCancellation(await cancelProviderBooking(bookingId));
      } else if (action === "check-in") {
        if (scheduleId) await checkInProviderBookingSegment(bookingId, scheduleId);
        else await checkInProviderBooking(bookingId);
      } else {
        if (scheduleId) await checkOutProviderBookingSegment(bookingId, scheduleId);
        else await checkOutProviderBooking(bookingId);
      }
      setActionMessage(res.actionSucceeded);
      setActionNeedsRefresh(true);
      setReloadKey((key) => key + 1);
      try {
        const [booking, refreshedAllocs] = await Promise.all([
          getProviderBooking(bookingId),
          listProviderBookingAllocations(bookingId),
        ]);
        setSelectedReservation(booking);
        setAllocations(refreshedAllocs);
        setActionNeedsRefresh(false);
      } catch {
        setDecisionError(res.refreshFailed);
      }
    } catch (requestError) {
      setDecisionError(errorMessage(requestError));
    } finally {
      setSavingAction(false);
    }
  }

  const filteredReservations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return reservations;
    return reservations.filter((reservation) =>
      `${reservation.bookingId} ${reservation.photographerName} ${reservation.packageName ?? ""} ${reservation.spaceName}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, reservations]);

  function handleStatusChange(value: string) {
    setLoading(true);
    setPage(1);
    setStatus(value);
  }

  return (
    <div className="mx-auto max-w-375">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow={messages.common.providerWorkspace}
            title={res.title}
            description={res.description}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-2">
          <button
            type="button"
            onClick={() => exportReservations(filteredReservations)}
            className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">
            {messages.common.exportCsv}
          </button>
        </div>
      </div>

      <section
        aria-label="Reservation summary"
        className="-mt-2 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total reservations",
            value: allReservationsCount.toString(),
            helper: "Bookings in your provider account",
          },
          {
            label: "Awaiting deposit",
            value: pendingCount.toString(),
            helper: "Bookings awaiting deposit payment",
          },
          {
            label: "Confirmed bookings",
            value: confirmedCount.toString(),
            helper: "Bookings confirmed by the platform",
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

      {error && <p role="alert" className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-4 py-3 text-sm text-[#9c4339]">{error}</p>}

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8e8e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-[#20221f]">
              Reservation queue
            </h2>
            <p className="mt-1 text-sm text-[#777973]">
              Showing {filteredReservations.length} on this page of {totalReservations}{" "}
              reservations
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(180px,270px)_150px]">
            <label className="sr-only" htmlFor="reservation-search">
              Search reservations
            </label>
            <input
              id="reservation-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search booking, photographer or space..."
              className={fieldClassName}
            />
            <label className="sr-only" htmlFor="reservation-status">
              Filter by status
            </label>
            <select
              id="reservation-status"
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              className={fieldClassName}>
              <option value="">All statuses</option>
              <option value="AWAITING_DEPOSIT">Awaiting deposit</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
              <option value="NO_SHOW">No show</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-275 border-collapse text-left">
            <thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
              <tr>
                <th className="px-5 py-3">Booking</th>
                <th className="px-4 py-3">Photographer</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Space</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeea]">
              {loading && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#777973]">Loading reservations…</td></tr>}
              {!loading && filteredReservations.map((reservation) => (
                <tr
                  key={reservation.bookingId}
                  className="transition-colors hover:bg-[#fcfcfa]">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-[#292b27]">
                      {reservation.bookingId}
                    </p>
                    <p className="mt-0.5 text-xs text-[#777973]">
                      {formatCreatedAt(reservation.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-[#4c4e48]">
                      {reservation.photographerName}
                    </p>
                    {/* <p className="mt-0.5 text-xs text-[#777973]">
                      {reservation.photographerId}
                    </p> */}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {reservation.packageName || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {reservation.spaceName}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    <p>{reservation.bookingDate} · {displayTime(reservation.startTime)}</p>
                    <p className="mt-0.5">to {displayTime(reservation.endTime)}</p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-[#343630]">
                    {formatMoney(reservation.totalAmount)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(reservation.status)}`}>
                      {statusLabel(reservation.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => void openReservation(reservation.bookingId)}
                      className="text-sm font-semibold text-[#39724b] hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredReservations.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-[#777973]">
                    No reservations match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#e8e8e2] px-5 py-4"><Pagination currentPage={page} totalItems={totalReservations} itemsPerPage={pageSize} onPageChange={(nextPage) => { setLoading(true); setPage(nextPage); }} /></div>
      </section>

      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/35 p-4"
          onClick={() => { if (!savingAction) setSelectedReservation(null); }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-detail-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777973]">
                  {selectedReservation.bookingId}
                </p>
                <h2
                  id="reservation-detail-title"
                  className="mt-1 text-xl font-semibold text-[#20221f]">
                  {selectedReservation.photographerName}
                </h2>
              </div>
              <button
                type="button"
                disabled={savingAction}
                onClick={() => setSelectedReservation(null)}
                aria-label="Close reservation details"
                className="rounded-md px-2 py-1 text-lg text-[#777973] hover:bg-[#f0f0ec]">
                ×
              </button>
            </div>
            <dl className="mt-6 divide-y divide-[#eeeeea] text-sm">
              {[
                // ["Photographer ID", selectedReservation.photographerId],
                [
                  "Package",
                  selectedReservation.packageName || "—",
                ],
                [
                  "Space",
                  `${selectedReservation.spaceName}`,
                ],
                // ["Equipment ID", selectedReservation.equipmentId],
                ["Booking date", selectedReservation.bookingDate],
                ["Start time", displayTime(selectedReservation.startTime)],
                ["End time", displayTime(selectedReservation.endTime)],
                ["Total amount", formatMoney(selectedReservation.totalAmount)],
                ["Status", statusLabel(selectedReservation.status)],
                ["Session status", statusLabel(selectedReservation.sessionStatus || "NOT_STARTED")],
                ["Created at", formatCreatedAt(selectedReservation.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <dt className="text-[#777973]">{label}</dt>
                  <dd className="max-w-[65%] text-right font-medium text-[#343630]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {selectedReservation.equipment.length > 0 && <div className="mt-4"><h3 className="text-sm font-semibold text-[#343630]">Equipment</h3><ul className="mt-2 space-y-1 text-sm text-[#686a64]">{selectedReservation.equipment.map((item) => <li key={item.equipmentId}>{item.name} × {item.quantity}</li>)}</ul></div>}

            <div className="mt-5 border-t border-[#eeeeea] pt-4">
              <h3 className="text-sm font-semibold text-[#343630]">
                Resource Allocations ({allocations.length})
              </h3>
              {allocationsLoading ? (
                <p className="mt-2 text-xs text-[#777973]">Loading allocations…</p>
              ) : allocations.length === 0 ? (
                <p className="mt-2 text-xs text-[#777973]">
                  No resource schedule allocations recorded for this booking yet.
                </p>
              ) : (
                <ul className="mt-2.5 space-y-2.5">
                  {allocations.map((alloc) => {
                    const allocType = alloc.resourceType.toUpperCase();
                    const isSpaceResource = ["STUDIO", "DARKROOM"].includes(allocType);
                    const availableSlots = isSpaceResource
                      ? spaceSlots.filter(
                          (slot) =>
                            slot.status.toUpperCase() === "AVAILABLE" &&
                            slot.spaceType === allocType &&
                            slot.availabilityId !== alloc.availabilityId &&
                            slot.spaceId !== alloc.resourceId &&
                            slotCoversAllocation(slot, alloc),
                        )
                      : [];
                    return (
                      <li
                        key={alloc.scheduleId}
                        className="rounded-md border border-[#e0e0da] bg-[#f8f8f5] p-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="rounded bg-[#e5f0e8] px-1.5 py-0.5 font-semibold text-[#39724b]">
                              {alloc.resourceType}
                            </span>{" "}
                            <span className="font-semibold text-[#20221f]">
                              {alloc.resourceName}
                            </span>{" "}
                            <span className="text-[#686a64]">× {alloc.quantity}</span>
                          </div>
                          <span className="font-semibold text-[#343630]">
                            {statusLabel(alloc.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-[#686a64]">
                          {new Date(alloc.startAt).toLocaleString()} –{" "}
                          {new Date(alloc.endAt).toLocaleString()}
                        </p>
                        {(alloc.checkInAt || alloc.checkOutAt) && (
                          <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-[#39724b]">
                            {alloc.checkInAt && (
                              <span>Check-in: {formatCreatedAt(alloc.checkInAt)}</span>
                            )}
                            {alloc.checkOutAt && (
                              <span>Check-out: {formatCreatedAt(alloc.checkOutAt)}</span>
                            )}
                          </div>
                        )}
                        {isSpaceResource && selectedReservation.status.toUpperCase() === "CONFIRMED" && availableSlots.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <select
                              value={selectedSlotBySchedule[alloc.scheduleId] ?? ""}
                              onChange={(event) =>
                                setSelectedSlotBySchedule((cur) => ({
                                  ...cur,
                                  [alloc.scheduleId]: event.target.value,
                                }))
                              }
                              aria-label="Select availability slot to reallocate"
                              className="h-8 flex-1 rounded border border-[#d8d8d1] bg-white px-2 text-xs text-[#343630]">
                              <option value="">Select another {allocType.toLowerCase()} covering this time…</option>
                              {availableSlots.map((slot) => (
                                <option
                                  key={slot.availabilityId}
                                  value={slot.availabilityId}>
                                  {slot.spaceName} · {slot.availableDate} {displayTime(slot.startTime)}–
                                  {displayTime(slot.endTime)}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={
                                !selectedSlotBySchedule[alloc.scheduleId] ||
                                reallocatingId !== null || savingAction || actionNeedsRefresh
                              }
                              onClick={() => void handleReallocate(alloc.scheduleId)}
                              className="h-8 rounded bg-[#39724b] px-3 text-xs font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">
                              {reallocatingId === alloc.scheduleId
                                ? "Reallocating…"
                                : "Reallocate"}
                            </button>
                          </div>
                        )}
                        {alloc.canCheckInOut && (
                          <div className="mt-2 flex gap-2">
                            {alloc.status.toUpperCase() === "CONFIRMED" && !alloc.checkInAt &&
                              ["CONFIRMED", "IN_PROGRESS"].includes(selectedReservation.status.toUpperCase()) && (
                              <button type="button" disabled={savingAction || reallocatingId !== null || actionNeedsRefresh}
                                onClick={() => void handleBookingAction("check-in", allocations.filter((item) => item.canCheckInOut).length === 1 ? undefined : alloc.scheduleId)}
                                className="rounded bg-[#39724b] px-3 py-1.5 font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">
                                {res.checkIn}
                              </button>
                            )}
                            {alloc.status.toUpperCase() === "IN_PROGRESS" && alloc.checkInAt && !alloc.checkOutAt && (
                              <button type="button" disabled={savingAction || reallocatingId !== null || actionNeedsRefresh}
                                onClick={() => void handleBookingAction("check-out", allocations.filter((item) => item.canCheckInOut).length === 1 ? undefined : alloc.scheduleId)}
                                className="rounded bg-[#39724b] px-3 py-1.5 font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">
                                {res.checkOut}
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {actionMessage && <p role="status" className="mt-4 rounded-md border border-[#c6dfcc] bg-[#eef7ef] px-3 py-2 text-sm text-[#39724b]">{actionMessage}</p>}
            {cancellation && (
              <dl className="mt-3 space-y-1 text-sm text-[#343630]">
                <div className="flex justify-between gap-4"><dt>{res.refundStatus}</dt><dd>{cancellation.refundStatus || "—"}</dd></div>
                <div className="flex justify-between gap-4"><dt>{res.refundAmount}</dt><dd>{formatMoney(cancellation.refundAmount)}</dd></div>
                <div className="flex justify-between gap-4"><dt>{res.packageUseRestored}</dt><dd>{cancellation.packageUseRestored ? res.yes : res.no}</dd></div>
              </dl>
            )}
            {decisionError && <p role="alert" className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">{decisionError}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#eeeeea] pt-4">
              {["AWAITING_DEPOSIT", "CONFIRMED"].includes(selectedReservation.status.toUpperCase()) && selectedReservation.sessionStatus.toUpperCase() === "NOT_STARTED" && (
                <button type="button" disabled={savingAction || reallocatingId !== null || actionNeedsRefresh} onClick={() => void handleBookingAction("cancel")} className="h-9 rounded-md border border-[#e6c3bd] px-3 text-sm font-semibold text-[#a34d42] hover:bg-[#fbefed] disabled:opacity-50">{res.cancelBooking}</button>
              )}
              <button type="button" disabled={savingAction} onClick={() => { setSelectedReservation(null); setDecisionError(""); }} className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36] disabled:opacity-50">Close</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
