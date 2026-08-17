import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listMediaItems } from "@/lib/media";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BlogPostForm from "@/components/admin/BlogPostForm";

export const metadata: Metadata = { title: "Create Blog Post" };

export default async function NewBlogPostPage() {
  const [occasions, libraryItems] = await Promise.all([
    prisma.occasion.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    listMediaItems(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Create New Post"
        description="Write a story, recipe tip, or bakery update."
        actions={
          <Link
            href="/admin/blog"
            className="rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#444] hover:bg-[#F7F7F7]"
          >
            Back to blog
          </Link>
        }
      />
      <BlogPostForm mode="create" occasions={occasions} libraryItems={libraryItems} />
    </div>
  );
}
