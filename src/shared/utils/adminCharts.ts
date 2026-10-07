export function distributeTotal(total: number, weights: number[]) {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightTotal <= 0) return weights.map(() => 0);

  const allocations = weights.map((weight) => Math.floor((total * weight) / weightTotal));
  const remainders = weights
    .map((weight, index) => ({ index, value: (total * weight) % weightTotal }))
    .sort((first, second) => second.value - first.value);
  const leftover = total - allocations.reduce((sum, value) => sum + value, 0);

  for (let index = 0; index < leftover; index += 1) {
    allocations[remainders[index].index] += 1;
  }

  return allocations;
}

export function formatChartNumber(value: number, locale: "en" | "vi") {
  const separator = locale === "vi" ? "." : ",";
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function formatChartCurrency(value: number, locale: "en" | "vi") {
  const unit = value >= 1_000_000 ? "M" : value >= 1_000 ? "K" : "";
  const scale = unit === "M" ? 1_000_000 : 1_000;
  if (!unit) return `$${formatChartNumber(value, locale)}`;
  const compactValue = (value / scale).toFixed(1).replace(".", locale === "vi" ? "," : ".");
  return `$${compactValue}${unit}`;
}