import { prisma } from "@/lib/prisma";

export type PublicReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  dateLabel: string;
  cakeName: string;
  cakeSlug: string;
};

export type ReviewSummary = {
  average: number;
  count: number;
};

function formatReviewDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

export function emptyReviewSummary(): ReviewSummary {
  return { average: 0, count: 0 };
}

export async function getReviewSummariesByCakeIds(
  cakeIds: string[]
): Promise<Map<string, ReviewSummary>> {
  const summaries = new Map<string, ReviewSummary>();
  if (cakeIds.length === 0) return summaries;

  try {
    const rows = await prisma.cakeReview.groupBy({
      by: ["cakeId"],
      where: { status: "APPROVED", cakeId: { in: cakeIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });

    for (const row of rows) {
      summaries.set(row.cakeId, {
        average: Number(row._avg.rating ?? 0),
        count: row._count._all,
      });
    }
  } catch (error) {
    console.error("Failed to load review summaries:", error);
  }

  return summaries;
}

export async function getApprovedReviewsForCake(
  cakeId: string
): Promise<PublicReview[]> {
  try {
    const rows = await prisma.cakeReview.findMany({
      where: { cakeId, status: "APPROVED" },
      include: { cake: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      comment: row.comment,
      dateLabel: formatReviewDate(row.createdAt),
      cakeName: row.cake.name,
      cakeSlug: row.cake.slug,
    }));
  } catch (error) {
    console.error("Failed to load cake reviews:", error);
    return [];
  }
}

export async function getApprovedReviews(limit = 24): Promise<PublicReview[]> {
  try {
    const rows = await prisma.cakeReview.findMany({
      where: { status: "APPROVED" },
      include: { cake: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      comment: row.comment,
      dateLabel: formatReviewDate(row.createdAt),
      cakeName: row.cake.name,
      cakeSlug: row.cake.slug,
    }));
  } catch (error) {
    console.error("Failed to load reviews:", error);
    return [];
  }
}
