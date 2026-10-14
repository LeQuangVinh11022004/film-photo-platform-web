
"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";

import { TransactionSummary } from "@/features/provider-transaction/components/TransactionSummary";
import {
  RevenueChart,
  type RevenuePoint,
} from "@/features/provider-transaction/components/RevenueChart";
import { TransactionTable } from "@/features/provider-transaction/components/TransactionTable";

import type { Transaction } from "@/features/provider-transaction/types";

const initialTransactions: Transaction[] = [
  {
    id: "TX-20261013-001",
    bookingId: "BK-2081",
    customerName: "Nguyen Minh Anh",
    description: "North Light Studio booking",
    type: "payment",
    status: "completed",
    amount: 1200000,
    fee: 120000,
    netAmount: 1080000,
    createdAt: "2026-10-13T09:42:00",
    paymentMethod: "Bank transfer",
  },
  {
    id: "TX-20261013-002",
    bookingId: "BK-2082",
    customerName: "Tran Hoang Nam",
    description: "Equipment rental",
    type: "payment",
    status: "completed",
    amount: 450000,
    fee: 45000,
    netAmount: 405000,
    createdAt: "2026-10-13T10:15:00",
    paymentMethod: "E-wallet",
  },
  {
    id: "TX-20261013-003",
    description: "Platform service fee",
    type: "platform_fee",
    status: "completed",
    amount: -120000,
    fee: 0,
    netAmount: -120000,
    createdAt: "2026-10-13T10:16:00",
    paymentMethod: "Platform deduction",
  },
  {
    id: "TX-20261012-001",
    bookingId: "BK-2077",
    customerName: "Le Thu Ha",
    description: "Creative space booking",
    type: "payment",
    status: "completed",
    amount: 1800000,
    fee: 180000,
    netAmount: 1620000,
    createdAt: "2026-10-12T14:20:00",
    paymentMethod: "Bank transfer",
  },
  {
    id: "TX-20261012-002",
    bookingId: "BK-2069",
    customerName: "Pham Gia Bao",
    description: "Partial booking refund",
    type: "refund",
    status: "completed",
    amount: -200000,
    fee: 0,
    netAmount: -200000,
    createdAt: "2026-10-12T16:30:00",
    paymentMethod: "Original payment method",
  },
  {
    id: "TX-20261011-001",
    bookingId: "BK-2070",
    customerName: "Vo Thanh Tung",
    description: "Darkroom session booking",
    type: "payment",
    status: "completed",
    amount: 900000,
    fee: 90000,
    netAmount: 810000,
    createdAt: "2026-10-11T11:10:00",
    paymentMethod: "E-wallet",
  },
  {
    id: "TX-20261011-002",
    description: "Manual balance adjustment",
    type: "adjustment",
    status: "completed",
    amount: -50000,
    fee: 0,
    netAmount: -50000,
    createdAt: "2026-10-11T17:00:00",
    paymentMethod: "Admin adjustment",
  },
  {
    id: "TX-20261010-001",
    bookingId: "BK-2061",
    customerName: "Nguyen Phuong Linh",
    description: "Studio booking",
    type: "payment",
    status: "pending",
    amount: 1500000,
    fee: 150000,
    netAmount: 1350000,
    createdAt: "2026-10-10T15:00:00",
    paymentMethod: "Bank transfer",
  },
  {
    id: "TX-20261009-001",
    description: "Provider payout",
    type: "payout",
    status: "completed",
    amount: -2000000,
    fee: 0,
    netAmount: -2000000,
    createdAt: "2026-10-09T13:45:00",
    paymentMethod: "Bank transfer",
  },
  {
    id: "TX-20261008-001",
    bookingId: "BK-2052",
    customerName: "Do Quynh Chi",
    description: "Equipment rental",
    type: "payment",
    status: "failed",
    amount: 350000,
    fee: 35000,
    netAmount: 315000,
    createdAt: "2026-10-08T09:15:00",
    paymentMethod: "E-wallet",
  },
];

const sevenDayRevenue: RevenuePoint[] = [
  { label: "07 Oct", revenue: 2200000, net: 1950000 },
  { label: "08 Oct", revenue: 1800000, net: 1600000 },
  { label: "09 Oct", revenue: 3200000, net: 2850000 },
  { label: "10 Oct", revenue: 2700000, net: 2400000 },
  { label: "11 Oct", revenue: 4100000, net: 3650000 },
  { label: "12 Oct", revenue: 3500000, net: 3100000 },
  { label: "13 Oct", revenue: 1650000, net: 1485000 },
];

const thirtyDayRevenue: RevenuePoint[] = [
  { label: "14 Sep", revenue: 1800000, net: 1580000 },
  { label: "16 Sep", revenue: 2600000, net: 2300000 },
  { label: "18 Sep", revenue: 2100000, net: 1850000 },
  { label: "20 Sep", revenue: 3900000, net: 3450000 },
  { label: "22 Sep", revenue: 3100000, net: 2750000 },
  { label: "24 Sep", revenue: 4500000, net: 4000000 },
  { label: "26 Sep", revenue: 2800000, net: 2480000 },
  { label: "28 Sep", revenue: 5200000, net: 4620000 },
  { label: "30 Sep", revenue: 3600000, net: 3200000 },
  { label: "02 Oct", revenue: 4100000, net: 3630000 },
  { label: "04 Oct", revenue: 3300000, net: 2920000 },
  { label: "06 Oct", revenue: 4700000, net: 4170000 },
  { label: "08 Oct", revenue: 1800000, net: 1600000 },
  { label: "10 Oct", revenue: 2700000, net: 2400000 },
  { label: "13 Oct", revenue: 1650000, net: 1485000 },
];

export default function TransactionPage() {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState<"7d" | "30d">("7d");

  // Demo figures. Replace these with backend aggregates.
  const todayRevenue = 1650000;
  const weeklyRevenue = 19150000;
  const platformFees = 1915000;
  const netEarnings = 17235000;

  return (
    <div className="mx-auto max-w-360 space-y-6 pb-8">
      <PageHeader
        eyebrow="Provider workspace"
        title="Transactions"
        description="Track your revenue, platform fees, payouts, and transaction history."
      />

      <TransactionSummary
        todayRevenue={todayRevenue}
        weeklyRevenue={weeklyRevenue}
        platformFees={platformFees}
        netEarnings={netEarnings}
      />

      <RevenueChart
        data={period === "7d" ? sevenDayRevenue : thirtyDayRevenue}
        period={period}
        onPeriodChange={setPeriod}
      />

      <TransactionTable transactions={transactions} />

      <p className="text-xs text-[#858680]">
        Sample data for demonstration purposes. Financial figures are not
        connected to actual payments or provider balances.
      </p>
    </div>
  );
}
