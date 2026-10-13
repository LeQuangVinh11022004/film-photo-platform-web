
"use client";

import { useMemo, useState } from "react";
import { Download, Search, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/features/provider-transaction/types";

type Props = {
  transactions: Transaction[];
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const typeLabels: Record<TransactionType, string> = {
  payment: "Customer payment",
  platform_fee: "Platform fee",
  refund: "Refund",
  adjustment: "Adjustment",
  payout: "Payout",
};

const statusLabels: Record<TransactionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

function exportCsv(rows: Transaction[]) {
  const headers = [
    "Transaction ID",
    "Booking ID",
    "Customer",
    "Description",
    "Type",
    "Status",
    "Amount",
    "Platform fee",
    "Net amount",
    "Date",
    "Payment method",
  ];

  const escape = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const content = [
    headers,
    ...rows.map((row) => [
      row.id,
      row.bookingId,
      row.customerName,
      row.description,
      typeLabels[row.type],
      statusLabels[row.status],
      row.amount,
      row.fee,
      row.netAmount,
      row.createdAt,
      row.paymentMethod,
    ]),
  ]
    .map((line) => line.map(escape).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "provider-transactions.csv";
  anchor.click();

  URL.revokeObjectURL(url);
}

export function TransactionTable({ transactions }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          transaction.id,
          transaction.bookingId,
          transaction.customerName,
          transaction.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedQuery),
          );

      const matchesType = type === "all" || transaction.type === type;
      const matchesStatus =
        status === "all" || transaction.status === status;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [transactions, query, type, status]);

  return (
    <section className="overflow-hidden rounded-xl border border-[#e0e0da] bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-[#eeeeea] p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-[#20221f]">
            Transaction history
          </h2>
          <p className="mt-1 text-sm text-[#777973]">
            Review payments, fees, refunds and payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d8d8d1] px-3 text-sm font-medium text-[#555750] hover:bg-[#f8f8f5]"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid gap-3 border-b border-[#eeeeea] p-4 md:grid-cols-[minmax(200px,1fr)_190px_160px]">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858680]"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transaction, booking, customer..."
            className="h-10 w-full rounded-md border border-[#d8d8d1] pl-9 pr-3 text-sm outline-none focus:border-[#39724b]"
          />
        </div>

        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#555750] outline-none focus:border-[#39724b]"
        >
          <option value="all">All transaction types</option>
          <option value="payment">Customer payment</option>
          <option value="platform_fee">Platform fee</option>
          <option value="refund">Refund</option>
          <option value="adjustment">Adjustment</option>
          <option value="payout">Payout</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#555750] outline-none focus:border-[#39724b]"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-250 border-collapse text-left">
          <thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.06em] text-[#777973]">
            <tr>
              <th className="px-5 py-3">Transaction</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eeeeea]">
            {filtered.map((transaction) => {
              const incoming =
                transaction.type === "payment" ||
                (transaction.type === "adjustment" &&
                  transaction.netAmount > 0);

              const outgoing =
                transaction.type === "platform_fee" ||
                transaction.type === "refund" ||
                transaction.type === "payout" ||
                (transaction.type === "adjustment" &&
                  transaction.netAmount < 0);

              const amount = Math.abs(transaction.netAmount);

              return (
                <tr
                  key={transaction.id}
                  className="transition-colors hover:bg-[#fcfcfa]"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-[#343630]">
                      {transaction.description}
                    </p>
                    <p className="mt-1 text-xs text-[#858680]">
                      {transaction.id}
                      {transaction.bookingId
                        ? ` · ${transaction.bookingId}`
                        : ""}
                    </p>
                    {transaction.customerName && (
                      <p className="mt-1 text-xs text-[#777973]">
                        {transaction.customerName}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#686a64]">
                    {typeLabels[transaction.type]}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#686a64]">
                    {new Date(transaction.createdAt).toLocaleString(
                      "vi-VN",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#686a64]">
                    {transaction.paymentMethod}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transaction.status === "completed"
                          ? "bg-[#e5f0e8] text-[#39724b]"
                          : transaction.status === "pending"
                            ? "bg-[#faf0df] text-[#98651e]"
                            : "bg-[#f5e4e1] text-[#a34d42]"
                      }`}
                    >
                      {statusLabels[transaction.status]}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div
                      className={`inline-flex items-center justify-end gap-1.5 text-sm font-semibold ${
                        incoming
                          ? "text-[#39724b]"
                          : outgoing
                            ? "text-[#a34d42]"
                            : "text-[#343630]"
                      }`}
                    >
                      {incoming ? (
                        <ArrowDownLeft size={15} />
                      ) : outgoing ? (
                        <ArrowUpRight size={15} />
                      ) : null}
                      {incoming ? "+" : outgoing ? "−" : ""}
                      {money(amount)}
                    </div>
                    {transaction.fee > 0 && (
                      <p className="mt-1 text-xs text-[#858680]">
                        Fee: {money(transaction.fee)}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <p className="font-medium text-[#343630]">
                    No transactions found
                  </p>
                  <p className="mt-1 text-sm text-[#858680]">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#eeeeea] px-5 py-3 text-xs text-[#858680]">
        Showing {filtered.length} of {transactions.length} transactions
      </div>
    </section>
  );
}
