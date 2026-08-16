"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { filesFromFormData, saveBlogImages } from "@/lib/blog-images";
import type { BlogStatus } from "@/generated/prisma/client";

export type BlogFormState = {
  error?: string;
};

export type BlogSectionInput = {
  heading: string;
  body: string;
};

async function requireSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "post";
  let n = 1;
  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

function parseSections(formData: FormData): BlogSectionInput[] {
  const headings = formData
    .getAll("sectionHeading")
    .map((value) => String(value).trim());
  const bodies = formData
    .getAll("sectionBody")
    .map((value) => String(value).trim());

  const count = Math.max(headings.length, bodies.length);
  const sections: BlogSectionInput[] = [];

  for (let i = 0; i < count; i += 1) {
    const heading = headings[i] ?? "";
    const body = bodies[i] ?? "";
    if (!heading && !body) continue;
    sections.push({ heading, body });
  }

  return sections;
}

function parseKeepImages(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

async function resolveImageField(
  formData: FormData,
  fileField: string,
  keepField: string
) {
  const kept = parseKeepImages(formData, keepField);
  const uploadedFiles = filesFromFormData(formData, fileField);
  let uploaded: string[] = [];
  try {
    uploaded = await saveBlogImages(uploadedFiles);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not upload images.",
    } as const;
  }
  return { images: [...kept, ...uploaded] } as const;
}

export async function createBlogPost(
  _prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim() || null;
  const occasionId = String(formData.get("occasionId") ?? "").trim() || null;
  const featured = formData.get("featured") === "on";
  const statusRaw = String(formData.get("status") ?? "DRAFT").trim();
  const status: BlogStatus =
    statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const sections = parseSections(formData);

  if (!title) return { error: "Title is required." };
  if (!excerpt) return { error: "Excerpt is required." };
  if (!category) return { error: "Category is required." };
  if (sections.length === 0) {
    return { error: "Add at least one content section." };
  }
  if (sections.some((section) => !section.heading || !section.body)) {
    return { error: "Each section needs a heading and body." };
  }

  const coverResult = await resolveImageField(
    formData,
    "coverImageFile",
    "keepCoverImage"
  );
  if ("error" in coverResult) return { error: coverResult.error };
  const coverImage = coverResult.images[0] ?? "";
  if (!coverImage) return { error: "Upload a cover image." };

  const galleryResult = await resolveImageField(
    formData,
    "galleryImageFiles",
    "keepGalleryImages"
  );
  if ("error" in galleryResult) return { error: galleryResult.error };
  const gallery = galleryResult.images;

  if (occasionId) {
    const occasion = await prisma.occasion.findUnique({
      where: { id: occasionId },
    });
    if (!occasion) return { error: "Selected occasion was not found." };
  }

  const slug = await uniqueSlug(title);

  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      category,
      coverImage,
      gallery,
      sections,
      quote,
      featured,
      authorId: session.id,
      occasionId,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updateBlogPost(
  _prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim() || null;
  const occasionId = String(formData.get("occasionId") ?? "").trim() || null;
  const featured = formData.get("featured") === "on";
  const statusRaw = String(formData.get("status") ?? "DRAFT").trim();
  const status: BlogStatus =
    statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const sections = parseSections(formData);

  if (!id) return { error: "Post not found." };
  if (!title) return { error: "Title is required." };
  if (!excerpt) return { error: "Excerpt is required." };
  if (!category) return { error: "Category is required." };
  if (sections.length === 0) {
    return { error: "Add at least one content section." };
  }
  if (sections.some((section) => !section.heading || !section.body)) {
    return { error: "Each section needs a heading and body." };
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found." };

  const coverResult = await resolveImageField(
    formData,
    "coverImageFile",
    "keepCoverImage"
  );
  if ("error" in coverResult) return { error: coverResult.error };
  const coverImage = coverResult.images[0] ?? "";
  if (!coverImage) return { error: "Upload a cover image." };

  const galleryResult = await resolveImageField(
    formData,
    "galleryImageFiles",
    "keepGalleryImages"
  );
  if ("error" in galleryResult) return { error: galleryResult.error };
  const gallery = galleryResult.images;

  if (occasionId) {
    const occasion = await prisma.occasion.findUnique({
      where: { id: occasionId },
    });
    if (!occasion) return { error: "Selected occasion was not found." };
  }

  const slug = await uniqueSlug(title, id);
  const publishedAt =
    status === "PUBLISHED"
      ? existing.publishedAt ?? new Date()
      : null;

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      category,
      coverImage,
      gallery,
      sections,
      quote,
      featured,
      occasionId,
      status,
      publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function toggleBlogStatus(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;

  const nextStatus: BlogStatus =
    post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await prisma.blogPost.update({
    where: { id },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === "PUBLISHED"
          ? post.publishedAt ?? new Date()
          : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
