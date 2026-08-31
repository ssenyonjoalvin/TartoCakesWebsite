import { prisma } from "@/lib/prisma";
import {
  blogPosts as staticPosts,
  type BlogPost,
} from "@/data/blog";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0
  );
}

function parseSections(value: unknown): BlogPost["sections"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const heading = String("heading" in item ? item.heading : "").trim();
    const body = String("body" in item ? item.body : "").trim();
    if (!heading && !body) return [];
    return [{ heading: heading || " ", body }];
  });
}

function formatPostDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function mapDbPost(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  gallery: unknown;
  sections: unknown;
  quote: string | null;
  featured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  authorUser: { name: string } | null;
}): BlogPost {
  const gallery = asStringArray(row.gallery);
  const sections = parseSections(row.sections);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.authorUser?.name ?? "Tarto Team",
    date: formatPostDate(row.publishedAt ?? row.createdAt),
    image: row.coverImage,
    gallery,
    sections:
      sections.length > 0
        ? sections
        : [{ heading: row.title, body: row.excerpt }],
    quote: row.quote ?? undefined,
    featured: row.featured,
  };
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  let dbPosts: BlogPost[] = [];

  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: { authorUser: { select: { name: true } } },
      orderBy: [
        { featured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    });
    dbPosts = rows.map(mapDbPost);
  } catch (error) {
    console.error("Failed to load blog posts:", error);
  }

  const dbSlugs = new Set(dbPosts.map((post) => post.slug));
  const extras = staticPosts.filter((post) => !dbSlugs.has(post.slug));
  return [...dbPosts, ...extras];
}

export async function getFeaturedBlogPost() {
  const posts = await getPublishedBlogPosts();
  return posts.find((post) => post.featured) ?? posts[0] ?? null;
}

export async function getRecentBlogPosts(limit = 3) {
  const posts = await getPublishedBlogPosts();
  return posts.slice(0, limit);
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getPublishedBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getRelatedBlogPosts(slug: string, limit = 3) {
  const posts = await getPublishedBlogPosts();
  const current = posts.find((post) => post.slug === slug);
  if (!current) return posts.slice(0, limit);

  const sameCategory = posts.filter(
    (post) => post.slug !== slug && post.category === current.category
  );
  const others = posts.filter(
    (post) => post.slug !== slug && post.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getBlogCategoryCounts(posts: BlogPost[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
