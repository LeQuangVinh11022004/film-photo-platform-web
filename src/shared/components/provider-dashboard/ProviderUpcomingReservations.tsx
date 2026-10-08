import Link from "next/link";

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
	return (
		<article className="rounded-xl border border-[#e2e4dd] bg-white">
			<div className="flex items-start justify-between gap-4 border-b border-[#eeeeea] px-5 py-5 sm:px-6">
				<div>
					<h2 className="text-base font-semibold text-[#20221f]">
						Upcoming reservations
					</h2>

					<p className="mt-1 text-sm text-[#777973]">
						Reservations that need your attention.
					</p>
				</div>

				<Link
					href="/provider/reservations"
					className="shrink-0 text-xs font-semibold text-[#4d875d] hover:text-[#376844]"
				>
					View all
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
									{reservation.status}
								</span>
							</div>

							<p className="mt-1 truncate text-xs text-[#777973]">
								{reservation.space}
							</p>
						</div>

						<div className="shrink-0 text-left sm:text-right">
							<p className="text-xs font-semibold text-[#4b4e47]">
								{reservation.date}
							</p>

							<p className="mt-1 text-xs text-[#858880]">
								{reservation.time}
							</p>
						</div>
					</div>
				))}
			</div>
		</article>
	);
}