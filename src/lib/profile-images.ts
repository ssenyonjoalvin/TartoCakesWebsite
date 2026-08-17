import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 2 * 1024 * 1024;

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

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

  const uploadDir = path.join(process.cwd(), "public", "images", "avatars");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${extensionFor(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/images/avatars/${filename}`;
}

export async function deleteProfileImage(url: string | null | undefined) {
  if (!url || !url.startsWith("/images/avatars/")) return;

  const filePath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filePath);
  } catch {
    // ignore missing files
  }
}

export function avatarFromFormData(formData: FormData, field = "avatar") {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}
