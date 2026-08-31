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

const MANAGED_FOLDERS: Exclude<MediaFolder, "site">[] = [
  "library",
  "products",
  "blog",
  "avatars",
  "quotes",
];

export function folderFromUrl(url: string): MediaFolder {
  for (const folder of MANAGED_FOLDERS) {
    if (url.startsWith(`/images/${folder}/`)) return folder;
    if (url.includes(`/tarto/${folder}/`)) return folder;
  }
  return "site";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
