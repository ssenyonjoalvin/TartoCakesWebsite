import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import { CACHE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import {
  BUSINESS_FIELDS,
  type BusinessInfo,
  type FaqItem,
} from "@/lib/business-fields";

export type { BusinessInfo, FaqItem };

/**
 * Admin-editable site settings, stored as key/value rows in `SiteSetting`.
 *
 * Text settings are free text written by the owner. An empty string means
 * "not provided", and the public UI hides anything that is empty, so the
 * site never shows invented business facts or placeholder text.
 */

export type SiteSettings = {
  /** Digits only, international format (e.g. "256700796794"). "" = WhatsApp off. */
  whatsappNumber: string;
  business: BusinessInfo;
  faq: FaqItem[];
};

const EMPTY_BUSINESS: BusinessInfo = {
  openingHours: "",
  deliveryAreas: "",
  deliveryFees: "",
  orderNotice: "",
  sameDayOrders: "",
  pickupInfo: "",
  paymentMethods: "",
  quoteResponseTime: "",
};

const DEFAULTS: SiteSettings = {
  whatsappNumber: "",
  business: EMPTY_BUSINESS,
  faq: [],
};

const KEYS = {
  whatsappNumber: "whatsapp.number",
  business: "business.info",
  faq: "faq.items",
} as const satisfies Record<keyof SiteSettings, string>;

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseBusiness(raw: string | undefined): BusinessInfo {
  const value = parseJson<Partial<BusinessInfo>>(raw, {});
  const result = { ...EMPTY_BUSINESS };
  for (const key of Object.keys(EMPTY_BUSINESS) as (keyof BusinessInfo)[]) {
    if (typeof value[key] === "string") result[key] = value[key];
  }
  return result;
}

function parseFaq(raw: string | undefined): FaqItem[] {
  const value = parseJson<unknown>(raw, []);
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { id, question, answer, published } = item as Record<string, unknown>;
    if (typeof question !== "string" || typeof answer !== "string") return [];
    return [
      {
        id: typeof id === "string" ? id : crypto.randomUUID(),
        question,
        answer,
        published: published !== false,
      },
    ];
  });
}

/**
 * Cached per request. Never throws: if the DB is unreachable the public site
 * still renders, just without admin-configured extras.
 */
// Only successful reads are cached: if the query throws, nothing is stored
// and the next request tries the DB again.
const loadSettingRows = unstable_cache(
  () =>
    prisma.siteSetting.findMany({
      where: { key: { in: Object.values(KEYS) } },
      select: { key: true, value: true },
    }),
  ["site-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: CACHE_SECONDS }
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  // Keep this outside the catch: Next.js must be able to stop prerendering.
  await connection();
  try {
    const rows = await loadSettingRows();
    const byKey = new Map(rows.map((row) => [row.key, row.value]));
    return {
      whatsappNumber: byKey.get(KEYS.whatsappNumber) ?? DEFAULTS.whatsappNumber,
      business: parseBusiness(byKey.get(KEYS.business)),
      faq: parseFaq(byKey.get(KEYS.faq)),
    };
  } catch (error) {
    console.error("Could not load site settings:", error);
    return DEFAULTS;
  }
});

/** Published FAQ entries with both a question and an answer. */
export function publicFaq(settings: SiteSettings) {
  return settings.faq.filter(
    (item) => item.published && item.question.trim() && item.answer.trim()
  );
}

/** True when at least one delivery/ordering fact has been provided. */
export function hasDeliveryInfo(business: BusinessInfo) {
  return BUSINESS_FIELDS.some(
    (field) =>
      field.group !== "business" &&
      field.key !== "quoteResponseTime" &&
      business[field.key].trim()
  );
}

export async function saveSiteSetting<K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K]
) {
  const stored = typeof value === "string" ? value : JSON.stringify(value);
  await prisma.siteSetting.upsert({
    where: { key: KEYS[key] },
    create: { key: KEYS[key], value: stored },
    update: { value: stored },
  });
}
