"use client";

import { useMemo, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TablePagination from "@/components/admin/TablePagination";
import { useTablePagination } from "@/components/admin/useTablePagination";

export type CustomerRow = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  lastInquiry: string;
  status: "quote" | "newsletter" | "active";
  avatarTone: string;
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

  const visible = useMemo(() => {
    if (filter === "all") return customers;
    if (filter === "quote") return customers.filter((c) => c.status === "quote");
    if (filter === "newsletter") {
      return customers.filter((c) => c.status === "newsletter");
    }
    return customers.filter((c) => c.status === "active");
  }, [customers, filter]);

  const pagination = useTablePagination(visible, filter);

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
              onClick={() => setFilter(item.id)}
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
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.total === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#888]">
                    No customers in this filter yet.
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
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="View history"
                          className="rounded-lg p-2 text-[#777] transition hover:bg-[#F5F5F5] hover:text-tarto-red"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <circle cx="12" cy="12" r="8" />
                            <path d="M12 8v4l2.5 2.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="More actions"
                          className="rounded-lg p-2 text-[#777] transition hover:bg-[#F5F5F5] hover:text-tarto-red"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
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
          onPageChange={pagination.setPage}
          label="customers"
        />
      </div>
    </div>
  );
}
