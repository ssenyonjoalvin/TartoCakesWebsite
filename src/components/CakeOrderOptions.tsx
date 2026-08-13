"use client";

import Link from "next/link";
import { useState } from "react";
import { Cake } from "@/data/cakes";

type Props = {
  cake: Cake;
};

const highlights = [
  {
    label: "Freshly Baked",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 12.5l2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "24h Lead Time",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Safe Delivery",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7V10z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="1.5" fill="currentColor" />
        <circle cx="17" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Customizable",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function CakeOrderOptions({ cake }: Props) {
  const [size, setSize] = useState(cake.sizes[0]);
  const [flavor, setFlavor] = useState(cake.flavors[0]);

  return (
    <div className="mt-6">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-tarto-ink">
          Select Size
        </h2>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {cake.sizes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={`min-w-[3.25rem] rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition ${
                size === option
                  ? "border-tarto-red bg-tarto-red text-white"
                  : "border-tarto-ink/15 bg-white text-tarto-ink hover:border-tarto-red/40"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-tarto-ink">
          Available Flavors
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {cake.flavors.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFlavor(option)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                flavor === option
                  ? "bg-tarto-red text-white"
                  : "bg-tarto-ink/8 text-tarto-ink hover:bg-tarto-ink/12"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 rounded-xl border border-tarto-ink/8 bg-white/70 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 text-sm font-medium text-tarto-ink"
            >
              <span className="text-tarto-red">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={`/contact?cake=${encodeURIComponent(cake.name)}&size=${encodeURIComponent(size)}&flavor=${encodeURIComponent(flavor)}`}
        className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-tarto-red px-6 py-3.5 text-sm font-bold text-white transition hover:bg-tarto-red/90 sm:w-auto sm:min-w-[240px]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]" aria-hidden>
          <path d="M4 6h2l2.2 10h9.3l2-7H8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="19" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="17" cy="19" r="1.3" fill="currentColor" stroke="none" />
        </svg>
        Request This Cake
      </Link>
    </div>
  );
}
