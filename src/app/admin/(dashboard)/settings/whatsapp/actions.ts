"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { saveSiteSetting } from "@/lib/site-settings";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

export type WhatsAppSettingsState = {
  error?: string;
  success?: string;
  number?: string;
};

export async function updateWhatsAppSettings(
  _prev: WhatsAppSettingsState,
  formData: FormData
): Promise<WhatsAppSettingsState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  // Admins only: this number receives customer orders, so an editor
  // account must not be able to redirect them.
  if (session.role !== "ADMIN") {
    return { error: "Only admins can change the WhatsApp number." };
  }

  const raw = String(formData.get("whatsappNumber") ?? "").trim();
  let number = "";

  if (raw) {
    const normalized = normalizeWhatsAppNumber(raw);
    if (!normalized) {
      return {
        error:
          "That doesn't look like a valid number. Use a format like 0700 796 794 or +256 700 796 794.",
        number: raw,
      };
    }
    number = normalized;
  }

  try {
    await saveSiteSetting("whatsappNumber", number);
  } catch (error) {
    console.error("Saving WhatsApp setting failed:", error);
    return { error: "Could not save. Please try again.", number: raw };
  }

  // The number is rendered on every public page.
  revalidatePath("/", "layout");

  return {
    success: number
      ? "WhatsApp number saved. Buttons are now live on the website."
      : "WhatsApp number removed. WhatsApp buttons are hidden on the website.",
    number,
  };
}
