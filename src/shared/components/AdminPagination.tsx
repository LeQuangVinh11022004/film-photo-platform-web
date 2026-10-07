"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminMessages } from "@/shared/i18n/adminMessages";

export function AdminPagination({ page, pageSize, total, onPageChange, messages }: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  messages: AdminMessages["common"];
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav aria-label={messages.pagination} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e8e2] px-4 py-3 sm:px-5">
      <p aria-live="polite" className="text-xs text-[#777973]">
        {messages.paginationShowing.replace("{from}", start.toString()).replace("{to}", end.toString()).replace("{total}", total.toString())}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={messages.previousPage} title={messages.previousPage} disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d8d8d1] text-[#454741] transition-colors hover:bg-[#f7f7f3] disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span aria-current="page" className="min-w-16 text-center text-xs font-medium text-[#4c4e48]">
          {messages.paginationPage.replace("{page}", page.toString()).replace("{total}", totalPages.toString())}
        </span>
        <button type="button" aria-label={messages.nextPage} title={messages.nextPage} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d8d8d1] text-[#454741] transition-colors hover:bg-[#f7f7f3] disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}