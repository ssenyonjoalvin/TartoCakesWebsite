"use client";

import { useMemo, useState } from "react";
import type { MediaItem } from "@/lib/media-types";

type Props = {
  items: MediaItem[];
  selected: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  max?: number;
  buttonLabel?: string;
};

export default function MediaLibraryPicker({
  items,
  selected,
  onChange,
  multiple = true,
  max,
  buttonLabel = "Choose from library",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.filename.toLowerCase().includes(term) ||
        item.folder.toLowerCase().includes(term)
    );
  }, [items, query]);

  function openPicker() {
    setDraft(selected);
    setQuery("");
    setOpen(true);
  }

  function toggle(url: string) {
    if (multiple) {
      setDraft((current) => {
        if (current.includes(url)) {
          return current.filter((item) => item !== url);
        }
        const limit = max ?? Infinity;
        if (current.length >= limit) return current;
        return [...current, url];
      });
      return;
    }
    setDraft([url]);
  }

  function applySelection() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex items-center gap-2 rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#444] transition hover:bg-[#F7F7F7]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="m21 16-5-5-7 7" />
        </svg>
        {buttonLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/45 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-library-title"
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
          >
            <div className="border-b border-[#F0F0F0] px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    id="media-library-title"
                    className="text-lg font-bold text-[#2B2B2B]"
                  >
                    Choose from media library
                  </h2>
                  <p className="mt-1 text-sm text-[#777]">
                    {multiple
                      ? `Select up to ${max ?? "many"} photo${max === 1 ? "" : "s"}.`
                      : "Select one photo."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#666] hover:bg-[#F5F5F5]"
                >
                  Close
                </button>
              </div>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search photos..."
                className="mt-4 w-full rounded-full border border-[#E6E6E6] bg-[#F7F7F7] px-4 py-2.5 text-sm outline-none focus:border-tarto-red/30 focus:bg-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#888]">
                  No photos found. Upload some in Media Management first.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((item) => {
                    const isSelected = draft.includes(item.url);
                    return (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => toggle(item.url)}
                        className={`overflow-hidden rounded-xl border text-left transition ${
                          isSelected
                            ? "border-tarto-red ring-2 ring-tarto-red/20"
                            : "border-[#EBEBEB] hover:border-tarto-red/40"
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-[#F7F7F7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="h-full w-full object-cover"
                          />
                          {isSelected ? (
                            <span className="absolute right-2 top-2 rounded-full bg-tarto-red px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              Selected
                            </span>
                          ) : null}
                        </div>
                        <div className="px-3 py-2">
                          <p className="truncate text-xs font-semibold text-[#2B2B2B]">
                            {item.filename}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-[#999]">
                            {item.folder}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#F0F0F0] bg-[#FAFAFA] px-6 py-4">
              <p className="text-sm text-[#777]">
                {draft.length} selected
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#666] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applySelection}
                  className="rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90"
                >
                  Use selected
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
