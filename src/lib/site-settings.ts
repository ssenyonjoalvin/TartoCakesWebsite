import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Admin-editable site settings, stored as key/value rows in `SiteSetting`.
 * Add a key here (with its default) to make it available everywhere.
 */
export type SiteSettings = {
  /** Digits only, international format (e.g. "256700796794"). "" = WhatsApp off. */
  whatsappNumber: string;
};

const DEFAULTS: SiteSettings = {
  whatsappNumber: "",
};

const KEYS = {
  whatsappNumber: "whatsapp.number",
} as const satisfies Record<keyof SiteSettings, string>;

/**
 * Cached per request. Never throws: if the DB is unreachable the public site
 * still renders, just without admin-configured extras (e.g. WhatsApp buttons).
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.values(KEYS) } },
    });
    const byKey = new Map(rows.map((row) => [row.key, row.value]));
    return {
      whatsappNumber: byKey.get(KEYS.whatsappNumber) ?? DEFAULTS.whatsappNumber,
    };
  } catch (error) {
    console.error("Could not load site settings:", error);
    return DEFAULTS;
  }
});

export async function saveSiteSetting<K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K]
) {
  await prisma.siteSetting.upsert({
    where: { key: KEYS[key] },
    create: { key: KEYS[key], value },
    update: { value },
  });
}
