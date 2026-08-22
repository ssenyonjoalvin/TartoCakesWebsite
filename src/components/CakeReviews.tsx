"use client";

import { useEffect, useId, useState } from "react";
import CakeReviewForm from "@/components/CakeReviewForm";
import StarRating from "@/components/StarRating";
import type { PublicReview, ReviewSummary } from "@/lib/reviews";

type Props = {
  cakeId: string;
  cakeName: string;
  reviews: PublicReview[];
  summary: ReviewSummary;
};

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

function starCounts(reviews: PublicReview[]) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) {
      counts[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
    }
  }
  return counts;
}

export default function CakeReviews({
  cakeId,
  cakeName,
  reviews,
  summary,
}: Props) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const counts = starCounts(reviews);
  const barMax = Math.max(...STAR_LEVELS.map((star) => counts[star]), 1);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <section id="reviews" className="mt-12 scroll-mt-24">
      <div className="overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F0] px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-tarto-ink sm:text-xl">
            Customer Feedback
          </h2>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-tarto-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-tarto-red/90"
          >
            Review cake
          </button>
        </div>

        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-[#F0F0F0] px-5 py-5 sm:px-6 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888]">
              Ratings ({summary.count})
            </p>
            <div className="mt-4 rounded-lg bg-[#F7F7F7] px-4 py-5 text-center">
              <p className="text-3xl font-bold text-tarto-ink">
                {summary.count > 0 ? summary.average.toFixed(1) : "—"}
                <span className="text-lg font-semibold text-[#888]">/5</span>
              </p>
              <div className="mt-2 flex justify-center">
                <StarRating value={summary.average} size="md" />
              </div>
              <p className="mt-2 text-xs text-[#888]">
                {summary.count === 0
                  ? `Be the first to review ${cakeName}`
                  : `${summary.count} ${summary.count === 1 ? "rating" : "ratings"}`}
              </p>
            </div>

            <ul className="mt-5 space-y-2">
              {STAR_LEVELS.map((star) => {
                const count = counts[star];
                const width = `${Math.round((count / barMax) * 100)}%`;
                return (
                  <li key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-right font-medium text-[#555]">
                      {star}
                    </span>
                    <span className="text-tarto-orange" aria-hidden>
                      ★
                    </span>
                    <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#EDEDED]">
                      <span
                        className="block h-full rounded-full bg-tarto-orange"
                        style={{ width: summary.count === 0 ? "0%" : width }}
                      />
                    </span>
                    <span className="w-10 text-right text-xs text-[#888]">
                      ({count})
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="px-5 py-5 sm:px-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888]">
              Product reviews ({reviews.length})
            </p>

            {reviews.length === 0 ? (
              <p className="mt-6 rounded-lg border border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-4 py-8 text-sm text-[#777]">
                No reviews yet for this cake.{" "}
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="font-semibold text-tarto-red hover:underline"
                >
                  Review cake
                </button>
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#F0F0F0]">
                {reviews.map((review) => (
                  <li key={review.id} className="py-5 first:pt-3 last:pb-1">
                    <StarRating value={review.rating} />
                    <p className="mt-2 text-sm leading-relaxed text-[#555]">
                      {review.comment}
                    </p>
                    <p className="mt-3 text-xs text-[#8A8A8A]">
                      {review.dateLabel} by {review.name}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id={titleId} className="text-lg font-bold text-tarto-ink">
                  Review cake
                </h3>
                <p className="mt-1 text-sm text-[#777]">
                  Tell others how {cakeName} turned out for your event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-[#888] transition hover:bg-[#F5F5F5] hover:text-tarto-ink"
                aria-label="Close review form"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-5">
              <CakeReviewForm cakeId={cakeId} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
