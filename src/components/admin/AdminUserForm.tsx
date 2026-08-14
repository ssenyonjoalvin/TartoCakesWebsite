"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createAdminUser,
  updateAdminUser,
  type UserFormState,
} from "@/app/admin/(dashboard)/users/actions";
import type { AdminRole } from "@/generated/prisma/client";

type Props = {
  user?: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    active: boolean;
  };
};

const initialState: UserFormState = {};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-tarto-ink/15 bg-[#FFF4E5] px-3 py-2.5 text-sm text-tarto-ink outline-none focus:border-tarto-red";

export default function AdminUserForm({ user }: Props) {
  const action = user ? updateAdminUser : createAdminUser;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}

      <div>
        <label htmlFor="name" className="text-sm font-bold text-tarto-ink">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={user?.name}
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
          defaultValue={user?.email}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-bold text-tarto-ink">
          {user ? "New password" : "Password"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required={!user}
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-tarto-ink/55">
          {user
            ? "Leave blank to keep the current password."
            : "At least 8 characters."}
        </p>
      </div>

      <div>
        <label htmlFor="role" className="text-sm font-bold text-tarto-ink">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue={user?.role ?? "EDITOR"}
          className={inputClass}
        >
          <option value="EDITOR">Editor — can post blogs</option>
          <option value="ADMIN">Admin — full access, including users</option>
        </select>
      </div>

      {user ? (
        <label className="flex items-center gap-2 text-sm text-tarto-ink/80">
          <input
            type="checkbox"
            name="active"
            defaultChecked={user.active}
            className="h-4 w-4 rounded border-tarto-ink/30 accent-tarto-red"
          />
          Active — can sign in
        </label>
      ) : null}

      {state.error ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-tarto-red px-5 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90 disabled:opacity-70"
        >
          {pending ? "Saving..." : user ? "Save changes" : "Add user"}
        </button>
        <Link
          href="/admin/users"
          className="text-sm font-semibold text-tarto-ink/60 hover:text-tarto-red"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
