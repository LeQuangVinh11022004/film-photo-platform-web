
"use client";

import {
  Wallet,
  TrendingUp,
  ReceiptText,
  CircleDollarSign,
} from "lucide-react";

type Props = {
  todayRevenue: number;
  weeklyRevenue: number;
  platformFees: number;
  netEarnings: number;
};

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export function TransactionSummary({
  todayRevenue,
  weeklyRevenue,
  platformFees,
  netEarnings,
}: Props) {
  const cards = [
    {
      title: "Today's revenue",
      value: currency(todayRevenue),
      description: "Gross completed payments",
      icon: TrendingUp,
      color: "text-[#39724b]",
      bg: "bg-[#e9eee7]",
    },
    {
      title: "Last 7 days",
      value: currency(weeklyRevenue),
      description: "Gross completed payments",
      icon: ReceiptText,
      color: "text-[#426a9b]",
      bg: "bg-[#eaf0f8]",
    },
    {
      title: "Platform fees",
      value: currency(platformFees),
      description: "Fees deducted in selected period",
      icon: CircleDollarSign,
      color: "text-[#a36a24]",
      bg: "bg-[#faf0df]",
    },
    {
      title: "Net earnings",
      value: currency(netEarnings),
      description: "After platform fees and adjustments",
      icon: Wallet,
      color: "text-[#39724b]",
      bg: "bg-[#e9eee7]",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="rounded-xl border border-[#e0e0da] bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[#686a64]">
                {card.title}
              </p>
              <div className={`rounded-lg p-2 ${card.bg} ${card.color}`}>
                <Icon size={19} />
              </div>
            </div>

            <p className="mt-4 wrap-break-word text-2xl font-semibold tracking-tight text-[#20221f]">
              {card.value}
            </p>

            <p className="mt-2 text-xs text-[#858680]">
              {card.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}
