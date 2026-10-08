"use client";

import { useMemo } from "react";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

type PaginationItem = number | "...";

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginationItems = useMemo<PaginationItem[]>(() => {
    if (totalPages <= 1) {
      return [1];
    }

    // Hiển thị toàn bộ page nếu dataset đủ nhỏ.
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const items: PaginationItem[] = [];

    // Luôn hiển thị page đầu tiên.
    items.push(1);

    if (currentPage <= 4) {
      // Ví dụ:
      // 1 2 3 4 5 ... 100
      items.push(2, 3, 4, 5, "...", totalPages);
      return items;
    }

    if (currentPage >= totalPages - 3) {
      // Ví dụ:
      // 1 ... 96 97 98 99 100
      items.push(
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );

      return items;
    }

    // Current page nằm ở giữa.
    //
    // Ví dụ:
    // 1 ... 49 50 51 ... 100
    items.push(
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages
    );

    return items;
  }, [currentPage, totalPages]);

  if (totalItems === 0) {
    return (
      <span className="text-sm text-[#777973]">
        Showing 0 of 0
      </span>
    );
  }

  const startItem =
    (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Result information */}
      <p className="text-sm text-[#777973]">
        Showing{" "}
        <span className="font-medium text-[#343630]">
          {startItem}-{endItem}
        </span>{" "}
        of{" "}
        <span className="font-medium text-[#343630]">
          {totalItems}
        </span>
      </p>

      {/* Pagination */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d8d8d1] bg-white text-[#686a64] transition-colors hover:bg-[#f5f5f1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>

        {paginationItems.map((item, index) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-[#858680]"
              >
                …
              </span>
            );
          }

          const isCurrentPage = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={
                isCurrentPage ? "page" : undefined
              }
              className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                isCurrentPage
                  ? "bg-[#39724b] text-white"
                  : "border border-[#d8d8d1] bg-white text-[#686a64] hover:bg-[#f5f5f1]"
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d8d8d1] bg-white text-[#686a64] transition-colors hover:bg-[#f5f5f1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}