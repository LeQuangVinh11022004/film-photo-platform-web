"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ProviderPeriod = "7d" | "30d" | "90d";
type ChartMetric = "reservations" | "revenue";

type PerformancePoint = {
  label: string;
  reservations: number;
  revenue: number;
};

type ProviderPerformanceChartProps = {
  period: ProviderPeriod;
  onPeriodChange: (period: ProviderPeriod) => void;
  data: Record<ProviderPeriod, PerformancePoint[]>;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const formatFullCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export function ProviderPerformanceChart({
  period,
  onPeriodChange,
  data,
}: ProviderPerformanceChartProps) {
  const [metric, setMetric] = useState<ChartMetric>("reservations");

  const currentData = data[period];

  const isRevenue = metric === "revenue";

  return (
    <article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-semibold text-[#20221f]">
            Performance overview
          </h2>

          <p className="mt-1 text-sm text-[#777973]">
            {isRevenue
              ? "Revenue generated during the selected period."
              : "Reservations received during the selected period."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Metric switch */}
          <div
            className="inline-flex rounded-lg border border-[#dfe1da] bg-[#f8f9f5] p-1"
            role="group"
            aria-label="Chart metric">
            {(["reservations", "revenue"] as ChartMetric[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={metric === item}
                onClick={() => setMetric(item)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  metric === item
                    ? "bg-[#20221f] text-white shadow-sm"
                    : "text-[#70736c] hover:bg-white hover:text-[#20221f]"
                }`}>
                {item === "reservations" ? "Reservations" : "Revenue"}
              </button>
            ))}
          </div>

          {/* Period switch */}
          <div
            className="inline-flex rounded-lg border border-[#dfe1da] bg-[#f8f9f5] p-1"
            role="group"
            aria-label="Performance period">
            {(["7d", "30d", "90d"] as ProviderPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={period === item}
                onClick={() => onPeriodChange(item)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  period === item
                    ? "bg-[#20221f] text-white shadow-sm"
                    : "text-[#70736c] hover:bg-white hover:text-[#20221f]"
                }`}>
                {item === "7d"
                  ? "7 days"
                  : item === "30d"
                    ? "30 days"
                    : "90 days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 h-70 w-full min-w-0 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            key={`${period}-${metric}`}
            data={currentData}
            margin={{
              top: 10,
              right: 4,
              left: isRevenue ? 0 : -8,
              bottom: 0,
            }}>
            <CartesianGrid
              stroke="#eceee8"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#858880",
              }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#858880",
              }}
              tickFormatter={isRevenue ? formatCurrency : formatNumber}
              width={isRevenue ? 55 : 40}
            />

            <Tooltip
              cursor={{
                fill: isRevenue ? "#fbf7ee" : "#f2f7f3",
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const value = Number(payload[0]?.value ?? 0);

                return (
                  <div className="rounded-lg border border-[#dedfd9] bg-white px-4 py-3 shadow-lg">
                    <p className="mb-2 text-xs font-semibold text-[#343631]">
                      {label}
                    </p>

                    <p className="text-xs text-[#70736c]">
                      {isRevenue ? "Revenue" : "Reservations"}:{" "}
                      <span className="font-semibold text-[#20221f]">
                        {isRevenue
                          ? formatFullCurrency(value)
                          : `${formatNumber(value)} reservations`}
                      </span>
                    </p>
                  </div>
                );
              }}
            />

            <Bar
              dataKey={metric}
              name={isRevenue ? "Revenue" : "Reservations"}
              fill={isRevenue ? "#c89b42" : "#4d875d"}
              radius={[5, 5, 0, 0]}
              barSize={isRevenue ? 30 : 34}
              animationDuration={650}
              animationBegin={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[#eeeeea] pt-4">
        <span
          className={`h-2.5 w-2.5 rounded-sm ${
            isRevenue ? "bg-[#c89b42]" : "bg-[#4d875d]"
          }`}
        />

        <span className="text-xs text-[#70736c]">
          {isRevenue ? "Revenue" : "Reservations"}
        </span>
      </div>
    </article>
  );
}
