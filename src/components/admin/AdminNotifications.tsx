"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AdminNotificationSummary } from "@/lib/admin-notifications";

function badgeLabel(count: number) {
  if (count > 99) return "99+";
  return String(count);
}

export default function AdminNotifications({
  summary,
}: {
  summary: AdminNotificationSummary;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={
          summary.total > 0
            ? `Notifications, ${summary.total} unread`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex rounded-full p-2 text-[#666] transition hover:bg-[#F3F3F3] hover:text-tarto-ink"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-[1.8]"
          aria-hidden
        >
          <path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        {summary.total > 0 ? (
          <span className="absolute right-0.5 top-0.5 min-w-[1.05rem] rounded-full bg-tarto-red px-1 text-center text-[10px] font-bold leading-[1.05rem] text-white">
            {badgeLabel(summary.total)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[3.75rem] max-sm:w-auto">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3">
            <p className="text-sm font-bold text-tarto-ink">Notifications</p>
            {summary.total > 0 ? (
              <span className="text-xs font-semibold text-tarto-red">
                {summary.total} waiting
              </span>
            ) : null}
          </div>

          {summary.items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#777]">
              You&apos;re all caught up. New quotes and reviews will show up
              here.
            </p>
          ) : (
            <ul className="max-h-[min(24rem,70vh)] overflow-y-auto py-1">
              {summary.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition hover:bg-[#F7F7F7]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-tarto-ink">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-[#999]">
                        {item.timeLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#666]">{item.detail}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-2 gap-px border-t border-[#F0F0F0] bg-[#F0F0F0]">
            <Link
              href="/admin/orders"
              onClick={() => setOpen(false)}
              className="bg-white px-3 py-2.5 text-center text-xs font-semibold text-[#555] transition hover:bg-[#F7F7F7] hover:text-tarto-red"
            >
              Inquiries
              {summary.newInquiries > 0 ? ` (${summary.newInquiries})` : ""}
            </Link>
            <Link
              href="/admin/reviews"
              onClick={() => setOpen(false)}
              className="bg-white px-3 py-2.5 text-center text-xs font-semibold text-[#555] transition hover:bg-[#F7F7F7] hover:text-tarto-red"
            >
              Reviews
              {summary.pendingReviews > 0 ? ` (${summary.pendingReviews})` : ""}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
