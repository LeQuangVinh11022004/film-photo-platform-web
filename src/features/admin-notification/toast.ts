export type AdminToastTone = "success" | "info" | "warning" | "error";

export type AdminToastInput = {
	title: string;
	message?: string;
	tone?: AdminToastTone;
};

type ToastListener = (toast: AdminToastInput) => void;

const listeners = new Set<ToastListener>();

export function subscribeToAdminToasts(listener: ToastListener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

// Transient feedback for an admin action; not stored in the notification inbox.
export function showAdminToast(toast: AdminToastInput) {
	listeners.forEach((listener) => listener(toast));
}
