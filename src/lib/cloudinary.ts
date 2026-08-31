import { v2 as cloudinary } from "cloudinary";
import type { MediaFolder } from "@/lib/media-types";

// cloudinary reads CLOUDINARY_URL from the environment automatically, but
// calling config() explicitly makes the "not configured" case fail fast
// with a clear error instead of a confusing upload failure later.
function ensureConfigured() {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error(
      "CLOUDINARY_URL is not set. Add it to your environment to enable image uploads."
    );
  }
  cloudinary.config({ secure: true });
}

export type CloudinaryUpload = {
  url: string;
  publicId: string;
  bytes: number;
  createdAt: string;
};

export function isCloudinaryUrl(url: string) {
  return url.includes("res.cloudinary.com");
}

const ROOT_FOLDER = "tarto";

export function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:[a-z_,]+\/)*(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match ? match[1] : null;
}

export async function uploadImage(
  file: File,
  folder: Exclude<MediaFolder, "site">
): Promise<CloudinaryUpload> {
  ensureConfigured();
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${ROOT_FOLDER}/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          createdAt: result.created_at,
        });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteImageByUrl(url: string) {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export async function listImages(folder: Exclude<MediaFolder, "site">) {
  ensureConfigured();
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: `${ROOT_FOLDER}/${folder}/`,
    max_results: 500,
  });

  return (result.resources as Array<{
    public_id: string;
    secure_url: string;
    bytes: number;
    created_at: string;
    format: string;
  }>).map((resource) => ({
    filename: `${resource.public_id.split("/").pop()}.${resource.format}`,
    url: resource.secure_url,
    sizeBytes: resource.bytes,
    createdAt: resource.created_at,
  }));
}
