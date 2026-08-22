"use client";

import Link from "next/link";
import { getPageNumbers } from "@/lib/table-pagination";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange?: (page: number) => void;
  hrefForPage?: (page: number) => string;
  label?: string;
};

function PageButton({
  pageNumber,
  active,
  onClick,
  href,
}: {
  pageNumber: number;
  active: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const className = `min-w-8 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold ${
    active
      ? "bg-tarto-red text-white"
      : "text-[#555] hover:bg-[#F5F5F5]"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {pageNumber}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {pageNumber}
    </button>
  );
}

export default function TablePagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  hrefForPage,
  label = "records",
}: Props) {
  if (total === 0) return null;

  const pageNumbers = getPageNumbers(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const prevClass = `rounded-lg px-2.5 py-1.5 ${
    prevDisabled
      ? "pointer-events-none text-[#CCC]"
      : "text-[#555] hover:bg-[#F5F5F5]"
  }`;
  const nextClass = `rounded-lg px-2.5 py-1.5 ${
    nextDisabled
      ? "pointer-events-none text-[#CCC]"
      : "text-[#555] hover:bg-[#F5F5F5]"
  }`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F0F0] px-5 py-3.5 text-sm text-[#777]">
      <p>
        Showing {from} to {to} of {total} {label}
      </p>
      <div className="flex items-center gap-1">
        {hrefForPage ? (
          <>
            <Link
              href={hrefForPage(Math.max(1, page - 1))}
              aria-disabled={prevDisabled}
              className={prevClass}
            >
              ‹
            </Link>
            {pageNumbers.map((pageNumber) => (
              <PageButton
                key={pageNumber}
                pageNumber={pageNumber}
                active={pageNumber === page}
                href={hrefForPage(pageNumber)}
              />
            ))}
            <Link
              href={hrefForPage(Math.min(totalPages, page + 1))}
              aria-disabled={nextDisabled}
              className={nextClass}
            >
              ›
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              aria-label="Previous page"
              disabled={prevDisabled}
              onClick={() => onPageChange?.(page - 1)}
              className={prevClass}
            >
              ‹
            </button>
            {pageNumbers.map((pageNumber) => (
              <PageButton
                key={pageNumber}
                pageNumber={pageNumber}
                active={pageNumber === page}
                onClick={() => onPageChange?.(pageNumber)}
              />
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={nextDisabled}
              onClick={() => onPageChange?.(page + 1)}
              className={nextClass}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
