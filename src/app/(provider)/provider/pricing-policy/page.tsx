
"use client";

import { useState } from "react";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";

import { PageHeader } from "@/shared/components/PageHeader";
import { HolidayPolicySection } from "@/features/provider-pricing-policy/components/HolidayPolicySection";
import { CustomPricingRules } from "@/features/provider-pricing-policy/components/CustomPricingRules";
import { PricingRuleModal } from "@/features/provider-pricing-policy/components/PricingRuleModal";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";

import type {
  CustomPricingRule,
  HolidayPolicy,
  PricingRuleFormData,
} from "@/features/provider-pricing-policy/types";

// Sample data for UI development.
// Replace with API data when backend integration is ready.
const initialHolidayPolicies: HolidayPolicy[] = [
  {
    id: "HOL-001",
    name: "Lunar New Year",
    description: "Vietnamese Lunar New Year holiday",
    startDate: "2027-02-06",
    endDate: "2027-02-10",
    adjustmentType: "increase",
    percentage: 20,
    enabled: true,
  },
  {
    id: "HOL-002",
    name: "Christmas",
    description: "Christmas Day and seasonal demand",
    startDate: "2026-12-24",
    endDate: "2026-12-25",
    adjustmentType: "increase",
    percentage: 15,
    enabled: true,
  },
  {
    id: "HOL-003",
    name: "New Year's Eve",
    description: "Year-end celebrations",
    startDate: "2026-12-31",
    endDate: "2026-12-31",
    adjustmentType: "increase",
    percentage: 10,
    enabled: false,
  },
  {
    id: "HOL-004",
    name: "Valentine's Day",
    description: "Special offers for couples and portraits",
    startDate: "2027-02-14",
    endDate: "2027-02-14",
    adjustmentType: "discount",
    percentage: 10,
    enabled: false,
  },
  {
    id: "HOL-005",
    name: "International Women's Day",
    description: "Seasonal photography promotions",
    startDate: "2027-03-08",
    endDate: "2027-03-08",
    adjustmentType: "discount",
    percentage: 10,
    enabled: false,
  },
  {
    id: "HOL-006",
    name: "National Day",
    description: "Vietnam's National Day holiday",
    startDate: "2027-09-02",
    endDate: "2027-09-02",
    adjustmentType: "increase",
    percentage: 10,
    enabled: false,
  },
];

const initialCustomRules: CustomPricingRule[] = [
  {
    id: "PR-1001",
    name: "Peak Season",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    adjustmentType: "increase",
    percentage: 15,
    scope: "creative-spaces",
    enabled: true,
  },
  {
    id: "PR-1002",
    name: "Midweek Promotion",
    startDate: "2026-10-20",
    endDate: "2026-10-31",
    adjustmentType: "discount",
    percentage: 10,
    scope: "all",
    enabled: false,
  },
];

const summaryCardClass =
  "rounded-xl border border-[#e0e0da] bg-white p-4";

export default function PricingPolicyPage() {
  const [holidayPolicies, setHolidayPolicies] =
    useState<HolidayPolicy[]>(initialHolidayPolicies);

  const [customRules, setCustomRules] =
    useState<CustomPricingRule[]>(initialCustomRules);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] =
    useState<CustomPricingRule | null>(null);
  const [pendingDeleteRule, setPendingDeleteRule] =
    useState<CustomPricingRule | null>(null);

  const enabledHolidayCount = holidayPolicies.filter(
    (policy) => policy.enabled,
  ).length;

  const enabledCustomRuleCount = customRules.filter(
    (rule) => rule.enabled,
  ).length;

  const totalEnabledRules =
    enabledHolidayCount + enabledCustomRuleCount;

  const handleHolidayChange = (updated: HolidayPolicy) => {
    setHolidayPolicies((current) =>
      current.map((policy) =>
        policy.id === updated.id ? updated : policy,
      ),
    );
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setModalOpen(true);
  };

  const handleEditRule = (rule: CustomPricingRule) => {
    setEditingRule(rule);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingRule(null);
  };

  const handleSaveRule = (data: PricingRuleFormData) => {
    if (editingRule) {
      setCustomRules((current) =>
        current.map((rule) =>
          rule.id === editingRule.id
            ? { ...data, id: rule.id }
            : rule,
        ),
      );
    } else {
      const newRule: CustomPricingRule = {
        ...data,
        id: `PR-${Date.now()}`,
      };

      setCustomRules((current) => [newRule, ...current]);
    }

    handleCloseModal();
  };

  const handleDeleteRule = (rule: CustomPricingRule) => {
    setPendingDeleteRule(rule);
  };

  const confirmDeleteRule = () => {
    if (!pendingDeleteRule) return;
    setCustomRules((current) => current.filter((item) => item.id !== pendingDeleteRule.id));
    setPendingDeleteRule(null);
  };

  const handleToggleRule = (updated: CustomPricingRule) => {
    setCustomRules((current) =>
      current.map((rule) =>
        rule.id === updated.id
          ? { ...rule, enabled: !rule.enabled }
          : rule,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow="Provider workspace"
        title="Pricing Policy"
        description="Manage seasonal pricing, holiday adjustments, and custom pricing rules for your services."
      />

      {/* Summary */}
      <section
        aria-label="Pricing policy summary"
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article className={summaryCardClass}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#686a64]">
              Holiday policies
            </p>
            <CalendarDays size={19} className="text-[#39724b]" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#20221f]">
            {holidayPolicies.length}
          </p>
          <p className="mt-1 text-xs text-[#858680]">
            Preset special dates
          </p>
        </article>

        <article className={summaryCardClass}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#686a64]">
              Active policies
            </p>
            <TrendingUp size={19} className="text-[#39724b]" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#20221f]">
            {totalEnabledRules}
          </p>
          <p className="mt-1 text-xs text-[#858680]">
            Enabled holiday and custom rules
          </p>
        </article>

        <article className={summaryCardClass}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#686a64]">
              Custom rules
            </p>
            <TrendingDown size={19} className="text-[#39724b]" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#20221f]">
            {customRules.length}
          </p>
          <p className="mt-1 text-xs text-[#858680]">
            {enabledCustomRuleCount} currently enabled
          </p>
        </article>
      </section>

      {/* Section 1: Preset holidays */}
      <HolidayPolicySection
        policies={holidayPolicies}
        onChange={handleHolidayChange}
      />

      {/* Section 2: Provider-created rules */}
      <CustomPricingRules
        rules={customRules}
        onAdd={handleAddRule}
        onEdit={handleEditRule}
        onDelete={handleDeleteRule}
        onToggle={handleToggleRule}
      />

      {/* Shared create/edit modal */}
      <PricingRuleModal
        open={modalOpen}
        rule={editingRule}
        onClose={handleCloseModal}
        onSave={handleSaveRule}
      />
      {pendingDeleteRule && <ConfirmDeleteDialog title="Delete this pricing rule?" description={`“${pendingDeleteRule.name}” will be permanently deleted. This action cannot be undone.`} onCancel={() => setPendingDeleteRule(null)} onConfirm={confirmDeleteRule} />}
    </div>
  );
}
