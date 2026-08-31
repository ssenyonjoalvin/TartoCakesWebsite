"use client";

import { useActionState, useState } from "react";
import {
  updateOwnProfile,
  type ProfileFormState,
} from "@/app/admin/(dashboard)/profile/actions";
import type { AdminRole } from "@/generated/prisma/client";

type Props = {
  user: {
    name: string;
    email: string;
    role: AdminRole;
  };
};

const initialState: ProfileFormState = {};

const fieldClass =
  "w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm text-tarto-ink outline-none focus:border-tarto-red/40 focus:bg-white";
const inputClass = `mt-1.5 ${fieldClass}`;

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mt-4">
      <label htmlFor={id} className="text-sm font-bold text-tarto-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          minLength={minLength}
          autoComplete={autoComplete}
          className={`${fieldClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-3 flex items-center text-tarto-ink/35 transition hover:text-tarto-red"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? (
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
              aria-hidden
            >
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
              <path d="m4 4 16 16" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
              aria-hidden
            >
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProfileForm({ user }: Props) {
  const [state, formAction, pending] = useActionState(
    updateOwnProfile,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="text-sm font-bold text-tarto-ink">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={user.name}
          key={`name-${user.name}`}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-bold text-tarto-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={user.email}
          key={`email-${user.email}`}
          className={inputClass}
        />
      </div>

      <div className="rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] p-4">
        <p className="text-sm font-bold text-tarto-ink">Change password</p>
        <p className="mt-1 text-xs text-tarto-ink/55">
          Required when updating your email. Leave new password blank to keep
          your current one.
        </p>

        <PasswordField
          id="currentPassword"
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
        />

        <PasswordField
          id="newPassword"
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          minLength={8}
        />
        <p className="mt-1 text-xs text-tarto-ink/55">
          At least 8 characters.
        </p>
      </div>

      {state.error ? (
        <p
          className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          className="rounded-md bg-[#E8F5EC] px-3 py-2 text-sm text-[#2F6B45]"
          role="status"
        >
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-tarto-red px-5 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90 disabled:opacity-70"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
