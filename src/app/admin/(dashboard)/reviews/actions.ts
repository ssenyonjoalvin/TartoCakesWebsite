"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import type { ReviewStatus } from "@/generated/prisma/client";

const allowed: ReviewStatus[] = ["PENDING", "APPROVED", "HIDDEN"];

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

function revalidateReviewPaths(slug?: string | null) {
  // Review summaries (stars on cards) are part of the cached catalog.
  updateTag(CACHE_TAGS.catalog);
  revalidatePath("/admin/reviews");
  revalidatePath("/admin", "layout");
  revalidatePath("/cakes");
  revalidatePath("/");
  if (slug) revalidatePath(`/cakes/${slug}`);
}

export async function updateReviewStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as ReviewStatus;
  if (!id || !allowed.includes(status)) return;

  const review = await prisma.cakeReview.update({
    where: { id },
    data: { status },
    include: { cake: { select: { slug: true } } },
  });

  revalidateReviewPaths(review.cake.slug);
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.cakeReview.findUnique({
    where: { id },
    include: { cake: { select: { slug: true } } },
  });
  if (!existing) return;

  await prisma.cakeReview.delete({ where: { id } });
  revalidateReviewPaths(existing.cake.slug);
}
