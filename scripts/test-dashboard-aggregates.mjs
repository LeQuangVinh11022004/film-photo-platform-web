import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/features/admin-dashboard/aggregates.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;

function dashboardWith(bookings, totalItems = bookings.length) {
  const exports = {};
  const page = (items, total = items.length) => async () => ({ items, totalItems: total });
  const modules = {
    "@/features/admin-booking/api": { listAdminBookings: page(bookings, totalItems) },
    "@/features/admin-space/api": { listAdminSpaces: page([]) },
    "@/features/admin-user/api": { listAdminUsers: page([]) },
  };
  vm.runInNewContext(javascript, { exports, require: (name) => {
    if (!(name in modules)) throw new Error(`Unexpected dependency: ${name}`);
    return modules[name];
  }, Date });
  return exports.loadAdminDashboardCharts();
}

function localDate(offset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

test("booking value and 30-day trend use consistent eligible statuses and exclude future dates", async () => {
  const today = localDate(0);
  const bookings = [
    { bookingDate: today, status: "CONFIRMED", totalAmount: 10, providerName: "A" },
    { bookingDate: today, status: "IN_PROGRESS", totalAmount: 21, providerName: "B" },
    { bookingDate: today, status: "COMPLETED", totalAmount: 30, providerName: "B" },
    { bookingDate: today, status: "AWAITING_DEPOSIT", totalAmount: 100, providerName: "A" },
    { bookingDate: today, status: "CANCELLED", totalAmount: 100, providerName: "", spaceName: "Not a provider" },
    { bookingDate: localDate(10), status: "CONFIRMED", totalAmount: 40, providerName: "A" },
  ];
  const result = await dashboardWith(bookings);
  assert.equal(result.totalRevenue, 101);
  assert.equal(result.bookingTrend.length, 30);
  assert.equal(result.bookingTrend[0].date, localDate(-29));
  assert.equal(result.bookingTrend.at(-1).date, today);
  assert.equal(result.bookingTrend.at(-1).bookings, 5);
  assert.equal(result.bookingTrend.at(-1).revenue, 61);
  assert.equal(result.topProviders[0].name, "B");
  assert.equal(result.topProviders[0].revenue, 51);
  assert.equal(result.topProviders.length, 2);
});

test("marks aggregates as partial when the backend has more records than fetched", async () => {
  const result = await dashboardWith([], 1);
  assert.equal(result.partial, true);
});
