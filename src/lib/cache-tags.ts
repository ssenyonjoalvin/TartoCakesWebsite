/**
 * Tags for cross-request data caching (see unstable_cache in
 * public-cakes.ts / site-settings.ts). Admin server actions call
 * updateTag(tag) after a change so customers see it on the next request.
 *
 * Every cached entry also expires after CACHE_SECONDS as a safety net, in
 * case some write path forgets to invalidate.
 */
export const CACHE_TAGS = {
  /** Cakes, occasions, sizes, flavours and review summaries. */
  catalog: "catalog",
  /** WhatsApp number, business info, FAQ. */
  settings: "site-settings",
} as const;

export const CACHE_SECONDS = 600;
