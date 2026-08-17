"use client";

import { useActionState } from "react";
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

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm text-tarto-ink outline-none focus:border-tarto-red/40 focus:bg-white";

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

        <div className="mt-4">
          <label
            htmlFor="currentPassword"
            className="text-sm font-bold text-tarto-ink"
          >
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="newPassword"
            className="text-sm font-bold text-tarto-ink"
          >
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-tarto-ink/55">
            At least 8 characters.
          </p>
        </div>
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
