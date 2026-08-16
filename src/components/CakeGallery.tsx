"use client";

import { useMemo, useState } from "react";
import CakeCard from "@/components/CakeCard";
import type { Cake } from "@/data/cakes";

export type GalleryCake = Pick<
  Cake,
  "id" | "slug" | "name" | "price" | "image" | "description"
> & {
  occasionSlug: string | null;
  occasionName: string | null;
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
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
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
            onClick={() => setActive(occasion.slug)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
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
          <CakeCard
            key={cake.id}
            cake={{
              id: cake.id,
              slug: cake.slug,
              name: cake.name,
              price: cake.price,
              image: cake.image,
              description: cake.description,
              category: "custom",
              sizes: [],
              flavors: [],
            }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-tarto-ink/70">
          No cakes for this occasion yet.
        </p>
      )}
    </div>
  );
}
