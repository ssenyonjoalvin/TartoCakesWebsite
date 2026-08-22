import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Cake } from "@/data/cakes";
import {
  emptyReviewSummary,
  getReviewSummariesByCakeIds,
  type ReviewSummary,
} from "@/lib/reviews";

export type PublicCake = Cake & {
  images: string[];
  occasionName: string | null;
  occasionSlug: string | null;
  reviewSummary: ReviewSummary;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export const getPublishedCakes = cache(async (): Promise<PublicCake[]> => {
  const cakes = await prisma.cake.findMany({
    where: { published: true },
    include: { occasion: true, flavor: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  const sizes = await prisma.cakeSize.findMany({
    select: { id: true, name: true },
  });

  const sizeNameById = new Map(sizes.map((size) => [size.id, size.name]));
  const reviewSummaries = await getReviewSummariesByCakeIds(
    cakes.map((cake) => cake.id)
  );

  return cakes.map((cake) => {
    const images = asStringArray(cake.images);
    const rawSizes = asStringArray(cake.sizes);
    const flavors = asStringArray(cake.flavors);
    const flavorName = cake.flavor?.name;

    return {
      id: cake.id,
      slug: cake.slug,
      name: cake.name,
      price: cake.price,
      category: cake.category,
      image: cake.image || images[0] || "",
      images: images.length > 0 ? images : cake.image ? [cake.image] : [],
      description: cake.description,
      sizes: rawSizes.map((value) => sizeNameById.get(value) ?? value),
      flavors:
        flavors.length > 0
          ? flavors
          : flavorName
            ? [flavorName]
            : [],
      featured: cake.featured,
      occasionName: cake.occasion?.name ?? null,
      occasionSlug: cake.occasion?.slug ?? null,
      reviewSummary: reviewSummaries.get(cake.id) ?? emptyReviewSummary(),
    };
  });
});

export const getActiveOccasions = cache(async () => {
  return prisma.occasion.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { slug: true, name: true },
  });
});

export async function getPublishedCakeBySlug(
  slug: string
): Promise<PublicCake | null> {
  const cakes = await getPublishedCakes();
  return cakes.find((cake) => cake.slug === slug) ?? null;
}

export function relatedCakes(
  cakes: PublicCake[],
  current: PublicCake,
  limit = 3
) {
  return cakes
    .filter((cake) => cake.slug !== current.slug)
    .sort((a, b) => {
      const aSame =
        a.occasionName === current.occasionName ||
        a.category === current.category
          ? 0
          : 1;
      const bSame =
        b.occasionName === current.occasionName ||
        b.category === current.category
          ? 0
          : 1;
      if (aSame !== bSame) return aSame - bSame;
      return Number(b.featured) - Number(a.featured);
    })
    .slice(0, limit);
}
