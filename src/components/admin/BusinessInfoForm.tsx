"use client";

import { startTransition, useActionState } from "react";
import {
  updateBusinessInfo,
  type ContentFormState,
} from "@/app/admin/(dashboard)/settings/content-actions";
import { BUSINESS_FIELDS, type BusinessInfo } from "@/lib/business-fields";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm text-tarto-ink outline-none focus:border-tarto-red/40 focus:bg-white";

const GROUPS = [
  { id: "ordering", title: "Ordering", hint: "Shown on the delivery page, FAQ and after a quote request." },
  { id: "delivery", title: "Delivery & pickup", hint: "Shown on the delivery page." },
  { id: "business", title: "Business", hint: "Shown on the contact and delivery pages." },
] as const;

type Props = {
  info: BusinessInfo;
};

export default function BusinessInfoForm({ info }: Props) {
  const [state, formAction, pending] = useActionState<ContentFormState, FormData>(
    updateBusinessInfo,
    {}
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // Avoid React's automatic form reset so saved text stays on screen.
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="space-y-6"
    >
      {GROUPS.map((group) => (
        <fieldset
          key={group.id}
          className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <legend className="sr-only">{group.title}</legend>
          <h2 className="text-base font-bold text-tarto-ink">{group.title}</h2>
          <p className="mt-1 text-xs text-[#777]">{group.hint}</p>
          <div className="mt-4 space-y-5">
            {BUSINESS_FIELDS.filter((field) => field.group === group.id).map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="text-sm font-bold text-tarto-ink">
                  {field.label}
                </label>
                <textarea
                  id={field.key}
                  name={field.key}
                  rows={3}
                  maxLength={1000}
                  defaultValue={info[field.key]}
                  placeholder={field.placeholder}
                  aria-describedby={`${field.key}-help`}
                  className={fieldClass}
                />
                <p id={`${field.key}-help`} className="mt-1 text-xs text-tarto-ink/60">
                  {field.help} Leave empty to hide it on the website.
                </p>
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      {state.error ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md bg-[#E8F5EC] px-3 py-2 text-sm text-[#2F6B45]" role="status">
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
