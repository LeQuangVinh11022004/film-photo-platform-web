"use client";

import {
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

type StatusItem = {
	name: string;
	value: number;
};

type ProviderReservationStatusProps = {
	data: StatusItem[];
	total: number;
};

const COLORS = ["#4d875d", "#c89b42", "#647c98", "#bf6a59"];

export function ProviderReservationStatus({
	data,
	total,
}: ProviderReservationStatusProps) {
	return (
		<article className="rounded-xl border border-[#e2e4dd] bg-white p-5 sm:p-6">
			<div>
				<h2 className="text-base font-semibold text-[#20221f]">
					Reservation status
				</h2>

				<p className="mt-1 text-sm text-[#777973]">
					Current booking distribution.
				</p>
			</div>

			<div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
				<div className="relative h-44 w-44 shrink-0">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								innerRadius={57}
								outerRadius={78}
								paddingAngle={2}
								stroke="none"
								animationDuration={700}
							>
								{data.map((item, index) => (
									<Cell
										key={item.name}
										fill={COLORS[index % COLORS.length]}
										className="cursor-pointer opacity-90 transition-opacity duration-200 hover:opacity-70"
									/>
								))}
							</Pie>

							<Tooltip
								content={({ active, payload }) => {
									if (!active || !payload?.length) {
										return null;
									}

									const item = payload[0];

									return (
										<div className="rounded-lg border border-[#dedfd9] bg-white px-3 py-2 shadow-lg">
											<p className="text-xs font-medium text-[#70736c]">
												{item.name}
											</p>
											<p className="mt-1 text-sm font-semibold text-[#20221f]">
												{item.value}
											</p>
										</div>
									);
								}}
							/>
						</PieChart>
					</ResponsiveContainer>

					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-2xl font-semibold text-[#20221f]">
							{total}
						</span>
						<span className="mt-1 text-[10px] uppercase tracking-wider text-[#858880]">
							Reservations
						</span>
					</div>
				</div>

				<ul className="w-full max-w-xs space-y-3">
					{data.map((item, index) => {
						const percentage =
							total > 0
								? Math.round((item.value / total) * 100)
								: 0;

						return (
							<li
								key={item.name}
								className="flex items-center gap-3 text-sm"
							>
								<span
									className="h-2.5 w-2.5 shrink-0 rounded-full"
									style={{
										backgroundColor:
											COLORS[index % COLORS.length],
									}}
								/>

								<span className="min-w-0 flex-1 truncate text-[#555850]">
									{item.name}
								</span>

								<span className="font-semibold text-[#292b27]">
									{item.value}
								</span>

								<span className="w-8 text-right text-xs text-[#858880]">
									{percentage}%
								</span>
							</li>
						);
					})}
				</ul>
			</div>

			<a
				href="/provider/reservations"
				className="mt-6 block border-t border-[#eeeeea] pt-4 text-xs font-semibold text-[#4d875d] transition-colors hover:text-[#376844]"
			>
				View all reservations →
			</a>
		</article>
	);
}