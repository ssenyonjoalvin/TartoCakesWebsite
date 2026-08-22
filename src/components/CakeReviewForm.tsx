"use client";

import { useActionState, useState } from "react";
import {
  submitCakeReview,
  type ReviewFormState,
} from "@/app/(site)/reviews/actions";

const initialState: ReviewFormState = {};

const fieldClass =
  "mt-1.5 w-full rounded-md border border-tarto-ink/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-tarto-red";

type Props = {
  cakeId: string;
};

export default function CakeReviewForm({ cakeId }: Props) {
  const [state, formAction, pending] = useActionState(
    submitCakeReview,
    initialState
  );
  const [rating, setRating] = useState(5);

  if (state.success) {
    return (
      <div className="rounded-xl border border-tarto-red/10 bg-white p-6 text-center">
        <p className="text-lg font-bold text-tarto-red">Thank you!</p>
        <p className="mt-2 text-sm text-tarto-ink/75">
          Your review has been received. Thank you for sharing your experience.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative space-y-4">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="tarto_hp">Leave this blank</label>
        <input
          id="tarto_hp"
          type="text"
          name="tarto_hp"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <input type="hidden" name="cakeId" value={cakeId} />

      <div>
        <p className="text-sm font-semibold text-tarto-ink">Your rating</p>
        <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className={`cursor-pointer rounded-md p-1 transition ${
                rating >= star ? "text-tarto-orange" : "text-tarto-ink/20"
              }`}
            >
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                className="sr-only"
              />
              <span className="sr-only">
                {star} star{star === 1 ? "" : "s"}
              </span>
              <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
                <path
                  d="M12 3.6 14.5 9l6 .7-4.4 4 1.2 5.9L12 16.8 6.7 19.6l1.2-5.9L3.5 9.7 9.5 9 12 3.6Z"
                  fill="currentColor"
                />
              </svg>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className="text-sm font-semibold text-tarto-ink">
            Name
          </label>
          <input id="review-name" name="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="review-email" className="text-sm font-semibold text-tarto-ink">
            Email
          </label>
          <input
            id="review-email"
            name="email"
            type="email"
            required
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-tarto-ink/50">
            Used only to prevent duplicate reviews. It is not shown publicly.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="text-sm font-semibold text-tarto-ink">
          Your review
        </label>
        <textarea
          id="review-comment"
          name="comment"
          required
          minLength={12}
          maxLength={800}
          rows={4}
          className={fieldClass}
          placeholder="How did the cake look and taste?"
        />
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-tarto-red">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-tarto-red px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-tarto-red/90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
