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
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";

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
  const { messages } = useProviderLanguage();
  const p = messages.dashboard.performance;

  const currentData = data[period];

  const isRevenue = metric === "revenue";

  return (
    <article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-semibold text-[#20221f]">
            {p.title}
          </h2>

          <p className="mt-1 text-sm text-[#777973]">
            {isRevenue ? p.revenueDesc : p.reservationsDesc}
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
                {item === "reservations" ? p.reservations : p.revenue}
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
                {item === "7d" ? p.d7 : item === "30d" ? p.d30 : p.d90}
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
              dx={-4}
            />

            <Tooltip
              cursor={{ fill: "rgba(77, 135, 93, 0.06)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const item = payload[0].payload as PerformancePoint;

                return (
                  <div className="rounded-xl border border-[#dedfd9] bg-white p-3 shadow-xl">
                    <p className="text-xs font-medium text-[#70736c]">
                      {item.label}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#20221f]">
                      {isRevenue
                        ? formatFullCurrency(item.revenue)
                        : `${formatNumber(item.reservations)} ${p.reservations}`}
                    </p>
                  </div>
                );
              }}
            />

            <Bar
              dataKey={metric}
              fill="#4d875d"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
              animationDuration={650}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eceee8] pt-4 text-xs text-[#70736c]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4d875d]" />
          <span>
            {isRevenue ? p.revenue : p.reservations}
          </span>
        </div>

        <span className="text-[11px] text-[#858880]">
          {messages.common.sampleData}
        </span>
      </div>
    </article>
  );
}
