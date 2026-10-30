"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { getProviderBooking, listProviderBookings, reviewProviderBooking } from "@/features/reservation/api";
import type { ProviderBooking, ProviderBookingDecision } from "@/features/reservation";

const pageSize = 20;
const fieldClassName =
  "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function statusClass(status: string) {
  if (["APPROVED", "CONFIRMED", "COMPLETED"].includes(status.toUpperCase())) return "bg-[#e5f0e8] text-[#39724b]";
  if (status.toUpperCase() === "PENDING") return "bg-[#f8edd9] text-[#93651e]";
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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [reservations, setReservations] = useState<ProviderBooking[]>([]);
  const [totalReservations, setTotalReservations] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [savingDecision, setSavingDecision] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ProviderBooking | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listProviderBookings({ status: status || undefined, page, pageSize }),
      listProviderBookings({ status: "PENDING", page: 1, pageSize: 1 }),
      listProviderBookings({ status: "APPROVED", page: 1, pageSize: 1 }),
    ]).then(([queue, pending, approved]) => {
      if (cancelled) return;
      setReservations(queue.items);
      setTotalReservations(queue.totalItems);
      setPendingCount(pending.totalItems);
      setApprovedCount(approved.totalItems);
      setError("");
    }).catch((requestError: unknown) => {
      if (!cancelled) setError(errorMessage(requestError));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [page, reloadKey, status]);

  async function openReservation(bookingId: string) {
    setError("");
    try {
      setSelectedReservation(await getProviderBooking(bookingId));
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }

  async function handleReview(decision: ProviderBookingDecision) {
    if (!selectedReservation) return;
    setSavingDecision(true);
    setDecisionError("");
    try {
      setSelectedReservation(await reviewProviderBooking(selectedReservation.bookingId, decision));
      setLoading(true);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setDecisionError(errorMessage(requestError));
    } finally {
      setSavingDecision(false);
    }
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredReservations = reservations.filter((reservation) => {
    const matchesQuery =
      `${reservation.bookingId} ${reservation.photographerName} ${reservation.packageName ?? ""} ${reservation.spaceName}`
        .toLowerCase()
        .includes(normalizedQuery);
    return matchesQuery;
  });

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
            eyebrow="Provider workspace"
            title="Reservations"
            description="Review booking requests and reservation details for your spaces and packages."
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-2">
          <span className="rounded-full border border-[#d8d8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#70716b]">
            Live API
          </span>
          <button
            type="button"
            onClick={() => exportReservations(filteredReservations)}
            className="h-9 rounded-md bg-[#20221f] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#393b36]">
            Export CSV
          </button>
        </div>
      </div>

      <section
        aria-label="Reservation summary"
        className="-mt-2 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total reservations",
            value: totalReservations.toString(),
            helper: "Bookings in your provider account",
          },
          {
            label: "Pending requests",
            value: pendingCount.toString(),
            helper: "Bookings waiting for review",
          },
          {
            label: "Approved bookings",
            value: approvedCount.toString(),
            helper: "Bookings accepted by your business",
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
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
          onClick={() => setSelectedReservation(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-detail-title"
            className="w-full max-w-xl rounded-lg border border-[#e0e0da] bg-white p-6 shadow-xl"
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
            {decisionError && <p role="alert" className="mt-4 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">{decisionError}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#eeeeea] pt-4">
              {selectedReservation.status.toUpperCase() === "PENDING" && <>
                <button type="button" disabled={savingDecision} onClick={() => void handleReview("REJECTED")} className="h-9 rounded-md border border-[#e6c3bd] px-3 text-sm font-semibold text-[#a34d42] hover:bg-[#fbefed] disabled:opacity-50">{savingDecision ? "Saving…" : "Reject"}</button>
                <button type="button" disabled={savingDecision} onClick={() => void handleReview("APPROVED")} className="h-9 rounded-md bg-[#39724b] px-3 text-sm font-semibold text-white hover:bg-[#2f603e] disabled:opacity-50">{savingDecision ? "Saving…" : "Approve"}</button>
              </>}
              <button type="button" onClick={() => { setSelectedReservation(null); setDecisionError(""); }} className="h-9 rounded-md bg-[#20221f] px-4 text-sm font-semibold text-white hover:bg-[#393b36]">Close</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
