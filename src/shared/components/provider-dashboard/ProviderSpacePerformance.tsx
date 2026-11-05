"use client";

import Link from "next/link";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";

type SpacePerformance = {
	name: string;
	bookings: number;
};

type ProviderSpacePerformanceProps = {
	data: SpacePerformance[];
};

export function ProviderSpacePerformance({
	data,
}: ProviderSpacePerformanceProps) {
	const { messages } = useProviderLanguage();
	const sp = messages.dashboard.spaces;

	return (
		<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-base font-semibold text-[#20221f]">
						{sp.title}
					</h2>

					<p className="mt-1 text-sm text-[#777973]">
						{sp.description}
					</p>
				</div>

				<Link
					href="/provider/creative-spaces"
					className="shrink-0 text-xs font-semibold text-[#4d875d] transition-colors hover:text-[#376844]"
				>
					{sp.viewSpaces}
				</Link>
			</div>

			<div className="mt-6 h-62.5 w-full min-w-0">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						layout="vertical"
						margin={{
							top: 0,
							right: 8,
							left: 0,
							bottom: 0,
						}}
					>
						<XAxis
							type="number"
							axisLine={false}
							tickLine={false}
							tick={{
								fontSize: 11,
								fill: "#858880",
							}}
						/>

						<YAxis
							type="category"
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{
								fontSize: 12,
								fill: "#343631",
							}}
							width={130}
						/>

						<Tooltip
							cursor={{ fill: "rgba(77, 135, 93, 0.06)" }}
							content={({ active, payload }) => {
								if (!active || !payload?.length) {
									return null;
								}

								const item = payload[0]
									.payload as SpacePerformance;

								return (
									<div className="rounded-xl border border-[#dedfd9] bg-white p-3 shadow-xl">
										<p className="text-xs font-medium text-[#70736c]">
											{item.name}
										</p>
										<p className="mt-1 text-sm font-semibold text-[#20221f]">
											{item.bookings} {sp.bookings}
										</p>
									</div>
								);
							}}
						/>

						<Bar
							dataKey="bookings"
							fill="#4d875d"
							radius={[0, 6, 6, 0]}
							barSize={18}
							animationDuration={650}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-[#eceee8] pt-4 text-xs text-[#70736c]">
				<span className="text-[11px] text-[#858880]">
					{sp.description}
				</span>

				<span className="font-medium text-[#4d875d]">
					{data.reduce((acc, curr) => acc + curr.bookings, 0)}{" "}
					{sp.bookings}
				</span>
			</div>
		</article>
	);
}
