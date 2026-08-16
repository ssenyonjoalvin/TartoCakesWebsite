"use client";

import { useActionState, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  submitQuoteRequest,
  type QuoteFormState,
} from "@/app/(site)/contact/actions";

const initialState: QuoteFormState = {};
const OTHER_OCCASION = "__other__";

const fieldClass =
  "mt-1.5 w-full rounded-md border border-tarto-ink/10 bg-tarto-cream px-3 py-2.5 text-sm outline-none focus:border-tarto-red";

type CakeOption = {
  name: string;
  slug?: string;
};

type OccasionOption = {
  id: string;
  name: string;
};

type Props = {
  cakes?: CakeOption[];
  occasions?: OccasionOption[];
};

export default function ContactForm({
  cakes = [],
  occasions = [],
}: Props) {
  const searchParams = useSearchParams();
  const presetCake = searchParams.get("cake") ?? "";
  const presetSize = searchParams.get("size") ?? "";
  const presetFlavor = searchParams.get("flavor") ?? "";
  const presetOccasion = searchParams.get("occasion") ?? "";

  const [state, formAction, pending] = useActionState(
    submitQuoteRequest,
    initialState
  );
  const [occasionChoice, setOccasionChoice] = useState("");

  const cakeOptions = useMemo(() => {
    const names = cakes.map((cake) => cake.name);
    if (presetCake && !names.includes(presetCake)) {
      return [presetCake, ...names];
    }
    return names;
  }, [cakes, presetCake]);

  const defaultOccasionId = useMemo(() => {
    if (!presetOccasion) return "";
    const match = occasions.find(
      (item) =>
        item.id === presetOccasion ||
        item.name.toLowerCase() === presetOccasion.toLowerCase()
    );
    return match?.id ?? "";
  }, [occasions, presetOccasion]);

  const selectedOccasion = occasionChoice || defaultOccasionId;
  const showOther = selectedOccasion === OTHER_OCCASION;

  const defaultMessage = [
    presetSize && `Size: ${presetSize}`,
    presetFlavor && `Flavour: ${presetFlavor}`,
  ]
    .filter(Boolean)
    .join(" · ");

  if (state.success) {
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

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {presetSize ? <input type="hidden" name="size" value={presetSize} /> : null}
      {presetFlavor ? (
        <input type="hidden" name="flavor" value={presetFlavor} />
      ) : null}

      <div>
        <label htmlFor="name" className="text-sm font-semibold text-tarto-ink">
          Name
        </label>
        <input id="name" name="name" required className={fieldClass} />
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
          className={fieldClass}
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
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="occasionId" className="text-sm font-semibold text-tarto-ink">
          Occasion
        </label>
        <select
          id="occasionId"
          name="occasionId"
          required
          value={selectedOccasion}
          onChange={(event) => setOccasionChoice(event.target.value)}
          className={fieldClass}
        >
          <option value="">Select occasion...</option>
          {occasions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
          <option value={OTHER_OCCASION}>Other (please specify)</option>
        </select>
      </div>
      {showOther ? (
        <div>
          <label
            htmlFor="occasionOther"
            className="text-sm font-semibold text-tarto-ink"
          >
            Tell us the occasion
          </label>
          <input
            id="occasionOther"
            name="occasionOther"
            required
            maxLength={120}
            placeholder="e.g. Graduation, Baby shower, Corporate launch..."
            className={fieldClass}
          />
        </div>
      ) : null}
      <div>
        <label htmlFor="cakeType" className="text-sm font-semibold text-tarto-ink">
          Select Cake Type
        </label>
        <select
          id="cakeType"
          name="cakeType"
          defaultValue={presetCake}
          className={fieldClass}
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
          required
          minLength={5}
          defaultValue={defaultMessage}
          placeholder="Tell us the date, servings, theme, and any special requests..."
          className={fieldClass}
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-tarto-red px-6 py-3 text-sm font-bold text-white transition hover:bg-tarto-red/90 disabled:opacity-70"
      >
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
