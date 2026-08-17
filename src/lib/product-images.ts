import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 12;

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function saveProductImages(files: File[]) {
  if (files.length > MAX_IMAGES) {
    throw new Error(`You can upload up to ${MAX_IMAGES} images at a time.`);
  }

  const uploadDir = path.join(process.cwd(), "public", "images", "products");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Each image must be under 5MB.");
    }

    const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${extensionFor(file.type)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/images/products/${filename}`);
  }

  return urls;
}

export function filesFromFormData(formData: FormData, field = "imageFiles") {
  return formData
    .getAll(field)
    .filter((value): value is File => value instanceof File && value.size > 0);
}
