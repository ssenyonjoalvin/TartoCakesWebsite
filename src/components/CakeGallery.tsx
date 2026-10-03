"use client";

import { useMemo, useState } from "react";
import CakeCard from "@/components/CakeCard";

export type GalleryCake = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  description: string;
  occasionSlug: string | null;
  occasionName: string | null;
  reviewSummary?: {
    average: number;
    count: number;
  };
};

export type GalleryOccasion = {
  slug: string;
  name: string;
};

type Props = {
  cakes: GalleryCake[];
  occasions: GalleryOccasion[];
};

export default function CakeGallery({ cakes, occasions }: Props) {
  const [active, setActive] = useState<string>("all");

  const sortedCakes = useMemo(() => {
    return [...cakes].sort((a, b) => {
      const occasionCompare = (a.occasionName ?? "zzz").localeCompare(
        b.occasionName ?? "zzz"
      );
      if (occasionCompare !== 0) return occasionCompare;
      return a.name.localeCompare(b.name);
    });
  }, [cakes]);

  const filtered = useMemo(() => {
    if (active === "all") return sortedCakes;
    return sortedCakes.filter((cake) => cake.occasionSlug === active);
  }, [active, sortedCakes]);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter cakes by occasion"
        className="flex flex-wrap justify-center gap-2"
      >
        <button
          type="button"
          aria-pressed={active === "all"}
          onClick={() => setActive("all")}
          className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === "all"
              ? "bg-tarto-red text-white"
              : "bg-white text-tarto-ink hover:bg-tarto-yellow/40"
          }`}
        >
          All
        </button>
        {occasions.map((occasion) => (
          <button
            key={occasion.slug}
            type="button"
            aria-pressed={active === occasion.slug}
            onClick={() => setActive(occasion.slug)}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active === occasion.slug
                ? "bg-tarto-red text-white"
                : "bg-white text-tarto-ink hover:bg-tarto-yellow/40"
            }`}
          >
            {occasion.name}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((cake) => (
          <CakeCard key={cake.id} cake={cake} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p role="status" className="mt-10 text-center text-tarto-ink/70">
          No cakes for this occasion yet.
        </p>
      )}
    </div>
  );
}
