"use client";

import { useMemo, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";

export type OrderUiStatus = "new" | "responded" | "fulfilled" | "cancelled";

export type OrderRow = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  dateLabel: string;
  occasion: string;
  occasionTone: "wedding" | "birthday" | "corporate" | "anniversary" | "custom";
  status: OrderUiStatus;
  dbStatus: string;
  message: string;
  cakeName: string | null;
  size: string | null;
  flavor: string | null;
  avatarTone: string;
};

type Props = {
  orders: OrderRow[];
  stats: {
    newInquiries: number;
    newToday: number;
    pendingQuotes: number;
    fulfilledMonth: number;
  };
};

const statusFilters = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "responded", label: "Responded" },
  { id: "fulfilled", label: "Fulfilled" },
] as const;

const statusStyles: Record<OrderUiStatus, string> = {
  new: "bg-tarto-red text-white",
  responded: "bg-[#F3E0A8] text-[#7A5A12]",
  fulfilled: "bg-[#EBEBEB] text-[#555]",
  cancelled: "bg-[#F5E8E8] text-[#8A4A4A]",
};

const statusLabels: Record<OrderUiStatus, string> = {
  new: "New",
  responded: "Responded",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

const occasionStyles: Record<OrderRow["occasionTone"], string> = {
  wedding: "bg-[#F8E9B8] text-[#7A5A12]",
  birthday: "bg-[#E8EEF6] text-[#4A5F7A]",
  corporate: "bg-[#EBEBEB] text-[#555]",
  anniversary: "bg-[#F0E8F0] text-[#6A4A6A]",
  custom: "bg-[#F5F0E8] text-[#6A5A40]",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function OccasionIcon({ tone }: { tone: OrderRow["occasionTone"] }) {
  const className = "h-3.5 w-3.5 fill-none stroke-current stroke-2";
  if (tone === "wedding") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <circle cx="9" cy="12" r="3" />
        <circle cx="15" cy="12" r="3" />
      </svg>
    );
  }
  if (tone === "birthday") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M4 14h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
        <path d="M8 14V9h8v5" />
        <path d="M12 9V6" />
      </svg>
    );
  }
  if (tone === "corporate") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (tone === "anniversary") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 4v16M8 8h8M7 12h10M9 16h6" />
    </svg>
  );
}

function exportCsv(rows: OrderRow[]) {
  const header = [
    "Order ID",
    "Customer",
    "Email",
    "Phone",
    "Date Received",
    "Occasion",
    "Status",
    "Cake",
    "Message",
  ];
  const lines = rows.map((row) =>
    [
      row.code,
      row.name,
      row.email,
      row.phone,
      row.dateLabel,
      row.occasion,
      statusLabels[row.status],
      row.cakeName ?? "",
      row.message.replace(/\s+/g, " ").trim(),
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tarto-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function OrderManager({ orders, stats }: Props) {
  const [filter, setFilter] =
    useState<(typeof statusFilters)[number]["id"]>("all");
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  return (
    <div>
      <AdminPageHeader
        title="Order Management"
        description="Manage incoming requests and custom cake quotes."
        actions={
          <>
            <button
              type="button"
              onClick={() =>
                document.getElementById("order-status-filters")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
              className="inline-flex items-center gap-2 rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#333] transition hover:bg-[#F7F7F7]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M4 6h16" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>
              Filter
            </button>
            <button
              type="button"
              onClick={() => exportCsv(visible)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#333] transition hover:bg-[#F7F7F7]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M12 4v10" />
                <path d="m8 10 4 4 4-4" />
                <path d="M5 18h14" />
              </svg>
              Export
            </button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                New Inquiries
              </p>
              <p className="mt-2 text-3xl font-bold text-[#2B2B2B]">
                {stats.newInquiries}
              </p>
              {stats.newToday > 0 ? (
                <p className="mt-1 text-xs font-semibold text-tarto-red">
                  +{stats.newToday} today
                </p>
              ) : (
                <p className="mt-1 text-xs text-[#999]">No new today</p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEAEA] text-tarto-red">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                Pending Quotes
              </p>
              <p className="mt-2 text-3xl font-bold text-[#2B2B2B]">
                {stats.pendingQuotes}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E9B8] text-[#9A7A20]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M8 4h8v16H8z" />
                <path d="M10 8h4M10 12h4M10 16h3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                Fulfilled (Month)
              </p>
              <p className="mt-2 text-3xl font-bold text-[#2B2B2B]">
                {stats.fulfilledMonth}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E0A8] text-[#8A6A18]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                <circle cx="12" cy="12" r="8" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div
          id="order-status-filters"
          className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
            Filter by Status
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusFilters.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-tarto-red text-white"
                      : "border border-[#E0E0E0] bg-white text-[#555] hover:bg-[#F7F7F7]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Date Received</th>
                <th className="px-5 py-3.5">Occasion</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#888]">
                    No orders in this filter yet.
                  </td>
                </tr>
              ) : (
                visible.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#F5F5F5] last:border-0"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[#666]">
                      {order.code}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${order.avatarTone}`}
                        >
                          {initials(order.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2B2B2B]">
                            {order.name}
                          </p>
                          <p className="text-xs text-[#999]">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#555]">{order.dateLabel}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          occasionStyles[order.occasionTone]
                        }`}
                      >
                        <OccasionIcon tone={order.occasionTone} />
                        {order.occasion}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status === "responded" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        ) : null}
                        {order.status === "fulfilled" ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3 w-3 fill-none stroke-current stroke-2"
                            aria-hidden
                          >
                            <path d="m5 12 5 5L20 7" />
                          </svg>
                        ) : null}
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="View"
                          aria-label={`View ${order.code}`}
                          onClick={() => {
                            setMenuId(null);
                            setSelected(order);
                          }}
                          className="rounded-lg p-2 text-[#777] transition hover:bg-[#F5F5F5]"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-none stroke-current stroke-2"
                            aria-hidden
                          >
                            <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="More"
                          aria-label={`More actions for ${order.code}`}
                          onClick={() =>
                            setMenuId((current) =>
                              current === order.id ? null : order.id
                            )
                          }
                          className="rounded-lg p-2 text-[#777] transition hover:bg-[#F5F5F5]"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-current"
                            aria-hidden
                          >
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>

                        {menuId === order.id ? (
                          <div className="absolute right-0 top-10 z-20 min-w-[160px] rounded-xl border border-[#E8E8E8] bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                            {order.status === "new" ? (
                              <form action={updateOrderStatus}>
                                <input type="hidden" name="id" value={order.id} />
                                <input type="hidden" name="status" value="CONTACTED" />
                                <button
                                  type="submit"
                                  className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
                                >
                                  Mark responded
                                </button>
                              </form>
                            ) : null}
                            {order.status !== "fulfilled" ? (
                              <form action={updateOrderStatus}>
                                <input type="hidden" name="id" value={order.id} />
                                <input type="hidden" name="status" value="COMPLETED" />
                                <button
                                  type="submit"
                                  className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
                                >
                                  Mark fulfilled
                                </button>
                              </form>
                            ) : null}
                            {order.status !== "new" ? (
                              <form action={updateOrderStatus}>
                                <input type="hidden" name="id" value={order.id} />
                                <input type="hidden" name="status" value="NEW" />
                                <button
                                  type="submit"
                                  className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
                                >
                                  Mark as new
                                </button>
                              </form>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                setSelected(order);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
                            >
                              View details
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/45 p-4 backdrop-blur-[2px]"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#F0F0F0] bg-[linear-gradient(135deg,#FFF8F8_0%,#FFFFFF_55%,#FFF9EF_100%)] px-6 pb-5 pt-6">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-[#888] transition hover:bg-white/80 hover:text-[#333]"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>

              <div className="flex items-start gap-4 pr-10">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm ${selected.avatarTone}`}
                >
                  {initials(selected.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[11px] font-semibold tracking-wide text-[#999]">
                      {selected.code}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        statusStyles[selected.status]
                      }`}
                    >
                      {statusLabels[selected.status]}
                    </span>
                  </div>
                  <h2
                    id="order-detail-title"
                    className="mt-1 truncate text-2xl font-bold tracking-tight text-[#2B2B2B]"
                  >
                    {selected.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#777]">{selected.dateLabel}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-5">
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A0A0A0]">
                  Contact
                </h3>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-start gap-3 rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] px-3.5 py-3 transition hover:border-[#E8D0D0] hover:bg-[#FFF8F8]"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-tarto-red shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                        <path d="M4 6h16v12H4z" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#999]">
                        Email
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-medium text-[#2B2B2B]">
                        {selected.email}
                      </span>
                    </span>
                  </a>
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-start gap-3 rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] px-3.5 py-3 transition hover:border-[#E8D0D0] hover:bg-[#FFF8F8]"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-tarto-red shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                        <path d="M6.5 4h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 13l4 1.5v3A2 2 0 0 1 18 19.5 14.5 14.5 0 0 1 4.5 6 2 2 0 0 1 6.5 4Z" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#999]">
                        Phone
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-medium text-[#2B2B2B]">
                        {selected.phone}
                      </span>
                    </span>
                  </a>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A0A0A0]">
                  Order details
                </h3>
                <div className="mt-2.5 rounded-2xl border border-[#F0F0F0] bg-white p-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        occasionStyles[selected.occasionTone]
                      }`}
                    >
                      <OccasionIcon tone={selected.occasionTone} />
                      {selected.occasion}
                    </span>
                    {selected.cakeName ? (
                      <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-3 py-1.5 text-xs font-semibold text-[#444]">
                        {selected.cakeName}
                      </span>
                    ) : null}
                    {selected.size ? (
                      <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-3 py-1.5 text-xs font-semibold text-[#444]">
                        {selected.size}
                      </span>
                    ) : null}
                    {selected.flavor ? (
                      <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-3 py-1.5 text-xs font-semibold text-[#444]">
                        {selected.flavor}
                      </span>
                    ) : null}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A0A0A0]">
                  Customer message
                </h3>
                <div className="mt-2.5 rounded-2xl border border-[#F3E8D8] bg-[#FFFBF4] px-4 py-3.5">
                  <p className="text-sm leading-relaxed text-[#3A3A3A]">
                    {selected.message || "No message provided."}
                  </p>
                </div>
              </section>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F0F0] bg-[#FAFAFA] px-6 py-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#666] transition hover:bg-white hover:text-[#333]"
              >
                Close
              </button>
              <div className="flex flex-wrap gap-2">
                {selected.status === "new" ? (
                  <form action={updateOrderStatus}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="status" value="CONTACTED" />
                    <button
                      type="submit"
                      className="rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#333] transition hover:bg-[#F7F7F7]"
                    >
                      Mark responded
                    </button>
                  </form>
                ) : null}
                {selected.status !== "fulfilled" ? (
                  <form action={updateOrderStatus}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="status" value="COMPLETED" />
                    <button
                      type="submit"
                      className="rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-tarto-red/90"
                    >
                      Mark fulfilled
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
