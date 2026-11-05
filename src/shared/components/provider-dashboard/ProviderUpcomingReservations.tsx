"use client";

import Link from "next/link";
import { useProviderLanguage } from "@/shared/providers/ProviderLanguageProvider";

type UpcomingReservation = {
	id: string;
	customer: string;
	space: string;
	date: string;
	time: string;
	status: "Confirmed" | "Pending";
};

type ProviderUpcomingReservationsProps = {
	data: UpcomingReservation[];
};

export function ProviderUpcomingReservations({
	data,
}: ProviderUpcomingReservationsProps) {
	const { messages } = useProviderLanguage();
	const u = messages.dashboard.upcoming;
	const s = messages.dashboard.status;

	const statusLabelMap: Record<string, string> = {
		Confirmed: s.confirmed,
		Pending: s.pending,
	};

	return (
		<article className="rounded-xl border border-[#e2e4dd] bg-white">
			<div className="flex items-start justify-between gap-4 border-b border-[#eeeeea] px-5 py-5 sm:px-6">
				<div>
					<h2 className="text-base font-semibold text-[#20221f]">
						{u.title}
					</h2>

					<p className="mt-1 text-sm text-[#777973]">
						{u.description}
					</p>
				</div>

				<Link
					href="/provider/reservations"
					className="shrink-0 text-xs font-semibold text-[#4d875d] hover:text-[#376844]"
				>
					{u.viewAll}
				</Link>
			</div>

			<div className="divide-y divide-[#eeeeea]">
				{data.map((reservation) => (
					<div
						key={reservation.id}
						className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#fafbf8] sm:flex-row sm:items-center sm:px-6"
					>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<p className="truncate text-sm font-semibold text-[#292b27]">
									{reservation.customer}
								</p>

								<span
									className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
										reservation.status === "Confirmed"
											? "bg-[#e6f0e8] text-[#39724b]"
											: "bg-[#f8edd9] text-[#9a6a20]"
									}`}
								>
									{statusLabelMap[reservation.status] ?? reservation.status}
								</span>
							</div>

							<p className="mt-1 text-xs text-[#70736c]">
								{reservation.space}
							</p>
						</div>

						<div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
							<span className="text-xs font-medium text-[#20221f]">
								{reservation.date === "Today"
									? u.today
									: reservation.date === "Tomorrow"
									? u.tomorrow
									: reservation.date}
							</span>

							<span className="text-[11px] text-[#858880]">
								{reservation.time}
							</span>
						</div>
					</div>
				))}
			</div>
		</article>
	);
}
