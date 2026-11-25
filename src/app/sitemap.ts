import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/public-blog";
import { getPublishedCakes } from "@/lib/public-cakes";
import {
  getSiteSettings,
  hasDeliveryInfo,
  publicFaq,
} from "@/lib/site-settings";
import { absoluteUrl } from "@/lib/site-url";

// Rebuilt at most once an hour; the catalog itself is cached separately.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cakes, posts, settings] = await Promise.all([
    getPublishedCakes().catch(() => []),
    getPublishedBlogPosts().catch(() => []),
    getSiteSettings(),
  ]);

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/cakes"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/design-your-cake"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Same rule as the pages themselves: only list them once they have content.
  if (hasDeliveryInfo(settings.business)) {
    pages.push({ url: absoluteUrl("/delivery"), changeFrequency: "monthly", priority: 0.6 });
  }
  if (publicFaq(settings).length > 0) {
    pages.push({ url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.6 });
  }

  return [
    ...pages,
    ...cakes.map((cake) => ({
      url: absoluteUrl(`/cakes/${cake.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: cake.image ? [absoluteUrl(cake.image)] : undefined,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
