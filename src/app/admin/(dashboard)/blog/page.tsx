import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogManager, { type BlogRow } from "@/components/admin/BlogManager";

export const metadata: Metadata = { title: "Blog Management" };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminBlogPage() {
  const rows = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      authorUser: true,
    },
  });

  const posts: BlogRow[] = rows.map((row) => {
    const authorName = row.authorUser?.name ?? "Tarto Team";
    const dateSource = row.publishedAt ?? row.createdAt;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      thumbnail: row.coverImage || null,
      category: row.category,
      status: row.status,
      authorName,
      authorInitials: initials(authorName) || "TT",
      dateLabel: dateSource.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  });

  return <BlogManager posts={posts} />;
}
