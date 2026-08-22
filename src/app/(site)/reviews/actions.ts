"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ReviewFormState = {
  error?: string;
  success?: boolean;
};

const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function submitCakeReview(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const honeypot = String(formData.get("tarto_hp") ?? "").trim();
  if (honeypot) {
    return { success: true };
  }

  const cakeId = String(formData.get("cakeId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const comment = String(formData.get("comment") ?? "").trim();
  const ratingRaw = Number.parseInt(String(formData.get("rating") ?? ""), 10);

  if (!cakeId) {
    return { error: "Please choose the cake you want to review." };
  }
  if (!name || name.length < 2) {
    return { error: "Please enter your name." };
  }
  if (name.length > 80) {
    return { error: "Please use a shorter name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { error: "Please choose a rating from 1 to 5 stars." };
  }
  if (comment.length < 12) {
    return { error: "Please write a little more about the cake." };
  }
  if (comment.length > 800) {
    return { error: "Reviews must be 800 characters or fewer." };
  }

  try {
    const cake = await prisma.cake.findFirst({
      where: { id: cakeId, published: true },
      select: { id: true, slug: true },
    });
    if (!cake) {
      return { error: "That cake is no longer available to review." };
    }

    const existing = await prisma.cakeReview.findUnique({
      where: { cakeId_email: { cakeId: cake.id, email } },
      select: { id: true },
    });
    if (existing) {
      return {
        error:
          "Thank you for sharing — we already have your review for this cake. One review per person keeps the feedback fair for everyone.",
      };
    }

    const recent = await prisma.cakeReview.findFirst({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (recent) {
      return {
        error: "Please wait a few minutes before submitting another review.",
      };
    }

    try {
      await prisma.cakeReview.create({
        data: {
          cakeId: cake.id,
          name,
          email,
          rating: ratingRaw,
          comment,
          status: "PENDING",
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return {
          error:
            "Thank you for sharing — we already have your review for this cake. One review per person keeps the feedback fair for everyone.",
        };
      }
      throw error;
    }

    revalidatePath("/admin/reviews");
    revalidatePath("/admin", "layout");
    revalidatePath(`/cakes/${cake.slug}`);
    revalidatePath("/cakes");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Cake review failed:", error);
    return {
      error: "We could not save your review right now. Please try again.",
    };
  }
}
