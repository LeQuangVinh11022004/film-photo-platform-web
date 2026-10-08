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
	return (
		<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-base font-semibold text-[#20221f]">
						Space performance
					</h2>

					<p className="mt-1 text-sm text-[#777973]">
						Most booked creative spaces.
					</p>
				</div>

				<Link
					href="/provider/creative-spaces"
					className="shrink-0 text-xs font-semibold text-[#4d875d] transition-colors hover:text-[#376844]"
				>
					View spaces
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
								fontSize: 10,
								fill: "#858880",
							}}
						/>

						<YAxis
							type="category"
							dataKey="name"
							width={105}
							axisLine={false}
							tickLine={false}
							tick={{
								fontSize: 11,
								fill: "#555850",
							}}
						/>

						<Tooltip
							cursor={{ fill: "#f6f7f3" }}
							formatter={(value) => [
								`${value} bookings`,
								"Bookings",
							]}
						/>

						<Bar
							dataKey="bookings"
							fill="#4d875d"
							radius={[0, 5, 5, 0]}
							barSize={22}
							animationDuration={700}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</article>
	);
}