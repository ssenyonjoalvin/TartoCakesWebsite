"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type QuoteFormState = {
  error?: string;
  success?: boolean;
};

const OTHER_OCCASION = "__other__";

function parsePresetOptions(message: string) {
  const sizeMatch = message.match(/Size:\s*([^·\n]+)/i);
  const flavorMatch = message.match(/Flavou?r:\s*([^·\n]+)/i);
  return {
    size: sizeMatch?.[1]?.trim() || null,
    flavor: flavorMatch?.[1]?.trim() || null,
  };
}

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
  const sizePreset = String(formData.get("size") ?? "").trim();
  const flavorPreset = String(formData.get("flavor") ?? "").trim();

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

  if (!message || message.length < 5) {
    return {
      error: "Please tell us a bit more about your cake request.",
    };
  }

  const fromMessage = parsePresetOptions(message);
  const size = sizePreset || fromMessage.size;
  const flavor = flavorPreset || fromMessage.flavor;

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
        status: "NEW",
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");

    return { success: true };
  } catch {
    return {
      error:
        "We could not send your request right now. Please try again or call us.",
    };
  }
}
