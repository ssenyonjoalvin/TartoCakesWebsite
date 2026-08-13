"use client";

import { CakeCategory, cakes, categoryLabels } from "@/data/cakes";
import CakeCard from "@/components/CakeCard";
import { useMemo, useState } from "react";

const filters: Array<CakeCategory | "all"> = [
  "all",
  "birthday",
  "wedding",
  "princess",
  "custom",
  "romantic",
];

export default function CakeGallery() {
  const [active, setActive] = useState<CakeCategory | "all">("all");

  const filtered = useMemo(() => {
    if (active === "all") return cakes;
    return cakes.filter((cake) => cake.category === active);
  }, [active]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              active === filter
                ? "bg-tarto-red text-white"
                : "bg-white text-tarto-ink hover:bg-tarto-yellow/40"
            }`}
          >
            {categoryLabels[filter]}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((cake) => (
          <CakeCard key={cake.id} cake={cake} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-tarto-ink/70">
          No cakes in this category yet.
        </p>
      )}
    </div>
  );
}
