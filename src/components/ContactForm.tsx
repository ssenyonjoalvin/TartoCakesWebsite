"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cakes } from "@/data/cakes";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const presetCake = searchParams.get("cake") ?? "";
  const presetSize = searchParams.get("size") ?? "";
  const presetFlavor = searchParams.get("flavor") ?? "";

  const cakeOptions = useMemo(() => cakes.map((cake) => cake.name), []);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-8 rounded-xl bg-tarto-cream p-6 text-center">
        <p className="text-lg font-bold text-tarto-red">Thank you!</p>
        <p className="mt-2 text-sm text-tarto-ink/75">
          Your inquiry has been received. We will contact you soon to confirm
          details and pricing.
        </p>
      </div>
    );
  }

  const defaultMessage = [presetSize && `Size: ${presetSize}`, presetFlavor && `Flavour: ${presetFlavor}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-tarto-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1.5 w-full rounded-md border border-tarto-ink/10 bg-tarto-cream px-3 py-2.5 text-sm outline-none focus:border-tarto-red"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-tarto-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-md border border-tarto-ink/10 bg-tarto-cream px-3 py-2.5 text-sm outline-none focus:border-tarto-red"
        />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-semibold text-tarto-ink">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="mt-1.5 w-full rounded-md border border-tarto-ink/10 bg-tarto-cream px-3 py-2.5 text-sm outline-none focus:border-tarto-red"
        />
      </div>
      <div>
        <label htmlFor="cakeType" className="text-sm font-semibold text-tarto-ink">
          Select Cake Type
        </label>
        <select
          id="cakeType"
          name="cakeType"
          defaultValue={presetCake}
          className="mt-1.5 w-full rounded-md border border-tarto-ink/10 bg-tarto-cream px-3 py-2.5 text-sm outline-none focus:border-tarto-red"
        >
          <option value="">Choose a cake...</option>
          {cakeOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="Custom Cake">Custom Cake</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-semibold text-tarto-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={defaultMessage}
          placeholder="Tell us the date, servings, theme, and any special requests..."
          className="mt-1.5 w-full rounded-md border border-tarto-ink/10 bg-tarto-cream px-3 py-2.5 text-sm outline-none focus:border-tarto-red"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-tarto-red px-6 py-3 text-sm font-bold text-white transition hover:bg-tarto-red/90"
      >
        Send Message
      </button>
    </form>
  );
}
