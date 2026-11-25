"use client";

import { startTransition, useActionState, useState } from "react";
import { contactInfo } from "@/data/contact";
import { loginAdmin, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

const fieldClass =
  "mt-1.5 w-full rounded-full border border-[#EFEFEF] bg-[#F7F7F7] px-4 py-3 text-base text-tarto-ink outline-none transition placeholder:text-tarto-ink/35 focus:border-tarto-red/40 focus:bg-white sm:text-sm";

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(() => formAction(data));
    }} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-tarto-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          maxLength={254}
          required
          autoComplete="email"
          placeholder="Enter your Email"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-tarto-ink">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            maxLength={256}
            required
            autoComplete="current-password"
            placeholder="Enter Password"
            className={`${fieldClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-full text-tarto-ink/60 transition hover:text-tarto-red"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]" aria-hidden>
                <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                <path d="m4 4 16 16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]" aria-hidden>
                <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-tarto-ink/70">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-tarto-ink/25 accent-tarto-red"
          />
          Remember me
        </label>
        <a href={`mailto:${contactInfo.email}?subject=Admin%20access%20assistance`} className="font-medium text-tarto-red hover:underline">Need help signing in?</a>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-xl bg-tarto-red/10 px-3 py-2 text-center text-sm text-tarto-red">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-tarto-red py-3 text-sm font-semibold text-white transition hover:bg-tarto-red/90 disabled:opacity-70"
      >
        {pending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-tarto-ink/45">Admin access only</p>
    </form>
  );
}
