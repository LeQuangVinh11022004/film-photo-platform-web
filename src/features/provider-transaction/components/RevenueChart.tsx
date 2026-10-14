
"use client";

import { useState } from "react";

export type RevenuePoint = {
  label: string;
  revenue: number;
  net: number;
};

type Props = {
  data: RevenuePoint[];
  period: "7d" | "30d";
  onPeriodChange: (period: "7d" | "30d") => void;
};

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export function RevenueChart({
  data,
  period,
  onPeriodChange,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const maxValue = Math.max(
    1,
    ...data.map((point) => point.revenue),
  );

  const selected = selectedIndex === null ? null : data[selectedIndex];

  return (
    <section className="rounded-xl border border-[#e0e0da] bg-white p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-semibold text-[#20221f]">
            Revenue overview
          </h2>
          <p className="mt-1 text-sm text-[#777973]">
            Gross revenue vs. estimated net earnings
          </p>
        </div>

        <div className="flex rounded-lg border border-[#e0e0da] p-1">
          {(["7d", "30d"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                onPeriodChange(value);
                setSelectedIndex(null);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                period === value
                  ? "bg-[#39724b] text-white"
                  : "text-[#686a64] hover:bg-[#f5f5f1]"
              }`}
            >
              {value === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#686a64]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#39724b]" />
          Gross revenue
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#c8d9c9]" />
          Net earnings
        </span>
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
        <div className="flex h-48 flex-col justify-between pb-5 text-right text-[10px] text-[#858680]">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <span key={ratio}>{currency(maxValue * ratio)}</span>
          ))}
        </div>

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute inset-0 flex h-48 flex-col justify-between">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                key={line}
                className="border-t border-dashed border-[#eeeeea]"
              />
            ))}
          </div>

          <div className="relative flex h-48 items-end gap-1 overflow-x-auto pb-5">
            {data.map((point, index) => (
              <button
                key={`${point.label}-${index}`}
                type="button"
                title={`${point.label}: ${currency(point.revenue)}`}
                onClick={() =>
                  setSelectedIndex(index === selectedIndex ? null : index)
                }
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 rounded-t px-px outline-none focus-visible:ring-2 focus-visible:ring-[#39724b]"
                aria-label={`${point.label}, gross revenue ${currency(point.revenue)}, net earnings ${currency(point.net)}`}
              >
                <span
                  className={`w-[45%] rounded-t-sm transition-colors ${
                    selectedIndex === index
                      ? "bg-[#285636]"
                      : "bg-[#39724b] group-hover:bg-[#285636]"
                  }`}
                  style={{
                    height: `${Math.max(1, (point.revenue / maxValue) * 100)}%`,
                  }}
                />
                <span
                  className="w-[45%] rounded-t-sm bg-[#c8d9c9] transition-colors group-hover:bg-[#a8c3aa]"
                  style={{
                    height: `${Math.max(1, (point.net / maxValue) * 100)}%`,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-1 overflow-hidden">
            {data.map((point, index) => {
              const showLabel =
                data.length <= 7 ||
                index === 0 ||
                index === data.length - 1 ||
                index % 5 === 0;

              return (
                <div
                  key={`${point.label}-label`}
                  className="min-w-0 flex-1 truncate text-center text-[10px] text-[#858680]"
                >
                  {showLabel ? point.label : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-4 rounded-lg border border-[#e0e0da] bg-[#fafaf7] p-3">
          <p className="text-sm font-semibold text-[#343630]">
            {selected.label}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-[#39724b]">
              Revenue: {currency(selected.revenue)}
            </span>
            <span className="text-[#686a64]">
              Net: {currency(selected.net)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
