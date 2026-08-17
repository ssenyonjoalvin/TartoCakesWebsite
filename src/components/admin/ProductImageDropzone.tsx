"use client";

import { useEffect, useId, useRef, useState } from "react";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";
import type { MediaItem } from "@/lib/media-types";

export const MAX_PRODUCT_IMAGES = 12;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type Props = {
  existingImages: string[];
  keptImages: string[];
  onKeptImagesChange: (images: string[]) => void;
  libraryImages: string[];
  onLibraryImagesChange: (images: string[]) => void;
  libraryItems: MediaItem[];
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
  onError: (message: string | undefined) => void;
  required?: boolean;
};

export function validateProductImageFiles(
  files: File[],
  keptCount: number,
  libraryCount: number,
  requireAtLeastOne: boolean
): string | undefined {
  if (files.length + keptCount + libraryCount > MAX_PRODUCT_IMAGES) {
    return `You can add up to ${MAX_PRODUCT_IMAGES} images per product.`;
  }
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return "Only JPG, PNG, WEBP, or GIF images are allowed.";
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return "Each image must be under 5MB.";
    }
  }
  if (requireAtLeastOne && files.length + keptCount + libraryCount === 0) {
    return "Upload at least one product image.";
  }
  return undefined;
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function ProductImageDropzone({
  existingImages,
  keptImages,
  onKeptImagesChange,
  libraryImages,
  onLibraryImagesChange,
  libraryItems,
  files,
  onFilesChange,
  error,
  onError,
  required = false,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<{ key: string; url: string }[]>([]);

  useEffect(() => {
    const next = files.map((file) => ({
      key: fileKey(file),
      url: URL.createObjectURL(file),
    }));
    setPreviews(next);
    return () => {
      next.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  useEffect(() => {
    if (!inputRef.current) return;
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    inputRef.current.files = dataTransfer.files;
  }, [files]);

  const remainingSlots = Math.max(
    0,
    MAX_PRODUCT_IMAGES - keptImages.length - libraryImages.length - files.length
  );

  function addFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming).filter((file) => file.size > 0);
    if (list.length === 0) return;

    const invalid = list.find(
      (file) =>
        !ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES
    );
    if (invalid) {
      if (!ALLOWED_IMAGE_TYPES.has(invalid.type)) {
        onError("Only JPG, PNG, WEBP, or GIF images are allowed.");
      } else {
        onError("Each image must be under 5MB.");
      }
      return;
    }

    if (remainingSlots <= 0) {
      onError(`You can add up to ${MAX_PRODUCT_IMAGES} images per product.`);
      return;
    }

    const existingKeys = new Set(files.map(fileKey));
    const unique = list.filter((file) => !existingKeys.has(fileKey(file)));
    if (unique.length === 0) return;

    const accepted = unique.slice(0, remainingSlots);
    if (unique.length > remainingSlots) {
      onError(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added (${MAX_PRODUCT_IMAGES} max).`
      );
    } else {
      onError(undefined);
    }

    onFilesChange([...files, ...accepted]);
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
    onError(undefined);
  }

  function toggleKept(src: string, keep: boolean) {
    if (keep) {
      if (keptImages.length + libraryImages.length + files.length >= MAX_PRODUCT_IMAGES) {
        onError(`You can add up to ${MAX_PRODUCT_IMAGES} images per product.`);
        return;
      }
      onKeptImagesChange(
        keptImages.includes(src) ? keptImages : [...keptImages, src]
      );
    } else {
      onKeptImagesChange(keptImages.filter((item) => item !== src));
    }
    onError(undefined);
  }

  function removeLibraryImage(url: string) {
    onLibraryImagesChange(libraryImages.filter((item) => item !== url));
    onError(undefined);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#333]">
        Images <span className="text-tarto-red">*</span>
      </p>
      <p className="mt-1 text-xs text-[#888]">
        Drag and drop multiple photos, choose from the media library, or click to
        browse. Up to {MAX_PRODUCT_IMAGES} images (JPG, PNG, WEBP, GIF · max 5MB
        each). The first image is the main photo.
      </p>

      <div className="mt-3">
        <MediaLibraryPicker
          items={libraryItems}
          selected={libraryImages}
          onChange={(urls) => {
            const limit = MAX_PRODUCT_IMAGES - keptImages.length - files.length;
            const next = urls.slice(0, Math.max(0, limit));
            if (urls.length > next.length) {
              onError(`You can add up to ${MAX_PRODUCT_IMAGES} images per product.`);
            } else {
              onError(undefined);
            }
            onLibraryImagesChange(next);
          }}
          max={MAX_PRODUCT_IMAGES}
        />
      </div>

      {libraryImages.map((url) => (
        <input key={url} type="hidden" name="libraryImages" value={url} />
      ))}

      {existingImages.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {existingImages.map((src) => {
            const kept = keptImages.includes(src);
            const isMain = kept && keptImages[0] === src;
            return (
              <div
                key={src}
                className="relative overflow-hidden rounded-xl bg-[#FAFAFA]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className={`h-32 w-full object-cover ${kept ? "" : "opacity-40"}`}
                />
                {isMain ? (
                  <span className="absolute left-2 top-2 rounded-md bg-tarto-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Main
                  </span>
                ) : null}
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <label className="flex items-center gap-1.5 text-xs text-[#555]">
                    <input
                      type="checkbox"
                      name="keepImages"
                      value={src}
                      checked={kept}
                      onChange={(event) =>
                        toggleKept(src, event.target.checked)
                      }
                      className="h-3.5 w-3.5 accent-tarto-red"
                    />
                    Keep
                  </label>
                  {kept ? (
                    <button
                      type="button"
                      onClick={() => toggleKept(src, false)}
                      className="text-xs font-semibold text-tarto-red hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <label
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          error
            ? "border-tarto-red bg-[#FFF5F5]"
            : dragging
              ? "border-tarto-red bg-[#FFF8F8]"
              : "border-[#D8D8D8] bg-[#FAFAFA] hover:border-tarto-red/50 hover:bg-[#FFF8F8]"
        } ${remainingSlots <= 0 ? "opacity-60" : ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 fill-none stroke-current stroke-[1.5] text-[#999]"
          aria-hidden
        >
          <path d="M12 16V4" />
          <path d="m8 8 4-4 4 4" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <p className="mt-3 text-sm font-semibold text-[#333]">
          {dragging ? "Drop images here" : "Drag & drop product photos here"}
        </p>
        <p className="mt-1 text-xs text-[#888]">
          or click to choose files
          {remainingSlots < MAX_PRODUCT_IMAGES
            ? ` · ${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} left`
            : ""}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          name="imageFiles"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          required={
            required &&
            keptImages.length === 0 &&
            libraryImages.length === 0 &&
            files.length === 0
          }
          aria-invalid={Boolean(error)}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files ?? []);
            event.target.value = "";
          }}
        />
      </label>

      {libraryImages.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {libraryImages.map((src, index) => {
            const isMain =
              keptImages.length === 0 && files.length === 0 && index === 0;
            return (
              <div
                key={src}
                className="relative overflow-hidden rounded-xl bg-[#FAFAFA]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-32 w-full object-cover"
                />
                {isMain ? (
                  <span className="absolute left-2 top-2 rounded-md bg-tarto-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Main
                  </span>
                ) : null}
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <p className="truncate text-xs text-[#666]">From library</p>
                  <button
                    type="button"
                    onClick={() => removeLibraryImage(src)}
                    className="shrink-0 text-xs font-semibold text-tarto-red hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {files.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {files.map((file, index) => {
            const preview = previews.find((item) => item.key === fileKey(file));
            const isMain =
              keptImages.length === 0 &&
              libraryImages.length === 0 &&
              index === 0;
            return (
              <div
                key={fileKey(file)}
                className="relative overflow-hidden rounded-xl bg-[#FAFAFA]"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.url}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center text-xs text-[#999]">
                    {file.name}
                  </div>
                )}
                {isMain ? (
                  <span className="absolute left-2 top-2 rounded-md bg-tarto-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Main
                  </span>
                ) : null}
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <p className="truncate text-xs text-[#666]" title={file.name}>
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="shrink-0 text-xs font-semibold text-tarto-red hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <p className="mt-2 text-xs text-[#999]">
        {keptImages.length + libraryImages.length + files.length} /{" "}
        {MAX_PRODUCT_IMAGES} images
      </p>
    </div>
  );
}
