"use client";

import { useMemo, useState } from "react";
import CakeCard from "@/components/CakeCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  applyCatalogFilters,
  filtersToQuery,
  hasActiveFilters,
  type CatalogFilters,
  type SortValue,
} from "@/lib/catalog-filter";

export type GalleryCake = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  flavors: string[];
  featured: boolean;
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
  flavors: string[];
  initialFilters: CatalogFilters;
};

const controlClass =
  "min-h-11 w-full rounded-full border border-tarto-ink/15 bg-white px-4 text-base text-tarto-ink outline-none focus:border-tarto-red focus:ring-2 focus:ring-tarto-red/25 sm:text-sm";

function chipClass(active: boolean) {
  return `min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-tarto-red text-white"
      : "bg-white text-tarto-ink hover:bg-tarto-yellow/40"
  }`;
}

export default function CakeGallery({
  cakes,
  occasions,
  flavors,
  initialFilters,
}: Props) {
  const [filters, setFilters] = useState(initialFilters);

  function update(patch: Partial<CatalogFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    // replaceState (not router.push): filters update the address bar for
    // sharing without a server round-trip or a new history entry per keystroke.
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${filtersToQuery(next)}`
    );
  }

  const results = useMemo(
    () => applyCatalogFilters(cakes, filters),
    [cakes, filters]
  );

  const filtered = hasActiveFilters(filters);

  return (
    <div>
      {/* A real GET form, so search still works before JS loads. */}
      <form
        action="/cakes"
        role="search"
        aria-label="Search cakes"
        onSubmit={(event) => event.preventDefault()}
        className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
      >
        <div className="relative">
          <label htmlFor="cake-search" className="sr-only">
            Search cakes
          </label>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-tarto-ink/50 stroke-2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            id="cake-search"
            name="q"
            type="search"
            value={filters.q}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Search by name, flavour or occasion"
            maxLength={80}
            className={`${controlClass} pl-11`}
          />
        </div>

        {flavors.length > 0 ? (
          <div>
            <label htmlFor="cake-flavor" className="sr-only">
              Flavour
            </label>
            <select
              id="cake-flavor"
              name="flavor"
              value={filters.flavor}
              onChange={(event) => update({ flavor: event.target.value })}
              className={controlClass}
            >
              <option value="">All flavours</option>
              {flavors.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {flavor}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label htmlFor="cake-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="cake-sort"
            name="sort"
            value={filters.sort}
            onChange={(event) =>
              update({ sort: event.target.value as SortValue })
            }
            className={controlClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </div>

        {filters.occasion ? (
          <input type="hidden" name="occasion" value={filters.occasion} />
        ) : null}
        <noscript>
          <button type="submit" className={chipClass(true)}>
            Search
          </button>
        </noscript>
      </form>

      {occasions.length > 0 ? (
        <div
          role="group"
          aria-label="Filter cakes by occasion"
          className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          <button
            type="button"
            aria-pressed={filters.occasion === ""}
            onClick={() => update({ occasion: "" })}
            className={chipClass(filters.occasion === "")}
          >
            All
          </button>
          {occasions.map((occasion) => (
            <button
              key={occasion.slug}
              type="button"
              aria-pressed={filters.occasion === occasion.slug}
              onClick={() => update({ occasion: occasion.slug })}
              className={chipClass(filters.occasion === occasion.slug)}
            >
              {occasion.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex min-h-11 flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-tarto-ink/70">
          {results.length === 1 ? "1 cake" : `${results.length} cakes`}
          {filtered ? " match your filters" : ""}
        </p>
        {filtered ? (
          <button
            type="button"
            onClick={() => update({ ...DEFAULT_FILTERS, sort: filters.sort })}
            className="min-h-11 text-sm font-semibold text-tarto-red underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((cake) => (
            <CakeCard key={cake.id} cake={cake} showOccasion />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white px-6 py-12 text-center">
          <p className="text-lg font-bold text-tarto-ink">No cakes found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-tarto-ink/70">
            Try a different search or clear the filters. Don&apos;t see what you
            want? We make custom cakes to your design.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => update({ ...DEFAULT_FILTERS, sort: filters.sort })}
            >
              Clear filters
            </Button>
            <ButtonLink href="/design-your-cake">
              Design a custom cake
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
