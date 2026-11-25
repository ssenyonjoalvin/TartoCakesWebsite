"use client";

import { useActionState, useState } from "react";
import {
  updateWhatsAppSettings,
  type WhatsAppSettingsState,
} from "@/app/admin/(dashboard)/settings/whatsapp/actions";
import {
  buildWhatsAppOrderMessage,
  formatWhatsAppNumber,
  normalizeWhatsAppNumber,
  whatsAppLink,
} from "@/lib/whatsapp";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm text-tarto-ink outline-none focus:border-tarto-red/40 focus:bg-white";

type Props = {
  currentNumber: string;
};

const sampleMessage = buildWhatsAppOrderMessage({
  customerName: "Sample Customer",
  cake: "Red Velvet Cake",
  size: '8"',
  flavor: "Red Velvet",
  date: "Saturday",
});

export default function WhatsAppSettingsForm({ currentNumber }: Props) {
  const [state, formAction, pending] = useActionState<
    WhatsAppSettingsState,
    FormData
  >(updateWhatsAppSettings, {});
  const [value, setValue] = useState(
    currentNumber ? formatWhatsAppNumber(currentNumber) : ""
  );

  const preview = value.trim() ? normalizeWhatsAppNumber(value) : null;
  const saved = state.number !== undefined ? state.number : currentNumber;

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="whatsappNumber" className="text-sm font-bold text-tarto-ink">
          WhatsApp number for orders
        </label>
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. 0700 796 794"
          aria-describedby="whatsapp-help"
          className={fieldClass}
        />
        <p id="whatsapp-help" className="mt-1.5 text-xs text-tarto-ink/60">
          Local numbers starting with 0 are treated as Ugandan (+256). Leave
          empty to hide all WhatsApp buttons on the website.
        </p>
        {value.trim() ? (
          <p
            className={`mt-1.5 text-xs font-semibold ${
              preview ? "text-[#2F6B45]" : "text-tarto-red"
            }`}
          >
            {preview
              ? `Will be saved as ${formatWhatsAppNumber(preview)}`
              : "Not a valid number yet"}
          </p>
        ) : null}
      </div>

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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-tarto-red px-5 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90 disabled:opacity-70"
        >
          {pending ? "Saving..." : "Save number"}
        </button>
        {saved ? (
          <a
            href={whatsAppLink(saved, sampleMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[#E0E0E0] px-5 py-2.5 text-sm font-bold text-tarto-ink hover:border-tarto-red/40"
          >
            Test saved number in WhatsApp
          </a>
        ) : null}
      </div>
    </form>
  );
}
