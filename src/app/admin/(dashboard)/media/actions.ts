"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  deleteMediaFile,
  filesFromFormData,
  listMediaItems,
  saveLibraryImages,
} from "@/lib/media";

export type MediaFormState = {
  error?: string;
  success?: string;
};

async function requireSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function uploadMedia(
  _prev: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireSession();

  const files = filesFromFormData(formData);
  if (files.length === 0) {
    return { error: "Choose at least one image to upload." };
  }

  try {
    const saved = await saveLibraryImages(files);
    if (saved.length === 0) {
      return { error: "Choose at least one image to upload." };
    }

    await prisma.mediaAsset.createMany({
      data: saved.map((item) => ({
        filename: item.filename,
        url: item.url,
        mimeType: item.mimeType,
      })),
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not upload images.",
    };
  }

  revalidatePath("/admin/media");
  return {
    success:
      files.length === 1
        ? "Image uploaded to the library."
        : `${files.length} images uploaded to the library.`,
  };
}

export async function deleteMedia(formData: FormData): Promise<void> {
  await requireSession();

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;

  const items = await listMediaItems();
  const item = items.find((entry) => entry.url === url);
  if (!item) return;
  if (!item.canDelete) return;

  await deleteMediaFile(url);
  await prisma.mediaAsset.deleteMany({ where: { url } });

  revalidatePath("/admin/media");
}
