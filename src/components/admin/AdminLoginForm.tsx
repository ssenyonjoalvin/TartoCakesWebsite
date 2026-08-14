"use client";

import { useActionState, useState } from "react";
import { loginAdmin, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="text-sm font-bold text-tarto-ink">
          Email Address
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-tarto-ink/40">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 7 9-7" />
            </svg>
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue="admin@tartocakes.com"
            className="w-full rounded-lg border border-tarto-ink/15 bg-[#FFF4E5] py-2.5 pl-10 pr-3 text-sm text-tarto-ink outline-none focus:border-tarto-red"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-bold text-tarto-ink">
          Password
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-tarto-ink/40">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-tarto-ink/15 bg-[#FFF4E5] py-2.5 pl-10 pr-12 text-sm text-tarto-ink outline-none focus:border-tarto-red"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 text-xs font-semibold text-tarto-ink/50 hover:text-tarto-red"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-tarto-ink/80">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-tarto-ink/30 accent-tarto-red"
          />
          Remember me
        </label>
        <span className="font-medium text-tarto-red">Forgot password?</span>
      </div>

      {state.error && (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-tarto-red py-3 text-sm font-bold text-white transition hover:bg-tarto-red/90 disabled:opacity-70"
      >
        {pending ? "Signing in..." : "Sign In"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
