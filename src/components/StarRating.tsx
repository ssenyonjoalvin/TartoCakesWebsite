"use client";

import { useId } from "react";

type Props = {
  value: number;
  size?: "sm" | "md";
  className?: string;
};

function starClass(size: "sm" | "md") {
  return size === "md" ? "h-5 w-5" : "h-4 w-4";
}

export default function StarRating({
  value,
  size = "sm",
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const rounded = Math.round(value * 2) / 2;
  const label =
    value > 0 ? `${value.toFixed(1)} out of 5 stars` : "No ratings yet";

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-tarto-orange ${className}`}
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rounded >= star;
        const half = !filled && rounded >= star - 0.5;
        return (
          <svg
            key={star}
            viewBox="0 0 24 24"
            className={starClass(size)}
            aria-hidden
          >
            {half ? (
              <>
                <defs>
                  <linearGradient id={`${uid}-half-${star}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 3.6 14.5 9l6 .7-4.4 4 1.2 5.9L12 16.8 6.7 19.6l1.2-5.9L3.5 9.7 9.5 9 12 3.6Z"
                  fill={`url(#${uid}-half-${star})`}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </>
            ) : (
              <path
                d="M12 3.6 14.5 9l6 .7-4.4 4 1.2 5.9L12 16.8 6.7 19.6l1.2-5.9L3.5 9.7 9.5 9 12 3.6Z"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            )}
          </svg>
        );
      })}
    </span>
  );
}
