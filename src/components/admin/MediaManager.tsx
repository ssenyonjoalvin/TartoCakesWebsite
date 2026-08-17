"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import {
  deleteMedia,
  uploadMedia,
  type MediaFormState,
} from "@/app/admin/(dashboard)/media/actions";
import TablePagination from "@/components/admin/TablePagination";
import { useTablePagination } from "@/components/admin/useTablePagination";
import {
  MEDIA_FOLDERS,
  formatFileSize,
  type MediaFolder,
  type MediaItem,
} from "@/lib/media-types";

type Props = {
  items: MediaItem[];
};

const initialState: MediaFormState = {};

const folderStyles: Record<MediaFolder, string> = {
  library: "bg-[#FBEAEA] text-tarto-red",
  products: "bg-[#F8E9B8] text-[#8A6A18]",
  blog: "bg-[#E8EEF6] text-[#4A5F7A]",
  avatars: "bg-[#E8F5EC] text-[#2F6B45]",
  quotes: "bg-[#FFF3E8] text-[#8A4A12]",
  site: "bg-[#EBEBEB] text-[#555]",
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#555] transition hover:bg-[#F5F5F5] hover:text-tarto-red"
    >
      {copied ? "Copied" : "Copy URL"}
    </button>
  );
}

export default function MediaManager({ items }: Props) {
  const [state, formAction, pending] = useActionState(uploadMedia, initialState);
  const [folder, setFolder] = useState<MediaFolder | "all">("all");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (folder !== "all" && item.folder !== folder) return false;
      if (!term) return true;
      return (
        item.filename.toLowerCase().includes(term) ||
        item.usedBy.some((label) => label.toLowerCase().includes(term))
      );
    });
  }, [items, folder, query]);

  const pagination = useTablePagination(visible, `${folder}:${query}`);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: items.length };
    for (const item of items) {
      next[item.folder] = (next[item.folder] ?? 0) + 1;
    }
    return next;
  }, [items]);

  return (
    <div>
      <form
        action={formAction}
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
          const files = event.dataTransfer.files;
          if (!files?.length || !inputRef.current) return;
          const transfer = new DataTransfer();
          Array.from(files).forEach((file) => transfer.items.add(file));
          inputRef.current.files = transfer.files;
          setSelectedCount(transfer.files.length);
          event.currentTarget.requestSubmit();
        }}
        className={`rounded-2xl border-2 border-dashed bg-white px-6 py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition ${
          dragging
            ? "border-tarto-red bg-[#FFF8F8]"
            : "border-[#D8D8D8]"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="mx-auto h-10 w-10 fill-none stroke-current stroke-[1.5] text-[#999]"
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="m21 16-5-5-7 7" />
        </svg>
        <p className="mt-3 text-sm font-semibold text-[#2B2B2B]">
          {dragging ? "Drop images here" : "Upload photos to the library"}
        </p>
        <p className="mt-1 text-xs text-[#888]">
          JPG, PNG, WEBP, or GIF · up to 12 files · 5MB each
        </p>
        <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90">
          Choose files
          <input
            ref={inputRef}
            type="file"
            name="imageFiles"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={(event) => {
              const count = event.target.files?.length ?? 0;
              setSelectedCount(count);
              if (count > 0) event.currentTarget.form?.requestSubmit();
            }}
          />
        </label>
        {pending ? (
          <p className="mt-3 text-sm text-[#777]">Uploading...</p>
        ) : selectedCount > 0 ? (
          <p className="mt-3 text-sm text-[#777]">
            {selectedCount} file{selectedCount === 1 ? "" : "s"} selected
          </p>
        ) : null}
        {state.error ? (
          <p className="mt-3 text-sm text-tarto-red" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="mt-3 text-sm text-[#2F6B45]" role="status">
            {state.success}
          </p>
        ) : null}
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {MEDIA_FOLDERS.map((item) => {
            const active = folder === item.id;
            const count = counts[item.id] ?? 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFolder(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-tarto-red text-white"
                    : "border border-[#E0E0E0] bg-white text-[#555] hover:bg-[#F7F7F7]"
                }`}
              >
                {item.label}
                <span className={`ml-1.5 ${active ? "text-white/80" : "text-[#999]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search photos..."
          className="w-full max-w-xs rounded-full border border-[#E6E6E6] bg-white px-4 py-2 text-sm outline-none placeholder:text-[#A0A0A0] focus:border-tarto-red/30"
        />
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#E0E0E0] bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#555]">No photos yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#888]">
            Upload images here to reuse them across products, blog posts, and
            the public site.
          </p>
        </div>
      ) : (
        <>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagination.items.map((item) => (
            <article
              key={item.url}
              className="overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
            >
              <div className="relative aspect-[4/3] bg-[#F7F7F7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.filename}
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${folderStyles[item.folder]}`}
                >
                  {item.folder}
                </span>
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-semibold text-[#2B2B2B]" title={item.filename}>
                  {item.filename}
                </p>
                <p className="mt-1 text-xs text-[#888]">
                  {formatFileSize(item.sizeBytes)} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString("en-UG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {item.usedBy.length > 0 ? (
                  <p className="mt-2 line-clamp-2 text-xs text-[#6A6A6A]">
                    Used in {item.usedBy.join(", ")}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-[#999]">Not in use</p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <CopyButton value={item.url} />
                  {item.canDelete ? (
                    <form action={deleteMedia}>
                      <input type="hidden" name="url" value={item.url} />
                      <button
                        type="submit"
                        onClick={(event) => {
                          if (
                            !window.confirm(
                              `Delete ${item.filename}? This cannot be undone.`
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-tarto-red transition hover:bg-[#FBEAEA]"
                      >
                        Delete
                      </button>
                    </form>
                  ) : (
                    <span className="px-2.5 py-1.5 text-xs text-[#AAA]">
                      {item.folder === "site" ? "Protected" : "In use"}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white">
          <TablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            onPageChange={pagination.setPage}
            label="photos"
          />
        </div>
        </>
      )}
    </div>
  );
}
