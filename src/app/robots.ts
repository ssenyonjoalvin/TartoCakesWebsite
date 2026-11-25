import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Staff area, API routes and personal quote confirmations.
      disallow: ["/admin", "/api", "/quote"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
