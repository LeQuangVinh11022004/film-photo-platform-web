
"use client";

import { CalendarDays, Check, ChevronDown, ChevronUp } from "lucide-react";
import type {
  HolidayPolicy,
  PriceAdjustmentType,
} from "@/features/provider-pricing-policy/types";

type Props = {
  policies: HolidayPolicy[];
  onChange: (updated: HolidayPolicy) => void;
};

function formatDate(date: string) {
  if (!date) return "Date not configured";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HolidayPolicySection({ policies, onChange }: Props) {
  return (
    <section className="mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#20221f]">
          Holiday & special dates
        </h2>
        <p className="mt-1 text-sm text-[#777973]">
          Configure pricing for popular holidays and seasonal occasions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {policies.map((policy) => {
          const increase = policy.adjustmentType === "increase";

          const update = (changes: Partial<HolidayPolicy>) => {
            onChange({ ...policy, ...changes });
          };

          return (
            <article
              key={policy.id}
              className="rounded-xl border border-[#e0e0da] bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e9eee7] text-[#39724b]">
                    <CalendarDays size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#292b27]">
                      {policy.name}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#777973]">
                      {policy.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={policy.enabled}
                  aria-label={`Enable ${policy.name} policy`}
                  onClick={() => update({ enabled: !policy.enabled })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    policy.enabled ? "bg-[#39724b]" : "bg-[#c8c9c2]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      policy.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 rounded-lg bg-[#f8f8f5] px-3 py-2.5">
                <p className="text-xs font-medium text-[#777973]">
                  Configured period
                </p>
                <p className="mt-1 text-sm font-medium text-[#343630]">
                  {formatDate(policy.startDate)}
                  <span className="mx-2 text-[#a0a198]">–</span>
                  {formatDate(policy.endDate)}
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#777973]">
                  Price adjustment
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {(["increase", "discount"] as PriceAdjustmentType[]).map(
                    (type) => {
                      const selected = policy.adjustmentType === type;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => update({ adjustmentType: type })}
                          className={`flex h-9 items-center justify-center gap-1.5 rounded-md border text-xs font-semibold transition-colors ${
                            selected
                              ? type === "increase"
                                ? "border-[#39724b] bg-[#e5f0e8] text-[#39724b]"
                                : "border-[#a34d42] bg-[#f5e4e1] text-[#a34d42]"
                              : "border-[#e0e0da] bg-white text-[#777973] hover:bg-[#f8f8f5]"
                          }`}
                        >
                          {selected && <Check size={13} />}
                          {type === "increase" ? "Increase +" : "Discount −"}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <label
                  htmlFor={`holiday-percentage-${policy.id}`}
                  className="text-sm text-[#686a64]"
                >
                  Adjustment
                </label>

                <div className="flex h-9 items-center overflow-hidden rounded-md border border-[#d8d8d1] bg-white">
                  <button
                    type="button"
                    aria-label={`Decrease ${policy.name} adjustment`}
                    onClick={() =>
                      update({
                        percentage: Math.max(
                          0,
                          Math.round((policy.percentage - 5) * 10) / 10,
                        ),
                      })
                    }
                    className="h-full px-2 text-[#686a64] hover:bg-[#f5f5f1]"
                  >
                    <ChevronDown size={15} />
                  </button>

                  <input
                    id={`holiday-percentage-${policy.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={policy.percentage}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      if (Number.isFinite(value) && value >= 0 && value <= 100) {
                        update({ percentage: value });
                      }
                    }}
                    className="h-full w-16 border-x border-[#e8e8e2] text-center text-sm font-semibold text-[#343630] outline-none"
                  />

                  <button
                    type="button"
                    aria-label={`Increase ${policy.name} adjustment`}
                    onClick={() =>
                      update({
                        percentage: Math.min(
                          100,
                          Math.round((policy.percentage + 5) * 10) / 10,
                        ),
                      })
                    }
                    className="h-full px-2 text-[#686a64] hover:bg-[#f5f5f1]"
                  >
                    <ChevronUp size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#eeeeea] pt-3">
                <span
                  className={`text-sm font-semibold ${
                    !policy.enabled
                      ? "text-[#858680]"
                      : increase
                        ? "text-[#39724b]"
                        : "text-[#a34d42]"
                  }`}
                >
                  {!policy.enabled
                    ? "Disabled"
                    : `${increase ? "+" : "−"}${policy.percentage}%`}
                </span>
                <span className="text-xs text-[#858680]">
                  {policy.enabled ? "Policy enabled" : "Policy disabled"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
