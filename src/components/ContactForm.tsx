"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  submitQuoteRequest,
  type QuoteFormState,
} from "@/app/(site)/contact/actions";

const initialState: QuoteFormState = {};
const OTHER_OCCASION = "__other__";
const MAX_REFERENCE_IMAGES = 3;
const MAX_REFERENCE_BYTES = 5 * 1024 * 1024;
const ALLOWED_REFERENCE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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
  sizes?: string[];
  flavors?: string[];
};

export default function ContactForm({
  cakes = [],
  occasions = [],
  sizes = [],
  flavors = [],
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
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const [referenceError, setReferenceError] = useState<string | undefined>();
  const referenceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = referenceFiles.map((file) => URL.createObjectURL(file));
    setReferencePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [referenceFiles]);

  useEffect(() => {
    if (!referenceInputRef.current) return;
    const dataTransfer = new DataTransfer();
    referenceFiles.forEach((file) => dataTransfer.items.add(file));
    referenceInputRef.current.files = dataTransfer.files;
  }, [referenceFiles]);

  const cakeOptions = useMemo(() => {
    const names = cakes.map((cake) => cake.name);
    if (presetCake && !names.includes(presetCake)) {
      return [presetCake, ...names];
    }
    return names;
  }, [cakes, presetCake]);

  const sizeOptions = useMemo(() => {
    if (presetSize && !sizes.includes(presetSize)) {
      return [presetSize, ...sizes];
    }
    return sizes;
  }, [sizes, presetSize]);

  const flavorOptions = useMemo(() => {
    if (presetFlavor && !flavors.includes(presetFlavor)) {
      return [presetFlavor, ...flavors];
    }
    return flavors;
  }, [flavors, presetFlavor]);

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

  function addReferenceFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming).filter((file) => file.size > 0);
    if (list.length === 0) return;

    const invalid = list.find(
      (file) =>
        !ALLOWED_REFERENCE_TYPES.has(file.type) || file.size > MAX_REFERENCE_BYTES
    );
    if (invalid) {
      setReferenceError(
        !ALLOWED_REFERENCE_TYPES.has(invalid.type)
          ? "Only JPG, PNG, WEBP, or GIF photos are allowed."
          : "Each photo must be under 5MB."
      );
      return;
    }

    const remaining = MAX_REFERENCE_IMAGES - referenceFiles.length;
    if (remaining <= 0) {
      setReferenceError(`You can attach up to ${MAX_REFERENCE_IMAGES} photos.`);
      return;
    }

    const accepted = list.slice(0, remaining);
    setReferenceError(
      list.length > remaining
        ? `You can attach up to ${MAX_REFERENCE_IMAGES} photos.`
        : undefined
    );
    setReferenceFiles((current) => [...current, ...accepted]);
  }

  function removeReferenceFile(index: number) {
    setReferenceFiles((current) => current.filter((_, i) => i !== index));
    setReferenceError(undefined);
  }

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
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div>
          <label htmlFor="eventDate" className="text-sm font-semibold text-tarto-ink">
            When do you need the cake?
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-tarto-ink/55">
            Event date, or the day you want the cake ready.
          </p>
        </div>
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
          Cake type
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="size" className="text-sm font-semibold text-tarto-ink">
            Size
          </label>
          <select
            id="size"
            name="size"
            required
            defaultValue={presetSize}
            className={fieldClass}
          >
            <option value="">Select size...</option>
            {sizeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="flavor" className="text-sm font-semibold text-tarto-ink">
            Flavour
          </label>
          <select
            id="flavor"
            name="flavor"
            required
            defaultValue={presetFlavor}
            className={fieldClass}
          >
            <option value="">Select flavour...</option>
            {flavorOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-semibold text-tarto-ink">
          Words on the cake
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={120}
          placeholder="e.g. Happy Birthday Sarah"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-tarto-ink/55">
          The inscription you want written on the cake. Leave blank if none.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-tarto-ink">
          Cake photo{" "}
          <span className="font-normal text-tarto-ink/50">(optional)</span>
        </p>
        <p className="mt-1 text-xs text-tarto-ink/55">
          Have a picture of the cake you want? Attach it so we can match the
          design. Up to {MAX_REFERENCE_IMAGES} photos, 5MB each.
        </p>
        <input
          ref={referenceInputRef}
          id="referenceImages"
          name="referenceImages"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(event) => {
            addReferenceFiles(event.target.files ?? []);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => referenceInputRef.current?.click()}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-tarto-ink/20 bg-tarto-cream px-3 py-3 text-sm font-semibold text-tarto-ink transition hover:border-tarto-red/40 hover:bg-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-none stroke-current stroke-2"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="11" r="2" />
            <path d="m21 16-5-5-7 7" />
          </svg>
          {referenceFiles.length > 0
            ? "Add another photo"
            : "Attach cake photos"}
        </button>
        {referencePreviews.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {referencePreviews.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative overflow-hidden rounded-lg bg-tarto-cream"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-24 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeReferenceFile(index)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-tarto-red shadow-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {referenceError ? (
          <p className="mt-1.5 text-xs font-medium text-tarto-red" role="alert">
            {referenceError}
          </p>
        ) : null}
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
        {pending ? "Sending..." : "Send Request"}
      </button>
    </form>
  );
}
