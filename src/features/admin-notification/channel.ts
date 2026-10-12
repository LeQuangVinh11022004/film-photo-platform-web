import type { AdminNotification } from "./types";

type NotificationListener = (notification: AdminNotification) => void;

const listeners = new Set<NotificationListener>();

export function subscribeToAdminNotifications(listener: NotificationListener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishAdminNotification(notification: AdminNotification) {
	listeners.forEach((listener) => listener(notification));
}