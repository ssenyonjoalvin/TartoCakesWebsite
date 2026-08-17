import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_QUOTE_IMAGES = 3;

function extensionFor(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpeg") return "jpg";
  if (ext === "jpg" || ext === "png" || ext === "webp" || ext === "gif") {
    return ext;
  }
  return "jpg";
}

function isAllowedImage(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && ALLOWED_EXTENSIONS.has(ext));
}

export async function saveQuoteImages(files: File[]) {
  if (files.length > MAX_QUOTE_IMAGES) {
    throw new Error(`You can attach up to ${MAX_QUOTE_IMAGES} photos.`);
  }

  const uploadDir = path.join(process.cwd(), "public", "images", "quotes");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (file.size === 0) continue;
    if (!isAllowedImage(file)) {
      throw new Error("Only JPG, PNG, WEBP, or GIF photos are allowed.");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Each photo must be under 5MB.");
    }

    const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${extensionFor(file)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/images/quotes/${filename}`);
  }

  return urls;
}

export function filesFromFormData(formData: FormData, field = "referenceImages") {
  return formData.getAll(field).filter((value): value is File => {
    if (typeof File !== "undefined" && value instanceof File) {
      return value.size > 0;
    }
    if (typeof Blob !== "undefined" && value instanceof Blob && value.size > 0) {
      return true;
    }
    return false;
  });
}
