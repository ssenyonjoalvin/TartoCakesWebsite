/**
 * Pure catalog filtering/sorting. No React, no Prisma, so it can run on the
 * server or in the browser, and the URL is the single source of truth for
 * the current filters (shareable links like /cakes?occasion=wedding&sort=price-asc).
 */

export type CatalogCake = {
  id: string;
  name: string;
  description: string;
  price: number;
  featured?: boolean;
  flavors: string[];
  occasionSlug: string | null;
  occasionName: string | null;
  reviewSummary?: { average: number; count: number };
};

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name (A–Z)" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type CatalogFilters = {
  q: string;
  occasion: string; // occasion slug, or "" for all
  flavor: string; // flavour name, or "" for all
  sort: SortValue;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  q: "",
  occasion: "",
  flavor: "",
  sort: "featured",
};

function isSortValue(value: string): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

type ParamReader = { get(name: string): string | null };

export function filtersFromParams(params: ParamReader): CatalogFilters {
  const sort = params.get("sort") ?? "";
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    occasion: params.get("occasion") ?? "",
    flavor: params.get("flavor") ?? "",
    sort: isSortValue(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

/** Only non-default values go in the URL, so a clean catalog is just /cakes. */
export function filtersToQuery(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.occasion) params.set("occasion", filters.occasion);
  if (filters.flavor) params.set("flavor", filters.flavor);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveFilters(filters: CatalogFilters) {
  return Boolean(filters.q.trim() || filters.occasion || filters.flavor);
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function matchesSearch(cake: CatalogCake, query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(
    [cake.name, cake.description, cake.occasionName ?? "", ...cake.flavors].join(" ")
  );
  // Every word must appear somewhere: "chocolate wedding" narrows, not widens.
  return words.every((word) => haystack.includes(word));
}

const compareName = (a: CatalogCake, b: CatalogCake) =>
  a.name.localeCompare(b.name);

const sorters: Record<SortValue, (a: CatalogCake, b: CatalogCake) => number> = {
  featured: (a, b) =>
    Number(b.featured ?? false) - Number(a.featured ?? false) ||
    (a.occasionName ?? "￿").localeCompare(b.occasionName ?? "￿") ||
    compareName(a, b),
  "price-asc": (a, b) => a.price - b.price || compareName(a, b),
  "price-desc": (a, b) => b.price - a.price || compareName(a, b),
  rating: (a, b) =>
    (b.reviewSummary?.average ?? 0) - (a.reviewSummary?.average ?? 0) ||
    (b.reviewSummary?.count ?? 0) - (a.reviewSummary?.count ?? 0) ||
    compareName(a, b),
  name: compareName,
};

export function applyCatalogFilters<T extends CatalogCake>(
  cakes: T[],
  filters: CatalogFilters
): T[] {
  return cakes
    .filter((cake) => !filters.occasion || cake.occasionSlug === filters.occasion)
    .filter((cake) => !filters.flavor || cake.flavors.includes(filters.flavor))
    .filter((cake) => matchesSearch(cake, filters.q))
    .sort(sorters[filters.sort]);
}

/** Flavours that actually appear on published cakes, so no filter ever returns nothing by design. */
export function flavorsInCatalog(cakes: CatalogCake[]) {
  return Array.from(new Set(cakes.flatMap((cake) => cake.flavors))).sort((a, b) =>
    a.localeCompare(b)
  );
}
