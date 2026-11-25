"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  filesFromFormData,
  MAX_QUOTE_IMAGES,
  saveQuoteImages,
} from "@/lib/quote-images";
import { CUSTOM_CAKE, HONEYPOT_FIELD, OTHER_OCCASION, parseEventDate, todayInKampala } from "@/lib/quote-form";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { grantQuoteAccess } from "@/lib/quote-access";

export type QuoteField =
  | "name"
  | "email"
  | "phone"
  | "occasionId"
  | "occasionOther"
  | "size"
  | "flavor"
  | "message"
  | "design"
  | "notes"
  | "eventDate"
  | "deliveryMethod"
  | "deliveryLocation"
  | "referenceImages";

export type QuoteFormState = {
  /** General problem not tied to one field (network, rate limit, ...). */
  error?: string;
  fieldErrors?: Partial<Record<QuoteField, string>>;
};

const RATE_LIMIT = { requests: 5, windowMs: 10 * 60 * 1000 };

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitQuoteRequest(
  _prev: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  // Bots fill every input, including this visually hidden one. Pretend it
  // worked so they don't learn to skip it.
  if (text(formData, HONEYPOT_FIELD)) {
    redirect("/quote/thank-you");
  }

  if (isRateLimited(`quote:${await clientIp()}`, RATE_LIMIT.requests, RATE_LIMIT.windowMs)) {
    return {
      error:
        "You've sent several requests in a short time. Please wait a few minutes, or call us directly.",
    };
  }

  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const occasionChoice = text(formData, "occasionId");
  const occasionOther = text(formData, "occasionOther");
  const cakeType = text(formData, "cakeType");
  const message = text(formData, "message");
  const design = text(formData, "design");
  const notes = text(formData, "notes");
  const size = text(formData, "size");
  const flavor = text(formData, "flavor");
  const eventDateRaw = text(formData, "eventDate");
  const deliveryMethodRaw = text(formData, "deliveryMethod");
  const deliveryLocation = text(formData, "deliveryLocation");
  const referenceFiles = filesFromFormData(formData, "referenceImages");

  // Collect every problem at once so the customer can fix them in one pass.
  const fieldErrors: QuoteFormState["fieldErrors"] = {};
  const isOther = occasionChoice === OTHER_OCCASION;

  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  else if (name.length > 100) fieldErrors.name = "Please keep your name under 100 characters.";
  if (email.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  if (!/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 9 || phone.replace(/\D/g, "").length > 15 || phone.length > 40) {
    fieldErrors.phone = "Please enter a valid phone number.";
  }
  if (!occasionChoice) fieldErrors.occasionId = "Please select an occasion.";
  if (isOther && occasionOther.length < 2) {
    fieldErrors.occasionOther = "Please tell us what the occasion is.";
  } else if (occasionOther.length > 120) {
    fieldErrors.occasionOther = "Please keep this under 120 characters.";
  }
  if (!size) fieldErrors.size = "Please select a size.";
  else if (size.length > 100) fieldErrors.size = "Please choose a shorter size description.";
  if (!flavor) fieldErrors.flavor = "Please select a flavour.";
  else if (flavor.length > 100) fieldErrors.flavor = "Please choose a shorter flavour description.";
  if (cakeType.length > 191) return { error: "Please choose a valid cake." };
  if (message.length > 120) {
    fieldErrors.message = "Cake wording must be 120 characters or fewer.";
  }
  if (design.length > 1000) {
    fieldErrors.design = "Please keep the design description under 1000 characters.";
  }
  if (notes.length > 1000) {
    fieldErrors.notes = "Comments must be 1000 characters or fewer.";
  }

  const deliveryMethod =
    deliveryMethodRaw === "pickup" || deliveryMethodRaw === "delivery"
      ? deliveryMethodRaw
      : null;
  if (deliveryMethod === "delivery" && deliveryLocation.length < 3) {
    fieldErrors.deliveryLocation = "Please tell us where to deliver.";
  } else if (deliveryLocation.length > 255) {
    fieldErrors.deliveryLocation = "Please keep the location under 255 characters.";
  }

  let eventDate: Date | null = null;
  if (!eventDateRaw) {
    fieldErrors.eventDate = "Please choose when you need the cake.";
  } else {
    eventDate = parseEventDate(eventDateRaw);
    if (!eventDate) {
      fieldErrors.eventDate = "Please enter a valid date.";
    } else if (eventDateRaw < todayInKampala()) {
      fieldErrors.eventDate = "The date cannot be in the past.";
    }
  }

  if (referenceFiles.length > MAX_QUOTE_IMAGES) {
    fieldErrors.referenceImages = `You can attach up to ${MAX_QUOTE_IMAGES} photos.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let orderId: string;
  try {
    let occasionId: string | null = null;
    if (!isOther) {
      const occasion = await prisma.occasion.findFirst({
        where: { id: occasionChoice, active: true },
        select: { id: true },
      });
      if (!occasion) {
        return { fieldErrors: { occasionId: "Please select a valid occasion." } };
      }
      occasionId = occasion.id;
    }

    let cakeId: string | null = null;
    let cakeName: string | null = cakeType || null;
    if (cakeType && cakeType !== CUSTOM_CAKE) {
      const cake = await prisma.cake.findFirst({
        where: { OR: [{ name: cakeType }, { slug: cakeType }], published: true },
        select: { id: true, name: true },
      });
      if (cake) {
        cakeId = cake.id;
        cakeName = cake.name;
      }
    }

    let referenceImages: string[];
    try {
      referenceImages = await saveQuoteImages(referenceFiles);
    } catch (error) {
      return { fieldErrors: { referenceImages: error instanceof Error ? error.message : "We could not upload your cake photos. Please try again." } };
    }

    const customer = await prisma.customer.upsert({
      where: { email },
      create: { name, email, phone },
      update: { name, phone },
    });

    const order = await prisma.cakeOrder.create({
      data: {
        customerId: customer.id,
        cakeId,
        cakeName,
        occasionId,
        occasionOther: isOther ? occasionOther : null,
        name,
        email,
        phone,
        message,
        design: design || null,
        notes: notes || null,
        size,
        flavor,
        eventDate,
        deliveryMethod,
        deliveryLocation: deliveryMethod === "delivery" ? deliveryLocation : null,
        referenceImages,
        status: "NEW",
      },
      select: { id: true },
    });
    orderId = order.id;
  } catch (error) {
    console.error("Quote request failed:", error);
    return {
      error:
        "We could not send your request right now. Please try again or call us.",
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/customers");
  revalidatePath("/admin", "layout");

  // redirect() throws, so it must stay outside the try/catch above.
  await grantQuoteAccess(orderId);
  redirect(`/quote/thank-you?id=${encodeURIComponent(orderId)}`);
}
