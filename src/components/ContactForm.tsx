"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  submitQuoteRequest,
  type QuoteFormState,
} from "@/app/(site)/contact/actions";
import { Button } from "@/components/ui/Button";
import { FieldError, errorProps, focusFirstError } from "@/components/ui/FieldError";
import { CUSTOM_CAKE, HONEYPOT_FIELD, OTHER_OCCASION } from "@/lib/quote-form";

const initialState: QuoteFormState = {};
const MAX_REFERENCE_IMAGES = 3;
const MAX_REFERENCE_BYTES = 5 * 1024 * 1024;
const ALLOWED_REFERENCE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Visual order of fields, used to focus the first error after a failed submit.
const FIELD_ORDER = [
  "name",
  "email",
  "phone",
  "occasionId",
  "eventDate",
  "occasionOther",
  "size",
  "flavor",
  "message",
  "referenceImages",
  "notes",
] as const;

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-md border border-tarto-ink/15 bg-tarto-cream px-3 py-2.5 text-base outline-none focus:border-tarto-red focus:ring-2 focus:ring-tarto-red/25 sm:text-sm";

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
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    focusFirstError(FIELD_ORDER, state.fieldErrors);
  }, [state.fieldErrors]);

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
    // "Custom Cake" always has its own <option> below; don't add it twice.
    if (presetCake && presetCake !== CUSTOM_CAKE && !names.includes(presetCake)) {
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

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        // Submitting manually (instead of letting <form action> do it) stops
        // React 19 from resetting the form, so a validation error doesn't
        // wipe what the customer typed or the photos they attached.
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="mt-6 space-y-4"
    >
      {/* Honeypot: hidden from people and screen readers, filled by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this empty</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-tarto-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          className={fieldClass}
          {...errorProps("name", errors.name)}
        />
        <FieldError id="name" message={errors.name} />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-tarto-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
          {...errorProps("email", errors.email)}
        />
        <FieldError id="email" message={errors.email} />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-semibold text-tarto-ink">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          className={fieldClass}
          {...errorProps("phone", errors.phone)}
        />
        <FieldError id="phone" message={errors.phone} />
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
            {...errorProps("occasionId", errors.occasionId)}
          >
            <option value="">Select occasion...</option>
            {occasions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
            <option value={OTHER_OCCASION}>Other (please specify)</option>
          </select>
          <FieldError id="occasionId" message={errors.occasionId} />
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
            {...errorProps("eventDate", errors.eventDate, "eventDate-help")}
          />
          <p id="eventDate-help" className="mt-1 text-xs text-tarto-ink/70">
            Event date, or the day you want the cake ready.
          </p>
          <FieldError id="eventDate" message={errors.eventDate} />
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
            {...errorProps("occasionOther", errors.occasionOther)}
          />
          <FieldError id="occasionOther" message={errors.occasionOther} />
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
          <option value={CUSTOM_CAKE}>{CUSTOM_CAKE}</option>
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
            {...errorProps("size", errors.size)}
          >
            <option value="">Select size...</option>
            {sizeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <FieldError id="size" message={errors.size} />
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
            {...errorProps("flavor", errors.flavor)}
          >
            <option value="">Select flavour...</option>
            {flavorOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <FieldError id="flavor" message={errors.flavor} />
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
          {...errorProps("message", errors.message, "message-help")}
        />
        <p id="message-help" className="mt-1 text-xs text-tarto-ink/70">
          The inscription you want written on the cake. Leave blank if none.
        </p>
        <FieldError id="message" message={errors.message} />
      </div>

      <div>
        <p className="text-sm font-semibold text-tarto-ink">
          Cake photo{" "}
          <span className="font-normal text-tarto-ink/60">(optional)</span>
        </p>
        <p id="referenceImages-help" className="mt-1 text-xs text-tarto-ink/70">
          Have a picture of the cake you want? Attach it so we can match the
          design. Up to {MAX_REFERENCE_IMAGES} photos, 5MB each.
        </p>
        <input
          ref={referenceInputRef}
          id="referenceImages-input"
          name="referenceImages"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            addReferenceFiles(event.target.files ?? []);
            event.target.value = "";
          }}
        />
        <button
          id="referenceImages"
          type="button"
          onClick={() => referenceInputRef.current?.click()}
          className="mt-2.5 inline-flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-tarto-ink/20 bg-tarto-cream px-3 py-8 text-sm font-semibold text-tarto-ink transition hover:border-tarto-red/40 hover:bg-white"
          {...errorProps(
            "referenceImages",
            errors.referenceImages,
            "referenceImages-help"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 fill-none stroke-current stroke-2"
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
                  aria-label={`Remove photo ${index + 1}`}
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
          <p className="mt-1.5 text-sm font-medium text-tarto-red" role="alert">
            {referenceError}
          </p>
        ) : null}
        <FieldError id="referenceImages" message={errors.referenceImages} />
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-semibold text-tarto-ink">
          Comments for the team{" "}
          <span className="font-normal text-tarto-ink/60">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={1000}
          placeholder="Allergies, delivery notes, colour preferences, or anything else we should know..."
          className={fieldClass}
          {...errorProps("notes", errors.notes, "notes-help")}
        />
        <p id="notes-help" className="mt-1 text-xs text-tarto-ink/70">
          Share extra details, questions, or special requests. Leave blank if none.
        </p>
        <FieldError id="notes" message={errors.notes} />
      </div>

      {state.error ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} fullWidth size="lg">
        {pending ? "Sending..." : "Send Request"}
      </Button>
    </form>
  );
}
