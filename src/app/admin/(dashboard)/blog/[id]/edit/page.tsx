import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BlogPostForm, {
  type BlogFormPost,
} from "@/components/admin/BlogPostForm";
import type { BlogSectionInput } from "@/app/admin/(dashboard)/blog/actions";

export const metadata: Metadata = { title: "Edit Blog Post" };

type Props = {
  params: Promise<{ id: string }>;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asSections(value: unknown): BlogSectionInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const heading = String(record.heading ?? "").trim();
      const body = String(record.body ?? "").trim();
      if (!heading && !body) return null;
      return { heading, body };
    })
    .filter((item): item is BlogSectionInput => item !== null);
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;

  const [post, occasions] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id } }),
    prisma.occasion.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!post) notFound();

  const formPost: BlogFormPost = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    coverImage: post.coverImage,
    gallery: asStringArray(post.gallery),
    sections: asSections(post.sections),
    quote: post.quote,
    featured: post.featured,
    occasionId: post.occasionId,
    status: post.status,
  };

  return (
    <div>
      <AdminPageHeader
        title="Edit Post"
        description={`Update ${post.title}.`}
        actions={
          <Link
            href="/admin/blog"
            className="rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#444] hover:bg-[#F7F7F7]"
          >
            Back to blog
          </Link>
        }
      />
      <BlogPostForm mode="edit" post={formPost} occasions={occasions} />
    </div>
  );
}
