"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmDeleteDialogProps = {
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	error?: string;
	confirming?: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export function ConfirmDeleteDialog({
	title,
	description,
	confirmLabel = "Delete",
	cancelLabel = "Cancel",
	error,
	confirming = false,
	onCancel,
	onConfirm,
}: ConfirmDeleteDialogProps) {
	return (
		<div
			className="fixed inset-0 z-70 flex items-center justify-center bg-[#171815]/45 p-4"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && !confirming) onCancel();
			}}
		>
			<section
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="confirm-delete-title"
				aria-describedby="confirm-delete-description"
				className="w-full max-w-md rounded-lg border border-[#e0e0da] bg-white shadow-xl"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<header className="flex items-start justify-between gap-4 border-b border-[#eeeeea] px-5 py-4">
					<div className="flex items-start gap-3">
						<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#fbefed] text-[#a34d42]">
							<AlertTriangle size={18} />
						</span>
						<div>
							<h2 id="confirm-delete-title" className="text-base font-semibold text-[#20221f]">{title}</h2>
							<p id="confirm-delete-description" className="mt-1 text-sm leading-5 text-[#686a64]">{description}</p>
						</div>
					</div>
					<button type="button" onClick={onCancel} disabled={confirming} aria-label="Close confirmation" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#777973] hover:bg-[#f0f0ec] disabled:opacity-50">
						<X size={17} />
					</button>
				</header>
				<div className="px-5 py-4">
					{error && <p role="alert" className="mb-3 rounded-md border border-[#e6c3bd] bg-[#fbefed] px-3 py-2 text-sm text-[#9c4339]">{error}</p>}
					<div className="flex justify-end gap-2">
						<button type="button" onClick={onCancel} disabled={confirming} className="h-9 rounded-md border border-[#d8d8d1] px-4 text-sm font-semibold text-[#454741] hover:bg-[#f7f7f3] disabled:opacity-50">{cancelLabel}</button>
						<button type="button" onClick={onConfirm} disabled={confirming} className="h-9 rounded-md bg-[#a34d42] px-4 text-sm font-semibold text-white hover:bg-[#883c33] disabled:cursor-wait disabled:opacity-60">{confirming ? "Deleting…" : confirmLabel}</button>
					</div>
				</div>
			</section>
		</div>
	);
}