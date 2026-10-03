"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import {
  BUSINESS_FIELDS,
  type BusinessInfo,
  type FaqItem,
} from "@/lib/business-fields";
import { saveSiteSetting } from "@/lib/site-settings";

export type ContentFormState = {
  error?: string;
  success?: string;
};

const MAX_TEXT = 1000;
const MAX_FAQ_ITEMS = 40;
const MAX_QUESTION = 200;
const MAX_ANSWER = 2000;

// Both roles may edit public copy (unlike the WhatsApp number, which
// controls where orders go and is admin-only).
async function requireSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}

export async function updateBusinessInfo(
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireSession();

  const info = {} as BusinessInfo;
  for (const field of BUSINESS_FIELDS) {
    const value = String(formData.get(field.key) ?? "")
      .replace(/\r\n/g, "\n")
      .trim();
    if (value.length > MAX_TEXT) {
      return { error: `"${field.label}" must be ${MAX_TEXT} characters or fewer.` };
    }
    info[field.key] = value;
  }

  try {
    await saveSiteSetting("business", info);
  } catch (error) {
    console.error("Saving business info failed:", error);
    return { error: "Could not save. Please try again." };
  }

  revalidatePublic();
  return { success: "Saved. The website now shows the updated information." };
}

/**
 * Saves the whole FAQ list at once. The client sends JSON because the list
 * is edited, reordered and toggled as one unit.
 */
export async function saveFaqItems(
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireSession();

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Could not read the questions. Please reload and try again." };
  }
  if (!Array.isArray(parsed)) {
    return { error: "Could not read the questions. Please reload and try again." };
  }
  if (parsed.length > MAX_FAQ_ITEMS) {
    return { error: `You can have up to ${MAX_FAQ_ITEMS} questions.` };
  }

  const items: FaqItem[] = [];
  for (const [index, raw] of parsed.entries()) {
    const entry = (raw ?? {}) as Record<string, unknown>;
    const question = String(entry.question ?? "").trim();
    const answer = String(entry.answer ?? "").replace(/\r\n/g, "\n").trim();
    if (!question && !answer) continue; // ignore blank rows
    if (!question || !answer) {
      return { error: `Question ${index + 1} needs both a question and an answer.` };
    }
    if (question.length > MAX_QUESTION || answer.length > MAX_ANSWER) {
      return {
        error: `Question ${index + 1} is too long (max ${MAX_QUESTION} characters for the question, ${MAX_ANSWER} for the answer).`,
      };
    }
    items.push({
      id:
        typeof entry.id === "string" && /^[\w-]{1,64}$/.test(entry.id)
          ? entry.id
          : crypto.randomUUID(),
      question,
      answer,
      published: entry.published !== false,
    });
  }

  try {
    await saveSiteSetting("faq", items);
  } catch (error) {
    console.error("Saving FAQ failed:", error);
    return { error: "Could not save. Please try again." };
  }

  revalidatePublic();
  const live = items.filter((item) => item.published).length;
  return {
    success: `Saved ${items.length} question${items.length === 1 ? "" : "s"} (${live} visible on the website).`,
  };
}
