"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  filesFromFormData,
  MAX_QUOTE_IMAGES,
  saveQuoteImages,
} from "@/lib/quote-images";

export type QuoteFormState = {
  error?: string;
  success?: boolean;
};

const OTHER_OCCASION = "__other__";

export async function submitQuoteRequest(
  _prev: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const occasionChoice = String(formData.get("occasionId") ?? "").trim();
  const occasionOther = String(formData.get("occasionOther") ?? "").trim();
  const cakeType = String(formData.get("cakeType") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim() || null;
  const flavor = String(formData.get("flavor") ?? "").trim() || null;
  const eventDateRaw = String(formData.get("eventDate") ?? "").trim();
  const referenceFiles = filesFromFormData(formData, "referenceImages");

  if (!name || name.length < 2) {
    return { error: "Please enter your name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!phone || phone.length < 7) {
    return { error: "Please enter a valid phone number." };
  }
  if (!occasionChoice) {
    return { error: "Please select an occasion." };
  }

  const isOther = occasionChoice === OTHER_OCCASION;
  if (isOther && occasionOther.length < 2) {
    return { error: "Please tell us what the occasion is." };
  }
  if (isOther && occasionOther.length > 120) {
    return { error: "Occasion description is too long." };
  }

  if (!size) {
    return { error: "Please select a size." };
  }
  if (!flavor) {
    return { error: "Please select a flavour." };
  }
  if (message.length > 120) {
    return { error: "Cake wording must be 120 characters or fewer." };
  }

  if (!eventDateRaw) {
    return { error: "Please choose when you need the cake." };
  }

  const eventDate = new Date(`${eventDateRaw}T12:00:00`);
  if (Number.isNaN(eventDate.getTime())) {
    return { error: "Please enter a valid date." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);
  if (eventDay < today) {
    return { error: "The ready date cannot be in the past." };
  }

  if (referenceFiles.length > MAX_QUOTE_IMAGES) {
    return { error: `You can attach up to ${MAX_QUOTE_IMAGES} photos.` };
  }

  let referenceImages: string[] = [];
  try {
    referenceImages = await saveQuoteImages(referenceFiles);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "We could not upload your cake photos. Please try again.",
    };
  }

  try {
    let occasionId: string | null = null;
    let occasionOtherValue: string | null = null;

    if (isOther) {
      occasionOtherValue = occasionOther;
    } else {
      const occasion = await prisma.occasion.findFirst({
        where: { id: occasionChoice, active: true },
        select: { id: true },
      });
      if (!occasion) {
        return { error: "Please select a valid occasion." };
      }
      occasionId = occasion.id;
    }

    let cakeId: string | null = null;
    let cakeName: string | null = cakeType || null;

    if (cakeType && cakeType !== "Custom Cake") {
      const cake = await prisma.cake.findFirst({
        where: {
          OR: [{ name: cakeType }, { slug: cakeType }],
          published: true,
        },
        select: { id: true, name: true },
      });
      if (cake) {
        cakeId = cake.id;
        cakeName = cake.name;
      }
    }

    const customer = await prisma.customer.upsert({
      where: { email },
      create: {
        name,
        email,
        phone,
      },
      update: {
        name,
        phone,
      },
    });

    await prisma.cakeOrder.create({
      data: {
        customerId: customer.id,
        cakeId,
        cakeName,
        occasionId,
        occasionOther: occasionOtherValue,
        name,
        email,
        phone,
        message,
        size,
        flavor,
        eventDate,
        referenceImages,
        status: "NEW",
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");

    return { success: true };
  } catch (error) {
    console.error("Quote request failed:", error);
    return {
      error:
        "We could not send your request right now. Please try again or call us.",
    };
  }
}
