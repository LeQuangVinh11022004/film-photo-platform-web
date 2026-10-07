"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import type { Reservation } from "@/features/reservation";

type ReservationStatus = Reservation["status"];

type ReservationRow = Reservation & {
  photographerName: string;
  packageName: string;
  spaceName: string;
};

const reservations: ReservationRow[] = [
  {
    id: "BK-4001",
    photographerName: "Linh Nguyen",
    packageName: "Portrait Starter",
    spaceName: "North Light Studio",
    startTime: "2026-10-08 09:00",
    endTime: "2026-10-08 11:00",
    totalAmount: 1550000,
    status: "confirmed",
    createdAt: "2026-10-06 18:22",
  },
  {
    id: "BK-4002",
    photographerName: "Minh Tran",
    packageName: "Editorial Session",
    spaceName: "Cyclorama Room",
    startTime: "2026-10-09 13:00",
    endTime: "2026-10-09 17:00",
    totalAmount: 2300000,
    status: "pending",
    createdAt: "2026-10-06 20:05",
  },
  {
    id: "BK-4003",
    photographerName: "Anh Pham",
    packageName: "Product Campaign",
    spaceName: "Product Corner",
    startTime: "2026-10-10 08:30",
    endTime: "2026-10-10 11:30",
    totalAmount: 1850000,
    status: "confirmed",
    createdAt: "2026-1OTH-05 14:40",
  },
  {
    id: "BK-4004",
    photographerName: "Ha Le",
    packageName: "Portrait Starter",
    spaceName: "North Light Studio",
    startTime: "2026-10-11 14:00",
    endTime: "2026-10-11 16:00",
    totalAmount: 1550000,
    status: "cancelled",
    createdAt: "2026-10-08 10:15",
  },
  {
    id: "BK-4005",
    photographerName: "Quang Vo",
    packageName: "Editorial Session",
    spaceName: "Rooftop Set",
    startTime: "2026-10-12 15:00",
    endTime: "2026-10-12 19:00",
    totalAmount: 2950000,
    status: "pending",
    createdAt: "2026-10-09 14:30",
  },
];

const fieldClassName =
  "h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function statusClass(status: ReservationStatus) {
  if (status === "confirmed") return "bg-[#e5f0e8] text-[#39724b]";
  if (status === "pending") return "bg-[#f8edd9] text-[#93651e]";
  return "bg-[#f5e4e1] text-[#a34d42]";
}

function statusLabel(status: ReservationStatus) {
  if (status === "confirmed") return "Confirmed";
  if (status === "pending") return "Pending";
  return "Cancelled";
}

function formatMoney(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function exportReservations(rows: ReservationRow[]) {
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
      item.id,
      item.startTime,
      item.endTime,
      item.totalAmount,
      statusLabel(item.status),
      item.createdAt,
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
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationRow | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredReservations = reservations.filter((reservation) => {
    const matchesQuery =
      `${reservation.id} ${reservation.photographerName} ${reservation.packageName} ${reservation.spaceName}`
        .toLowerCase()
        .includes(normalizedQuery);
    return matchesQuery && (!status || reservation.status === status);
  });

  const pendingCount = reservations.filter(
    (item) => item.status === "pending",
  ).length;
  const confirmedCount = reservations.filter(
    (item) => item.status === "confirmed",
  ).length;
  const confirmedValue = reservations
    .filter((item) => item.status === "confirmed")
    .reduce((total, item) => total + item.totalAmount, 0);

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
            Sample data
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
            value: reservations.length.toString(),
            helper: "Bookings in your provider account",
          },
          {
            label: "Pending requests",
            value: pendingCount.toString(),
            helper: "Bookings waiting for review",
          },
          {
            label: "Confirmed value",
            value: formatMoney(confirmedValue),
            helper: `${confirmedCount} confirmed bookings`,
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
              Reservation queue
            </h2>
            <p className="mt-1 text-sm text-[#777973]">
              Showing {filteredReservations.length} of {reservations.length}{" "}
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
              onChange={(event) => setStatus(event.target.value)}
              className={fieldClassName}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
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
              {filteredReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="transition-colors hover:bg-[#fcfcfa]">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-[#292b27]">
                      {reservation.id}
                    </p>
                    <p className="mt-0.5 text-xs text-[#777973]">
                      {reservation.createdAt}
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
                    {reservation.packageName}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    {reservation.spaceName}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#686a64]">
                    <p>from {reservation.startTime}</p>
                    <p className="mt-0.5">to {reservation.endTime}</p>
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
                      onClick={() => setSelectedReservation(reservation)}
                      className="text-sm font-semibold text-[#39724b] hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
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
                  {selectedReservation.id}
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
                  `${selectedReservation.packageName}`,
                ],
                [
                  "Space",
                  `${selectedReservation.spaceName}`,
                ],
                // ["Equipment ID", selectedReservation.equipmentId],
                ["Start time", selectedReservation.startTime],
                ["End time", selectedReservation.endTime],
                ["Total amount", formatMoney(selectedReservation.totalAmount)],
                ["Status", statusLabel(selectedReservation.status)],
                ["Created at", selectedReservation.createdAt],
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
              Approve, reject, and status-change actions can be connected to the
              reservation API next.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
