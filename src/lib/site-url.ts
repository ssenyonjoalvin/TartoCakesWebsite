/**
 * Absolute base URL for canonical links, the sitemap, Open Graph and
 * structured data.
 *
 * Set NEXT_PUBLIC_SITE_URL to the real domain (e.g. https://tartocakes.ug)
 * in production. Vercel's own variables are the fallback, so preview
 * deployments still produce working absolute URLs.
 */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
