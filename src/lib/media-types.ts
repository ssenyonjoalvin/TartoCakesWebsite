export type MediaFolder =
  | "library"
  | "products"
  | "blog"
  | "avatars"
  | "quotes"
  | "site";

export const MEDIA_FOLDERS: { id: MediaFolder | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "library", label: "Library" },
  { id: "products", label: "Products" },
  { id: "blog", label: "Blog" },
  { id: "quotes", label: "Quote photos" },
  { id: "avatars", label: "Avatars" },
  { id: "site", label: "Site" },
];

export type MediaItem = {
  id: string | null;
  filename: string;
  url: string;
  folder: MediaFolder;
  sizeBytes: number;
  createdAt: string;
  usedBy: string[];
  canDelete: boolean;
};

export function folderFromUrl(url: string): MediaFolder {
  if (url.startsWith("/images/library/")) return "library";
  if (url.startsWith("/images/products/")) return "products";
  if (url.startsWith("/images/blog/")) return "blog";
  if (url.startsWith("/images/avatars/")) return "avatars";
  if (url.startsWith("/images/quotes/")) return "quotes";
  return "site";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
