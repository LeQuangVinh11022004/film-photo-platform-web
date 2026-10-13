
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type {
  CustomPricingRule,
  PricingRuleFormData,
} from "@/features/provider-pricing-policy/types";

type Props = {
  open: boolean;
  rule: CustomPricingRule | null;
  onClose: () => void;
  onSave: (data: PricingRuleFormData) => void;
};

const inputClass =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

export function PricingRuleModal({
  open,
  rule,
  onClose,
  onSave,
}: Props) {
  if (!open) return null;

  return (
    <PricingRuleModalForm
      key={JSON.stringify(rule)}
      rule={rule}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function PricingRuleModalForm({ rule, onClose, onSave }: Omit<Props, "open">) {
  const [name, setName] = useState(rule?.name ?? "");
  const [startDate, setStartDate] = useState(rule?.startDate ?? "");
  const [endDate, setEndDate] = useState(rule?.endDate ?? "");
  const [adjustmentType, setAdjustmentType] =
    useState<"increase" | "discount">(rule?.adjustmentType ?? "increase");
  const [percentage, setPercentage] = useState(String(rule?.percentage ?? 10));
  const [scope, setScope] =
    useState<"all" | "creative-spaces" | "equipment">(rule?.scope ?? "all");
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(percentage);

    if (!name.trim()) {
      setError("Please enter a rule name.");
      return;
    }

    if (startDate > endDate) {
      setError("The end date must be on or after the start date.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 100) {
      setError("Enter a percentage greater than 0 and at most 100.");
      return;
    }

    onSave({
      name: name.trim(),
      startDate,
      endDate,
      adjustmentType,
      percentage: amount,
      scope,
      enabled,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171815]/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-rule-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#e0e0da] bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-[#eeeeea] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#39724b]">
              Pricing policy
            </p>
            <h2
              id="pricing-rule-title"
              className="mt-1 text-xl font-semibold text-[#20221f]"
            >
              {rule ? "Edit pricing rule" : "Create pricing rule"}
            </h2>
            <p className="mt-1 text-sm text-[#777973]">
              Set a date range and choose how prices should change.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-2 text-[#777973] hover:bg-[#f0f0ec]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            <div>
              <label htmlFor="rule-name" className="mb-1.5 block text-sm font-medium text-[#343630]">
                Rule name
              </label>
              <input
                id="rule-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Peak season surcharge"
                className={inputClass}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rule-start" className="mb-1.5 block text-sm font-medium text-[#343630]">
                  Start date
                </label>
                <input
                  id="rule-start"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="rule-end" className="mb-1.5 block text-sm font-medium text-[#343630]">
                  End date
                </label>
                <input
                  id="rule-end"
                  type="date"
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#343630]">
                Price adjustment
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["increase", "discount"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAdjustmentType(type)}
                    className={`h-10 rounded-md border text-sm font-medium transition-colors ${
                      adjustmentType === type
                        ? type === "increase"
                          ? "border-[#39724b] bg-[#e5f0e8] text-[#39724b]"
                          : "border-[#a34d42] bg-[#f5e4e1] text-[#a34d42]"
                        : "border-[#d8d8d1] text-[#686a64] hover:bg-[#f8f8f5]"
                    }`}
                  >
                    {type === "increase" ? "Increase price +" : "Discount −"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rule-percentage" className="mb-1.5 block text-sm font-medium text-[#343630]">
                Percentage (%)
              </label>
              <input
                id="rule-percentage"
                type="number"
                min="0.01"
                max="100"
                step="0.5"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
                className={inputClass}
                required
              />
              <p className="mt-1.5 text-xs text-[#858680]">
                {adjustmentType === "increase"
                  ? `Prices will increase by ${percentage || "0"}%.`
                  : `Prices will decrease by ${percentage || "0"}%.`}
              </p>
            </div>

            <div>
              <label htmlFor="rule-scope" className="mb-1.5 block text-sm font-medium text-[#343630]">
                Apply to
              </label>
              <select
                id="rule-scope"
                value={scope}
                onChange={(event) =>
                  setScope(event.target.value as typeof scope)
                }
                className={inputClass}
              >
                <option value="all">All services</option>
                <option value="creative-spaces">Creative spaces only</option>
                <option value="equipment">Equipment only</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#e0e0da] bg-[#fafaf7] px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-[#343630]">
                  Enable this rule
                </span>
                <span className="mt-0.5 block text-xs text-[#858680]">
                  The rule can apply within its configured dates.
                </span>
              </span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
                className="h-4 w-4 accent-[#39724b]"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-[#a34d42]">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-[#eeeeea] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-[#d8d8d1] px-4 text-sm font-medium text-[#555750] hover:bg-[#f5f5f1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-[#39724b] px-4 text-sm font-semibold text-white hover:bg-[#2f603e]"
            >
              {rule ? "Save changes" : "Create rule"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
