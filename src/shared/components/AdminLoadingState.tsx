"use client";

import { LoaderCircle } from "lucide-react";
import { useAdminLanguage } from "@/shared/providers/AdminLanguageProvider";

export function AdminLoadingState({ label, mode = "page" }: { label?: string; mode?: "page" | "overlay" }) {
  const { messages } = useAdminLanguage();
  const content = <div className="flex items-center gap-3 text-sm font-medium text-[#4c4e48]"><LoaderCircle aria-hidden="true" size={24} className="admin-loading-spinner text-[#39724b]" /><span>{label ?? messages.common.loading}</span></div>;

  if (mode === "overlay") {
    return <div role="status" aria-live="polite" className="admin-loading-overlay absolute inset-0 z-30 flex items-center justify-center rounded-lg">{content}</div>;
  }

  return <div role="status" aria-live="polite" className="flex min-h-[calc(100vh-12rem)] items-center justify-center">{content}</div>;
}