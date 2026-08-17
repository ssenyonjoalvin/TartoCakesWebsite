import { randomBytes } from "crypto";
import { mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  folderFromUrl,
  type MediaFolder,
  type MediaItem,
} from "@/lib/media-types";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 12;

const MANAGED_FOLDERS: Exclude<MediaFolder, "site">[] = [
  "library",
  "products",
  "blog",
  "avatars",
  "quotes",
];

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [value.trim()];
    }
  }
  return [];
}

function imagesDir(...parts: string[]) {
  return path.join(process.cwd(), "public", "images", ...parts);
}

export async function saveLibraryImages(files: File[]) {
  if (files.length > MAX_FILES) {
    throw new Error(`You can upload up to ${MAX_FILES} images at a time.`);
  }

  const uploadDir = imagesDir("library");
  await mkdir(uploadDir, { recursive: true });

  const saved: { filename: string; url: string; mimeType: string }[] = [];

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
    saved.push({
      filename,
      url: `/images/library/${filename}`,
      mimeType: file.type,
    });
  }

  return saved;
}

export async function deleteMediaFile(url: string) {
  const folder = folderFromUrl(url);
  if (folder === "site") {
    throw new Error("Built-in site photos cannot be deleted from here.");
  }
  if (!url.startsWith(`/images/${folder}/`)) {
    throw new Error("That file is not in the media library.");
  }

  const filename = path.basename(url);
  const filePath = imagesDir(folder, filename);
  try {
    await unlink(filePath);
  } catch {
    // ignore missing files
  }
}

async function listFolderFiles(folder: Exclude<MediaFolder, "site">) {
  const dir = imagesDir(folder);
  let names: string[] = [];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const items: Omit<MediaItem, "id" | "usedBy" | "canDelete">[] = [];

  for (const name of names) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    const filePath = path.join(dir, name);
    const info = await stat(filePath);
    if (!info.isFile()) continue;

    items.push({
      filename: name,
      url: `/images/${folder}/${name}`,
      folder,
      sizeBytes: info.size,
      createdAt: info.mtime.toISOString(),
    });
  }

  return items;
}

async function listSiteFiles() {
  const dir = imagesDir();
  let names: string[] = [];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const items: Omit<MediaItem, "id" | "usedBy" | "canDelete">[] = [];

  for (const name of names) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    const filePath = path.join(dir, name);
    const info = await stat(filePath);
    if (!info.isFile()) continue;

    items.push({
      filename: name,
      url: `/images/${name}`,
      folder: "site",
      sizeBytes: info.size,
      createdAt: info.mtime.toISOString(),
    });
  }

  return items;
}

async function collectUsage() {
  const usage = new Map<string, string[]>();

  function add(url: string | null | undefined, label: string) {
    if (!url) return;
    const list = usage.get(url) ?? [];
    if (!list.includes(label)) list.push(label);
    usage.set(url, list);
  }

  const [cakes, posts, users, orders] = await Promise.all([
    prisma.cake.findMany({
      select: { name: true, image: true, images: true },
    }),
    prisma.blogPost.findMany({
      select: { title: true, coverImage: true, gallery: true },
    }),
    prisma.adminUser.findMany({
      select: { name: true, avatarUrl: true },
    }),
    prisma.cakeOrder.findMany({
      select: { name: true, cakeName: true, referenceImages: true },
    }),
  ]);

  for (const cake of cakes) {
    add(cake.image, `Product: ${cake.name}`);
    for (const src of asStringArray(cake.images)) {
      add(src, `Product: ${cake.name}`);
    }
  }

  for (const post of posts) {
    add(post.coverImage, `Blog: ${post.title}`);
    for (const src of asStringArray(post.gallery)) {
      add(src, `Blog: ${post.title}`);
    }
  }

  for (const user of users) {
    add(user.avatarUrl, `Profile: ${user.name}`);
  }

  for (const order of orders) {
    const label = `Quote: ${order.cakeName || order.name}`;
    for (const src of asStringArray(order.referenceImages)) {
      add(src, label);
    }
  }

  return usage;
}

export async function listMediaItems(): Promise<MediaItem[]> {
  const [folderFiles, siteFiles, assets, usage] = await Promise.all([
    Promise.all(MANAGED_FOLDERS.map((folder) => listFolderFiles(folder))),
    listSiteFiles(),
    prisma.mediaAsset.findMany(),
    collectUsage(),
  ]);

  const assetByUrl = new Map(assets.map((item) => [item.url, item]));
  const files = [...folderFiles.flat(), ...siteFiles];

  return files
    .map((file) => {
      const usedBy = usage.get(file.url) ?? [];
      const asset = assetByUrl.get(file.url);
      return {
        ...file,
        id: asset?.id ?? null,
        usedBy,
        canDelete: file.folder !== "site" && usedBy.length === 0,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function parseMediaUrls(formData: FormData, field: string) {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const value of formData.getAll(field)) {
    const url = String(value).trim();
    if (!url.startsWith("/images/")) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }

  return urls;
}

export function filesFromFormData(formData: FormData, field = "imageFiles") {
  return formData
    .getAll(field)
    .filter((value): value is File => value instanceof File && value.size > 0);
}
