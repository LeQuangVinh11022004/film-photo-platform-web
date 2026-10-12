"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { subscribeToAdminNotifications } from "@/features/admin-notification/channel";
import type { AdminNotification } from "@/features/admin-notification/types";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";

export type DashboardNotification = {
	id: string;
	title: string;
	detail: string;
	time: string;
	href: string;
};

export function AdminNotificationCenter({ notifications }: { notifications: DashboardNotification[] }) {
	const { locale, messages } = useAdminLanguage();
	const t = messages.dashboard;
	const [incoming, setIncoming] = useState<AdminNotification[]>([]);
	const [readIds, setReadIds] = useState<string[]>([]);
	const [dismissedIds, setDismissedIds] = useState<string[]>([]);
	const [notificationsOpen, setNotificationsOpen] = useState(false);

	useEffect(() => subscribeToAdminNotifications((notification) => {
		setIncoming((current) => [notification, ...current.filter((item) => item.id !== notification.id)]);
	}), []);

	useEffect(() => {
		if (!notificationsOpen) return;
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") setNotificationsOpen(false);
		}
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [notificationsOpen]);

	const incomingRows: DashboardNotification[] = incoming.map((item) => ({
		id: item.id,
		title: item.title,
		detail: item.message,
		time: new Date(item.createdAt).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", { hour: "numeric", minute: "2-digit" }),
		href: item.href ?? "/admin/dashboard",
	}));
	const rows = [...incomingRows, ...notifications]
		.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
		.filter((item) => !dismissedIds.includes(item.id))
		.map((item) => ({ ...item, isRead: readIds.includes(item.id) || incoming.find((incomingItem) => incomingItem.id === item.id)?.isRead === true }));
	const unreadCount = rows.filter((item) => !item.isRead).length;

	function markRead(id: string) {
		setReadIds((current) => current.includes(id) ? current : [...current, id]);
	}

	function dismiss(id: string) {
		setDismissedIds((current) => current.includes(id) ? current : [...current, id]);
	}

	return <>
		<div className="relative">
			<button type="button" aria-label={`${t.notifications} (${unreadCount} ${t.unread.toLowerCase()})`} aria-expanded={notificationsOpen} aria-haspopup="dialog" onClick={() => setNotificationsOpen((open) => !open)} className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#d8d8d1] bg-white text-[#454741] transition-colors hover:bg-[#f7f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39724b]">
				<Bell size={17} aria-hidden="true" />
				{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#bf6a59] px-1 text-[10px] font-bold leading-none text-white">{unreadCount}</span>}
			</button>
			{notificationsOpen && <section role="dialog" aria-label={t.notifications} className="fixed left-2 right-2 top-72 z-50 max-h-[calc(100vh-19rem)] overflow-y-auto rounded-lg border border-[#deded8] bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:max-h-[calc(100vh-6rem)] sm:w-[min(22rem,calc(100vw-2rem))]">
				<div className="flex items-center justify-between border-b border-[#e8e8e2] px-4 py-3">
					<div><h2 className="text-sm font-semibold text-[#20221f]">{t.notifications}</h2><p className="mt-0.5 text-xs text-[#777973]">{unreadCount} {t.unread.toLowerCase()}</p></div>
					<button type="button" onClick={() => setNotificationsOpen(false)} aria-label={messages.common.close} className="flex h-8 w-8 items-center justify-center rounded-md text-[#686a64] hover:bg-[#f0f0ec]"><X size={16} /></button>
				</div>
				<ul className="divide-y divide-[#eeeeea]">
					{rows.map((item) => <li key={item.id} className={`flex gap-1 px-2 ${item.isRead ? "opacity-60" : ""}`}>
						<Link href={item.href} onClick={() => { markRead(item.id); setNotificationsOpen(false); }} className="flex min-w-0 flex-1 gap-3 px-2 py-3 transition-colors hover:bg-[#fafaf8]">
							<span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#e5f0e8] text-[#39724b]"><Bell size={15} /></span>
							<span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-[#292b27]">{item.title}</span>{!item.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#39724b]" />}</span><span className="mt-1 block text-xs leading-5 text-[#777973]">{item.detail}</span><span className="mt-1 block text-[11px] text-[#858680]">{item.time}</span></span>
						</Link>
						<button type="button" onClick={() => dismiss(item.id)} aria-label={`${t.dismissNotification}: ${item.title}`} className="my-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#777973] hover:bg-[#f5e4e1] hover:text-[#a34d42]"><Trash2 size={15} /></button>
					</li>)}
					{rows.length === 0 && <li className="px-4 py-8 text-center text-sm text-[#777973]">{t.noNotifications}</li>}
				</ul>
				<button type="button" disabled={unreadCount === 0} onClick={() => setReadIds(rows.map((item) => item.id))} className="flex w-full items-center justify-center gap-2 border-t border-[#e8e8e2] px-4 py-3 text-xs font-semibold text-[#39724b] transition-colors hover:bg-[#fafaf8] disabled:cursor-default disabled:text-[#858680]"><CheckCheck size={15} />{t.markAllRead}</button>
			</section>}
		</div>
	</>;
}