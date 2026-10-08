"use client";

import Link from "next/link";

type ProviderMetricCardProps = {
	label: string;
	value: string;
	change?: string;
	changeLabel?: string;
	href?: string;
	trend?: number[];
	delay?: number;
};

function MiniTrend({ values }: { values: number[] }) {
	if (!values.length) return null;

	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;

	const points = values
		.map((value, index) => {
			const x = (index / (values.length - 1 || 1)) * 100;
			const y = 30 - ((value - min) / range) * 24;

			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg
			viewBox="0 0 100 36"
			aria-hidden="true"
			className="h-9 w-20 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
		>
			<polyline
				points={points}
				fill="none"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function ProviderMetricCard({
	label,
	value,
	change,
	changeLabel = "vs previous period",
	href,
	trend,
	delay = 0,
}: ProviderMetricCardProps) {
	const content = (
		<article
			style={{
				animation: `provider-fade-up 450ms ease-out ${delay}ms both`,
			}}
			className="group relative overflow-hidden rounded-xl border border-[#e2e4dd] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#cdd2c5] hover:shadow-[0_10px_30px_rgba(32,34,31,0.07)]"
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-sm font-medium text-[#70736c]">
						{label}
					</p>

					<p className="mt-3 text-3xl font-semibold tracking-tight text-[#20221f]">
						{value}
					</p>

					{change && (
						<p className="mt-3 text-xs text-[#7b7e76]">
							<span className="mr-1.5 font-semibold text-[#4d875d]">
								{change}
							</span>
							{changeLabel}
						</p>
					)}
				</div>

				{/* {trend && (
					<div className="shrink-0 pt-7 text-[#4d875d]">
						<MiniTrend values={trend} />
					</div>
				)} */}
			</div>
		</article>
	);

	if (!href) return content;

	return (
		<Link
			href={href}
			className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4d875d]/40"
		>
			{content}
		</Link>
	);
}