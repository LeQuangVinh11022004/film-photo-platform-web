
"use client";

import {
  CalendarRange,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { CustomPricingRule } from "@/features/provider-pricing-policy/types";

type Props = {
  rules: CustomPricingRule[];
  onAdd: () => void;
  onEdit: (rule: CustomPricingRule) => void;
  onDelete: (rule: CustomPricingRule) => void;
  onToggle: (rule: CustomPricingRule) => void;
};

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scopeLabel(scope: CustomPricingRule["scope"]) {
  switch (scope) {
    case "creative-spaces":
      return "Creative spaces";
    case "equipment":
      return "Equipment";
    default:
      return "All services";
  }
}

export function CustomPricingRules({
  rules,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  return (
    <section className="mt-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#20221f]">
            Custom pricing rules
          </h2>
          <p className="mt-1 text-sm text-[#777973]">
            Create pricing adjustments for your own dates and business needs.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f603e]"
        >
          <Plus size={17} />
          Add pricing rule
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e0e0da] bg-white">
        {rules.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9eee7] text-[#39724b]">
              <CalendarRange size={22} />
            </div>

            <h3 className="mt-4 font-semibold text-[#20221f]">
              No custom pricing rules yet
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-[#777973]">
              Create a rule to adjust your prices during peak seasons,
              busy periods, or special events.
            </p>

            <button
              type="button"
              onClick={onAdd}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8d1] px-3 text-sm font-semibold text-[#39724b] hover:bg-[#f8f8f5]"
            >
              <Plus size={15} />
              Create your first rule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 border-collapse text-left">
              <thead className="bg-[#f8f8f5] text-xs font-semibold uppercase tracking-[0.08em] text-[#777973]">
                <tr>
                  <th className="px-5 py-3">Rule</th>
                  <th className="px-4 py-3">Date range</th>
                  <th className="px-4 py-3">Applies to</th>
                  <th className="px-4 py-3">Adjustment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eeeeea]">
                {rules.map((rule) => {
                  const isIncrease = rule.adjustmentType === "increase";

                  return (
                    <tr
                      key={rule.id}
                      className="transition-colors hover:bg-[#fcfcfa]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#292b27]">
                          {rule.name}
                        </p>
                        <p className="mt-1 text-xs text-[#858680]">
                          ID: {rule.id}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#686a64]">
                        <div>{formatDate(rule.startDate)}</div>
                        <div className="mt-1 text-xs text-[#858680]">
                          to {formatDate(rule.endDate)}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#686a64]">
                        {scopeLabel(rule.scope)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isIncrease
                              ? "bg-[#e5f0e8] text-[#39724b]"
                              : "bg-[#f5e4e1] text-[#a34d42]"
                          }`}
                        >
                          {isIncrease ? "+" : "−"}
                          {rule.percentage}%
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={rule.enabled}
                          aria-label={`Toggle ${rule.name}`}
                          onClick={() => onToggle(rule)}
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            rule.enabled
                              ? "bg-[#e5f0e8] text-[#39724b]"
                              : "bg-[#eeeeea] text-[#777973]"
                          }`}
                        >
                          {rule.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(rule)}
                            aria-label={`Edit ${rule.name}`}
                            className="rounded-md p-2 text-[#686a64] hover:bg-[#e9eee7] hover:text-[#39724b]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(rule)}
                            aria-label={`Delete ${rule.name}`}
                            className="rounded-md p-2 text-[#686a64] hover:bg-[#f5e4e1] hover:text-[#a34d42]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-[#858680]">
        {rules.length} {rules.length === 1 ? "rule" : "rules"} configured
      </p>
    </section>
  );
}
