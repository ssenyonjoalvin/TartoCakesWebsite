import { deleteImageByUrl, isCloudinaryUrl, uploadImage } from "@/lib/cloudinary";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 2 * 1024 * 1024;

export async function saveProfileImage(file: File) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image to upload.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Profile photo must be under 2MB.");
  }

  const uploaded = await uploadImage(file, "avatars");
  return uploaded.url;
}

export async function deleteProfileImage(url: string | null | undefined) {
  if (!url || !isCloudinaryUrl(url)) return;
  try {
    await deleteImageByUrl(url);
  } catch {
    // ignore missing files
  }
}

export function avatarFromFormData(formData: FormData, field = "avatar") {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}
