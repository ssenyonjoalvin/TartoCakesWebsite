import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ReviewManager, {
  type ReviewRow,
} from "@/components/admin/ReviewManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review Management" };

const tones = [
  "bg-[#C45C26]",
  "bg-[#5B6B8C]",
  "bg-tarto-red",
  "bg-[#6B8F71]",
  "bg-[#8B6B4A]",
];

export default async function AdminReviewsPage() {
  const [rows, pending, approved, hidden] = await Promise.all([
    prisma.cakeReview.findMany({
      orderBy: { createdAt: "desc" },
      include: { cake: { select: { name: true, slug: true } } },
    }),
    prisma.cakeReview.count({ where: { status: "PENDING" } }),
    prisma.cakeReview.count({ where: { status: "APPROVED" } }),
    prisma.cakeReview.count({ where: { status: "HIDDEN" } }),
  ]);

  const reviews: ReviewRow[] = rows.map((row, index) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    cakeName: row.cake.name,
    cakeSlug: row.cake.slug,
    dateLabel: row.createdAt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    avatarTone: tones[index % tones.length],
  }));

  return (
    <ReviewManager
      reviews={reviews}
      stats={{ pending, approved, hidden }}
    />
  );
}
