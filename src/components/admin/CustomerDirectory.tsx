"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TablePagination from "@/components/admin/TablePagination";
import { useTablePagination } from "@/components/admin/useTablePagination";
import { matchesSearch, useAdminSearch } from "@/components/admin/AdminSearch";

export type CustomerInquiry = {
  id: string;
  code: string;
  dateLabel: string;
  occasion: string;
  cakeName: string | null;
  statusLabel: string;
};

export type CustomerRow = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  lastInquiry: string;
  status: "quote" | "newsletter" | "active";
  avatarTone: string;
  inquiries: CustomerInquiry[];
};

const filters = [
  { id: "all", label: "All Customers" },
  { id: "quote", label: "Quote Requested" },
  { id: "newsletter", label: "Newsletter Subscribed" },
  { id: "active", label: "Past Clients" },
] as const;

const statusStyles = {
  quote: "bg-[#E8EFD8] text-[#4F5D2F]",
  newsletter: "bg-[#EBEBEB] text-[#555]",
  active: "bg-tarto-red text-white",
} as const;

const statusLabels = {
  quote: "Quote Requested",
  newsletter: "Newsletter Only",
  active: "Active Order",
} as const;

const MENU_WIDTH = 180;
const MENU_HEIGHT = 220;
const MENU_GAP = 6;
const MENU_EDGE = 12;

type MenuPlacement = {
  id: string;
  top?: number;
  bottom?: number;
  left: number;
};

function placeActionsMenu(
  anchor: DOMRect,
  size: { width: number; height: number } = {
    width: MENU_WIDTH,
    height: MENU_HEIGHT,
  }
): Omit<MenuPlacement, "id"> {
  const spaceBelow = window.innerHeight - anchor.bottom - MENU_EDGE;
  const spaceAbove = anchor.top - MENU_EDGE;
  const openUp = spaceBelow < size.height && spaceAbove > spaceBelow;

  const maxLeft = Math.max(MENU_EDGE, window.innerWidth - size.width - MENU_EDGE);
  const left = Math.min(maxLeft, Math.max(MENU_EDGE, anchor.right - size.width));

  if (openUp) {
    const bottom = window.innerHeight - anchor.top + MENU_GAP;
    if (anchor.top - MENU_GAP - size.height < MENU_EDGE) {
      return { left, top: MENU_EDGE };
    }
    return { left, bottom };
  }

  const top = anchor.bottom + MENU_GAP;
  if (top + size.height > window.innerHeight - MENU_EDGE) {
    return {
      left,
      top: Math.max(MENU_EDGE, window.innerHeight - size.height - MENU_EDGE),
    };
  }
  return { left, top };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type Props = {
  customers: CustomerRow[];
};

export default function CustomerDirectory({ customers }: Props) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [menu, setMenu] = useState<MenuPlacement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const { query } = useAdminSearch();

  const visible = useMemo(() => {
    const byStatus =
      filter === "all"
        ? customers
        : filter === "quote"
          ? customers.filter((c) => c.status === "quote")
          : filter === "newsletter"
            ? customers.filter((c) => c.status === "newsletter")
            : customers.filter((c) => c.status === "active");

    return byStatus.filter((customer) =>
      matchesSearch(
        query,
        customer.name,
        customer.email,
        customer.phone,
        customer.code,
        customer.lastInquiry
      )
    );
  }, [customers, filter, query]);

  const pagination = useTablePagination(visible, `${filter}:${query}`);
  const menuCustomer = menu
    ? (pagination.items.find((item) => item.id === menu.id) ??
      customers.find((item) => item.id === menu.id) ??
      null)
    : null;

  useEffect(() => {
    if (!menu) return;

    function close() {
      setMenu(null);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menu]);

  useLayoutEffect(() => {
    if (!menu || !menuRef.current || !anchorRef.current) return;
    const next = placeActionsMenu(
      anchorRef.current.getBoundingClientRect(),
      {
        width: menuRef.current.offsetWidth,
        height: menuRef.current.offsetHeight,
      }
    );
    if (
      next.left !== menu.left ||
      next.top !== menu.top ||
      next.bottom !== menu.bottom
    ) {
      setMenu({ id: menu.id, ...next });
    }
  }, [menu]);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [selected]);

  function openHistory(customer: CustomerRow) {
    setMenu(null);
    setSelected(customer);
  }

  function toggleMenu(
    customer: CustomerRow,
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    if (menu?.id === customer.id) {
      setMenu(null);
      anchorRef.current = null;
      return;
    }
    anchorRef.current = event.currentTarget;
    setMenu({
      id: customer.id,
      ...placeActionsMenu(event.currentTarget.getBoundingClientRect()),
    });
  }

  async function copyEmail(email: string) {
    setMenu(null);
    if (!email || email === "—") return;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Customer Directory"
        description="Manage your quotes, newsletter subscribers, and client history"
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#333] transition hover:bg-[#F7F7F7]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M12 4v12M8 12l4 4 4-4" />
                <path d="M5 19h14" />
              </svg>
              Export CSV
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-tarto-red/90"
            >
              <span className="text-base leading-none">+</span>
              New Customer
            </button>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMenu(null);
                setFilter(item.id);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-tarto-red text-white"
                  : "border border-[#E0E0E0] bg-white text-[#444] hover:bg-[#F7F7F7]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                <th className="px-5 py-3.5 font-semibold">Name</th>
                <th className="px-5 py-3.5 font-semibold">Email &amp; Phone</th>
                <th className="px-5 py-3.5 font-semibold">Last Inquiry</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.total === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#888]">
                    {query.trim()
                      ? "No customers match this search."
                      : "No customers in this filter yet."}
                  </td>
                </tr>
              ) : (
                pagination.items.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[#F5F5F5] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${customer.avatarTone}`}
                        >
                          {initials(customer.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2B2B2B]">
                            {customer.name}
                          </p>
                          <p className="text-xs text-[#999]">ID: {customer.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#2B2B2B]">{customer.email}</p>
                      <p className="text-xs text-[#999]">{customer.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-[#555]">{customer.lastInquiry}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[customer.status]}`}
                      >
                        {statusLabels[customer.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="View history"
                          aria-label={`View history for ${customer.name}`}
                          onClick={() => openHistory(customer)}
                          className="rounded-lg p-2 text-[#2563EB] transition hover:bg-[#EFF6FF]"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                            <circle cx="12" cy="12" r="8" />
                            <path d="M12 8v4l2.5 2.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="More"
                          aria-label={`More actions for ${customer.name}`}
                          aria-expanded={menu?.id === customer.id}
                          onClick={(event) => toggleMenu(customer, event)}
                          className="rounded-lg p-2 text-[#444] transition hover:bg-[#F5F5F5] hover:text-tarto-red"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(page) => {
            setMenu(null);
            pagination.setPage(page);
          }}
          label="customers"
        />
      </div>

      {menu && menuCustomer ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setMenu(null)}
          />
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 min-w-[180px] rounded-xl border border-[#E8E8E8] bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
            style={{
              top: menu.top,
              bottom: menu.bottom,
              left: menu.left,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => openHistory(menuCustomer)}
              className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
            >
              View history
            </button>
            {menuCustomer.email !== "—" ? (
              <a
                href={`mailto:${menuCustomer.email}`}
                role="menuitem"
                onClick={() => setMenu(null)}
                className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
              >
                Email customer
              </a>
            ) : null}
            {menuCustomer.phone !== "—" ? (
              <a
                href={`tel:${menuCustomer.phone}`}
                role="menuitem"
                onClick={() => setMenu(null)}
                className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
              >
                Call customer
              </a>
            ) : null}
            <button
              type="button"
              role="menuitem"
              onClick={() => copyEmail(menuCustomer.email)}
              className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
            >
              Copy email
            </button>
            <Link
              href="/admin/orders"
              role="menuitem"
              onClick={() => setMenu(null)}
              className="block w-full px-4 py-2 text-left text-sm text-[#444] hover:bg-[#F7F7F7]"
            >
              Open inquiries
            </Link>
          </div>
        </>
      ) : null}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-history-title"
            className="relative z-10 flex max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative shrink-0 border-b border-[#F0F0F0] px-6 pb-5 pt-6">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-[#888] transition hover:bg-[#F5F5F5] hover:text-[#333]"
                aria-label="Close"
              >
                ×
              </button>
              <p className="font-mono text-[11px] font-semibold tracking-wide text-[#999]">
                {selected.code}
              </p>
              <h2
                id="customer-history-title"
                className="mt-1 text-2xl font-bold text-[#2B2B2B]"
              >
                {selected.name}
              </h2>
              <p className="mt-1 text-sm text-[#777]">
                {selected.email} · {selected.phone}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A0A0A0]">
                Inquiry history
              </h3>
              {selected.inquiries.length === 0 ? (
                <p className="mt-3 text-sm text-[#888]">
                  No inquiries on file for this customer yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {selected.inquiries.map((inquiry) => (
                    <li
                      key={inquiry.id}
                      className="rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#2B2B2B]">
                            {inquiry.cakeName ?? inquiry.occasion}
                          </p>
                          <p className="mt-0.5 text-xs text-[#888]">
                            {inquiry.code} · {inquiry.dateLabel} · {inquiry.occasion}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#555]">
                          {inquiry.statusLabel}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
