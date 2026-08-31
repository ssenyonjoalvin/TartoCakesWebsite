import { uploadImage } from "@/lib/cloudinary";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 8;

export async function saveBlogImages(files: File[]) {
  if (files.length > MAX_IMAGES) {
    throw new Error(`You can upload up to ${MAX_IMAGES} images.`);
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Each image must be under 5MB.");
    }

    const uploaded = await uploadImage(file, "blog");
    urls.push(uploaded.url);
  }

  return urls;
}

export function filesFromFormData(formData: FormData, field = "imageFiles") {
  return formData
    .getAll(field)
    .filter((value): value is File => value instanceof File && value.size > 0);
}
