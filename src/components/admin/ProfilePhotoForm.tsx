"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import {
  removeProfilePhoto,
  updateProfilePhoto,
  type PhotoFormState,
} from "@/app/admin/(dashboard)/profile/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDeleteForm";

type Props = {
  name: string;
  avatarUrl: string | null;
};

const initialState: PhotoFormState = {};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfilePhotoForm({ name, avatarUrl }: Props) {
  const [state, formAction, pending] = useActionState(
    updateProfilePhoto,
    initialState
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [removeState, setRemoveState] = useState<PhotoFormState>({});
  const [removing, setRemoving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displaySrc = preview ?? avatarUrl;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  async function handleRemove() {
    setConfirmOpen(false);
    setRemoving(true);
    setRemoveState({});
    const result = await removeProfilePhoto();
    setRemoveState(result);
    setRemoving(false);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const feedback = state.error || state.success || removeState.error || removeState.success;
  const feedbackIsError = Boolean(state.error || removeState.error);

  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="relative h-32 w-32 overflow-hidden rounded-full bg-tarto-red">
          {displaySrc ? (
            <Image
              src={displaySrc}
              alt={`${name} profile photo`}
              fill
              className="object-cover"
              unoptimized={displaySrc.startsWith("blob:")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
              {initials(name) || "TC"}
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-[#777]">
          JPG, PNG, WEBP, or GIF. Max 2MB.
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-tarto-ink">Choose photo</span>
          <input
            ref={inputRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="mt-1.5 block w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-tarto-red file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-tarto-red px-5 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90 disabled:opacity-70"
        >
          {pending ? "Uploading..." : "Upload photo"}
        </button>
      </form>

      {avatarUrl ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={removing || pending}
          className="mt-3 w-full rounded-xl border border-[#E0E0E0] px-5 py-2.5 text-sm font-semibold text-tarto-ink/70 transition hover:border-tarto-red/30 hover:text-tarto-red disabled:opacity-70"
        >
          {removing ? "Removing..." : "Remove photo"}
        </button>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Remove photo"
        message="Remove this profile photo? This cannot be undone."
        confirmLabel="Remove"
        pending={removing}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void handleRemove();
        }}
      />

      {feedback ? (
        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            feedbackIsError
              ? "bg-tarto-red/10 text-tarto-red"
              : "bg-[#E8F5EC] text-[#2F6B45]"
          }`}
          role={feedbackIsError ? "alert" : "status"}
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
