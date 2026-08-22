"use client";

import { useEffect, useId, useRef, useState } from "react";
import AdminUserForm from "@/components/admin/AdminUserForm";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import { deleteAdminUser } from "@/app/admin/(dashboard)/users/actions";
import type { AdminRole } from "@/generated/prisma/client";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
};

type Props = {
  user: UserData;
  canRemove: boolean;
};

export default function UserRowActions({ user, canRemove }: Props) {
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
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Edit ${user.name}`}
          title="Edit"
          className="rounded-lg p-2 text-[#2563EB] transition hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-none stroke-current stroke-2"
            aria-hidden
          >
            <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
            <path d="m13.5 6.5 3 3" />
          </svg>
        </button>
        {canRemove ? (
          <ConfirmDeleteForm
            action={deleteAdminUser}
            message={`Remove ${user.name}? This cannot be undone.`}
          >
            <input type="hidden" name="id" value={user.id} />
            <button
              type="submit"
              aria-label={`Remove ${user.name}`}
              title="Remove"
              className="rounded-lg p-2 text-tarto-red transition hover:bg-[#FBEAEA] hover:text-tarto-red"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-none stroke-current stroke-2"
                aria-hidden
              >
                <path d="M4 7h16" />
                <path d="M9 7V5h6v2" />
                <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </ConfirmDeleteForm>
        ) : null}
      </div>

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
                  Edit user
                </h2>
                <p className="mt-1 text-sm text-[#777]">
                  Update access for {user.name}. Blog posts they wrote stay
                  linked to this account.
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
              key={user.id}
              user={user}
              embedded
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
