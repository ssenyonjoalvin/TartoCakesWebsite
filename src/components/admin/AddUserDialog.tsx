"use client";

import { useEffect, useId, useRef, useState } from "react";
import AdminUserForm from "@/components/admin/AdminUserForm";

export default function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-tarto-red/90"
      >
        <span className="text-base leading-none">+</span>
        Add user
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-bold text-[#2B2B2B]">
                  Add user
                </h2>
                <p className="mt-1 text-sm text-[#777]">
                  Editors can post blogs. Admins can also manage users.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-lg leading-none text-[#888] hover:bg-[#F5F5F5] hover:text-tarto-ink"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <AdminUserForm
              embedded
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
