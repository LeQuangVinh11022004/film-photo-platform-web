"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { subscribeToAdminNotifications } from "@/features/admin-notification/channel";
import { subscribeToAdminToasts, type AdminToastInput, type AdminToastTone } from "@/features/admin-notification/toast";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";

type ToastItem = Required<Pick<AdminToastInput, "title" | "tone">> & { id: number; message?: string };

const toneStyles: Record<AdminToastTone, { icon: LucideIcon; badge: string; bar: string }> = {
	success: { icon: CircleCheck, badge: "bg-[#e5f0e8] text-[#39724b]", bar: "bg-[#39724b]" },
	info: { icon: Info, badge: "bg-[#e6ebf2] text-[#526784]", bar: "bg-[#647c98]" },
	warning: { icon: TriangleAlert, badge: "bg-[#f8edd9] text-[#93651e]", bar: "bg-[#d4a33b]" },
	error: { icon: CircleAlert, badge: "bg-[#f5e4e1] text-[#a34d42]", bar: "bg-[#bf6a59]" },
};

const toastDuration = 5000;
const maxToasts = 3;

export function AdminToastHost() {
	const { messages } = useAdminLanguage();
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const nextId = useRef(0);
	const timers = useRef(new Map<number, number>());

	function dismiss(id: number) {
		window.clearTimeout(timers.current.get(id));
		timers.current.delete(id);
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}

	useEffect(() => {
		const activeTimers = timers.current;
		function push(input: AdminToastInput) {
			const id = nextId.current++;
			setToasts((current) => [...current, { id, title: input.title, message: input.message, tone: input.tone ?? "success" }].slice(-maxToasts));
			activeTimers.set(id, window.setTimeout(() => {
				activeTimers.delete(id);
				setToasts((current) => current.filter((toast) => toast.id !== id));
			}, toastDuration));
		}
		const stopToasts = subscribeToAdminToasts(push);
		const stopNotifications = subscribeToAdminNotifications((notification) => push({ title: notification.title, message: notification.message, tone: "info" }));
		return () => {
			stopToasts();
			stopNotifications();
			activeTimers.forEach((timer) => window.clearTimeout(timer));
			activeTimers.clear();
		};
	}, []);

	return (
		<div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-4 z-60 flex flex-col gap-2 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-20 sm:w-92">
			{toasts.map((toast) => {
				const { icon: Icon, badge, bar } = toneStyles[toast.tone];
				return (
					<div key={toast.id} className="admin-toast pointer-events-auto relative overflow-hidden rounded-lg border border-[#deded8] bg-white shadow-xl">
						<div className="flex gap-3 p-4">
							<span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${badge}`}><Icon size={18} aria-hidden="true" /></span>
							<div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#20221f]">{toast.title}</p>{toast.message && <p className="mt-1 text-xs leading-5 text-[#686a64]">{toast.message}</p>}</div>
							<button type="button" onClick={() => dismiss(toast.id)} aria-label={messages.common.close} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#686a64] hover:bg-[#f0f0ec]"><X size={15} /></button>
						</div>
						<span aria-hidden="true" className={`admin-toast-timer absolute inset-x-0 bottom-0 h-0.5 ${bar}`} style={{ animationDuration: `${toastDuration}ms` }} />
					</div>
				);
			})}
		</div>
	);
}
