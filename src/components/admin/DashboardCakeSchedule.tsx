"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DashboardScheduleItem } from "@/lib/admin-dashboard";

type Props = {
  items: DashboardScheduleItem[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isSameDay(a: string, b: string) {
  return a === b;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function DashboardCakeSchedule({ items }: Props) {
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const initialMonth = useMemo(() => {
    const upcoming = items.find((item) => item.dateKey >= todayKey);
    if (upcoming) {
      return { year: upcoming.year, month: upcoming.month };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  }, [items, today, todayKey]);

  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);
  const [selectedKey, setSelectedKey] = useState(() => {
    const onToday = items.some((item) => item.dateKey === todayKey);
    if (onToday) return todayKey;
    const upcoming = items.find((item) => item.dateKey >= todayKey);
    return upcoming?.dateKey ?? todayKey;
  });

  const datesWithOrders = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) set.add(item.dateKey);
    return set;
  }, [items]);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
      return {
        key,
        day: date.getDate(),
        inMonth: date.getMonth() === viewMonth,
        hasOrders: datesWithOrders.has(key),
      };
    });
  }, [viewYear, viewMonth, datesWithOrders]);

  const listItems = useMemo(() => {
    const fromSelected = items.filter((item) => item.dateKey >= selectedKey);
    return fromSelected.slice(0, 6);
  }, [items, selectedKey]);

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  const selectedParsed = parseDateKey(selectedKey);

  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#2B2B2B]">Cake schedule</h2>
          <p className="mt-1 text-sm text-[#777]">
            Days when cakes are needed — based on order event dates.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-tarto-red hover:underline"
        >
          View all orders
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] transition hover:bg-[#F5F5F5]"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <p className="text-sm font-bold text-[#2B2B2B]">
              {monthLabel(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] transition hover:bg-[#F5F5F5]"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((label) => (
              <span
                key={label}
                className="py-1 text-[10px] font-semibold uppercase tracking-wide text-[#AAA]"
              >
                {label}
              </span>
            ))}
            {calendarDays.map((cell) => {
              const selected = isSameDay(cell.key, selectedKey);
              const isToday = isSameDay(cell.key, todayKey);

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedKey(cell.key)}
                  className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition ${
                    selected
                      ? "bg-tarto-red text-white shadow-sm"
                      : cell.inMonth
                        ? "text-[#2B2B2B] hover:bg-[#FFF5F5]"
                        : "text-[#CCC] hover:bg-[#FAFAFA]"
                  } ${isToday && !selected ? "ring-1 ring-tarto-red/30" : ""}`}
                >
                  {cell.day}
                  {cell.hasOrders && !selected ? (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-tarto-red" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {listItems.length > 0 ? (
            listItems.map((item) => {
              const active = isSameDay(item.dateKey, selectedKey);
              return (
                <Link
                  key={item.id}
                  href="/admin/orders"
                  className={`flex items-stretch gap-4 rounded-2xl border transition hover:shadow-sm ${
                    active
                      ? "border-tarto-red bg-tarto-red text-white"
                      : "border-[#F0F0F0] bg-white hover:border-tarto-red/20"
                  }`}
                >
                  <div
                    className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-l-2xl px-2 py-4 ${
                      active ? "text-white" : "text-[#2B2B2B]"
                    }`}
                  >
                    <span className="text-2xl font-bold leading-none">
                      {String(item.day).padStart(2, "0")}
                    </span>
                    <span
                      className={`mt-1 text-[10px] font-semibold uppercase ${
                        active ? "text-white/80" : "text-[#999]"
                      }`}
                    >
                      {new Date(item.year, item.month, item.day).toLocaleDateString(
                        "en-US",
                        { month: "short" }
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3 py-4 pr-4">
                    <div className="min-w-0">
                      <p
                        className={`truncate font-bold ${
                          active ? "text-white" : "text-[#2B2B2B]"
                        }`}
                      >
                        {item.cakeName ?? item.customerName}
                      </p>
                      <p
                        className={`mt-0.5 truncate text-sm ${
                          active ? "text-white/85" : "text-[#777]"
                        }`}
                      >
                        {item.cakeName
                          ? `${item.customerName} · ${item.detail}`
                          : item.detail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          active ? "text-white/90" : "text-[#999]"
                        }`}
                      >
                        {item.statusLabel}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          active ? "text-white/75" : "text-[#AAA]"
                        }`}
                      >
                        {item.code}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E8E8] bg-[#FAFAFA] px-6 text-center">
              <p className="text-sm font-semibold text-[#555]">
                {items.length === 0
                  ? "No upcoming cake dates"
                  : `No cakes needed on ${new Date(
                      selectedParsed.year,
                      selectedParsed.month,
                      selectedParsed.day
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}`}
              </p>
              <p className="mt-1 text-xs text-[#888]">
                {items.length === 0
                  ? "Event dates from new orders will appear here."
                  : "Select another day on the calendar."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
