"use client";

import { useMemo, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TablePagination from "@/components/admin/TablePagination";
import { useTablePagination } from "@/components/admin/useTablePagination";
import {
  deleteReview,
  updateReviewStatus,
} from "@/app/admin/(dashboard)/reviews/actions";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import { matchesSearch, useAdminSearch } from "@/components/admin/AdminSearch";
import type { ReviewStatus } from "@/generated/prisma/client";

export type ReviewRow = {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  cakeName: string;
  cakeSlug: string;
  dateLabel: string;
  avatarTone: string;
};

type Props = {
  reviews: ReviewRow[];
  stats: {
    pending: number;
    approved: number;
    hidden: number;
  };
};

const filters = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "HIDDEN", label: "Hidden" },
] as const;

const statusStyles: Record<ReviewStatus, string> = {
  PENDING: "bg-tarto-red text-white",
  APPROVED: "bg-[#E8EFD8] text-[#4F5D2F]",
  HIDDEN: "bg-[#EBEBEB] text-[#555]",
};

const statusLabels: Record<ReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  HIDDEN: "Hidden",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex text-tarto-orange" aria-label={`${value} stars`}>
      {"★".repeat(value)}
      <span className="text-[#DDD]">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function ReviewManager({ reviews, stats }: Props) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const { query } = useAdminSearch();

  const visible = useMemo(() => {
    const byStatus =
      filter === "all"
        ? reviews
        : reviews.filter((review) => review.status === filter);

    return byStatus.filter((review) =>
      matchesSearch(
        query,
        review.name,
        review.email,
        review.comment,
        review.cakeName,
        review.rating
      )
    );
  }, [reviews, filter, query]);

  const pagination = useTablePagination(visible, `${filter}:${query}`);

  return (
    <div>
      <AdminPageHeader
        title="Cake Reviews"
        description="Approve customer reviews before they appear on cake pages"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
            Pending
          </p>
          <p className="mt-1 text-2xl font-bold text-tarto-red">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-[#EBEBEB] bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
            Approved
          </p>
          <p className="mt-1 text-2xl font-bold text-[#2B2B2B]">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-[#EBEBEB] bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
            Hidden
          </p>
          <p className="mt-1 text-2xl font-bold text-[#2B2B2B]">{stats.hidden}</p>
        </div>
      </div>

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
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Cake</th>
                <th className="px-5 py-3.5 font-semibold">Review</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.total === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#888]">
                    {query.trim()
                      ? "No reviews match this search."
                      : filter === "all"
                      ? "No reviews yet. New customer reviews will show here as Pending until you approve them."
                      : "No reviews in this filter yet."}
                  </td>
                </tr>
              ) : (
                pagination.items.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b border-[#F5F5F5] last:border-0"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${review.avatarTone}`}
                        >
                          {initials(review.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2B2B2B]">
                            {review.name}
                          </p>
                          <p className="text-xs text-[#999]">{review.email}</p>
                          <p className="mt-1 text-xs text-[#999]">
                            {review.dateLabel}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-[#2B2B2B]">{review.cakeName}</p>
                    </td>
                    <td className="max-w-sm px-5 py-4 align-top">
                      <Stars value={review.rating} />
                      <p className="mt-2 text-[#555]">{review.comment}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[review.status]}`}
                      >
                        {statusLabels[review.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {review.status !== "APPROVED" ? (
                          <form action={updateReviewStatus}>
                            <input type="hidden" name="id" value={review.id} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <button
                              type="submit"
                              className="rounded-lg bg-tarto-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-tarto-red/90"
                            >
                              Approve
                            </button>
                          </form>
                        ) : null}
                        {review.status !== "HIDDEN" ? (
                          <form action={updateReviewStatus}>
                            <input type="hidden" name="id" value={review.id} />
                            <input type="hidden" name="status" value="HIDDEN" />
                            <button
                              type="submit"
                              className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-1.5 text-xs font-semibold text-[#444] hover:bg-[#F7F7F7]"
                            >
                              Hide
                            </button>
                          </form>
                        ) : null}
                        <ConfirmDeleteForm
                          action={deleteReview}
                          message={`Delete ${review.name}'s review? This cannot be undone.`}
                        >
                          <input type="hidden" name="id" value={review.id} />
                          <button
                            type="submit"
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-tarto-red hover:bg-[#FBEAEA]"
                          >
                            Delete
                          </button>
                        </ConfirmDeleteForm>
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
          label="reviews"
        />
      </div>
    </div>
  );
}
