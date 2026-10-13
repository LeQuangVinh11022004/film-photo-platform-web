
export type PriceAdjustmentType = "increase" | "discount";

export type PricingScope = "all" | "creative-spaces" | "equipment";

export type HolidayPolicy = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  adjustmentType: PriceAdjustmentType;
  percentage: number;
  enabled: boolean;
};

export type CustomPricingRule = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: PriceAdjustmentType;
  percentage: number;
  scope: PricingScope;
  enabled: boolean;
};

export type PricingRuleFormData = Omit<CustomPricingRule, "id">;
