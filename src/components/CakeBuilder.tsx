"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  submitQuoteRequest,
  type QuoteField,
  type QuoteFormState,
} from "@/app/(site)/contact/actions";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Button, buttonClasses } from "@/components/ui/Button";
import { FieldError, errorProps } from "@/components/ui/FieldError";
import { CUSTOM_CAKE, HONEYPOT_FIELD, OTHER_OCCASION } from "@/lib/quote-form";
import { buildWhatsAppOrderMessage, whatsAppLink } from "@/lib/whatsapp";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type Props = {
  occasions: { id: string; name: string }[];
  sizes: { name: string; servings: number | null; description: string | null }[];
  flavors: { name: string; description: string | null }[];
  whatsappNumber: string;
};

const NOT_SURE = "Not sure yet – please advise";
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const STEPS = [
  "Occasion",
  "Size",
  "Flavour",
  "Design",
  "Message",
  "Photos",
  "Delivery",
  "Review",
] as const;
const REVIEW_STEP = STEPS.length - 1;

/** Which step owns each server-side field, so we can jump back to fix it. */
const FIELD_STEP: Partial<Record<QuoteField, number>> = {
  occasionId: 0,
  occasionOther: 0,
  size: 1,
  flavor: 2,
  design: 3,
  message: 4,
  referenceImages: 5,
  eventDate: 6,
  deliveryMethod: 6,
  deliveryLocation: 6,
  name: 6,
  phone: 6,
  email: 6,
};

type BuilderState = {
  step: number;
  occasionId: string;
  occasionOther: string;
  size: string;
  flavor: string;
  design: string;
  message: string;
  photos: File[];
  eventDate: string;
  deliveryMethod: "" | "pickup" | "delivery";
  deliveryLocation: string;
  name: string;
  phone: string;
  email: string;
  /** Client-side validation messages for the current step. */
  errors: Partial<Record<QuoteField, string>>;
};

type Action =
  | { type: "set"; field: keyof BuilderState; value: string }
  | { type: "addPhotos"; files: File[] }
  | { type: "removePhoto"; index: number }
  | { type: "goTo"; step: number }
  | { type: "errors"; errors: BuilderState["errors"] };

const initialState: BuilderState = {
  step: 0,
  occasionId: "",
  occasionOther: "",
  size: "",
  flavor: "",
  design: "",
  message: "",
  photos: [],
  eventDate: "",
  deliveryMethod: "",
  deliveryLocation: "",
  name: "",
  phone: "",
  email: "",
  errors: {},
};

// useReducer keeps every state transition in one pure function: easy to
// follow, and impossible for two setState calls to get out of sync.
function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "set": {
      const errors = { ...state.errors };
      delete errors[action.field as QuoteField];
      return { ...state, [action.field]: action.value, errors };
    }
    case "addPhotos":
      return {
        ...state,
        photos: [...state.photos, ...action.files].slice(0, MAX_PHOTOS),
        errors: { ...state.errors, referenceImages: undefined },
      };
    case "removePhoto":
      return {
        ...state,
        photos: state.photos.filter((_, index) => index !== action.index),
      };
    case "goTo":
      return { ...state, step: action.step, errors: {} };
    case "errors":
      return { ...state, errors: action.errors };
  }
}

/** Per-step checks. Empty object = OK to continue. */
function validateStep(step: number, state: BuilderState): BuilderState["errors"] {
  const errors: BuilderState["errors"] = {};
  if (step === 0) {
    if (!state.occasionId) errors.occasionId = "Please choose an occasion.";
    if (state.occasionId === OTHER_OCCASION && state.occasionOther.trim().length < 2) {
      errors.occasionOther = "Please tell us what you're celebrating.";
    }
  }
  if (step === 1 && !state.size) errors.size = "Please choose a size.";
  if (step === 2 && !state.flavor) errors.flavor = "Please choose a flavour.";
  if (step === 6) {
    if (!state.eventDate) errors.eventDate = "Please choose the date you need the cake.";
    if (!state.deliveryMethod) errors.deliveryMethod = "Please choose pickup or delivery.";
    if (state.deliveryMethod === "delivery" && state.deliveryLocation.trim().length < 3) {
      errors.deliveryLocation = "Please tell us where to deliver.";
    }
    if (state.name.trim().length < 2) errors.name = "Please enter your name.";
    if (state.phone.replace(/\D/g, "").length < 9) errors.phone = "Please enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
  }
  return errors;
}

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const inputClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-tarto-ink/15 bg-white px-3.5 py-2.5 text-base text-tarto-ink outline-none focus:border-tarto-red focus:ring-2 focus:ring-tarto-red/25 sm:text-sm";

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

type ChoiceProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  detail?: string | null;
};

/**
 * A native radio input styled as a card. Native radios give keyboard
 * support (arrow keys move between options) and screen-reader semantics
 * for free, which a <div onClick> card would not.
 */
function ChoiceCard({ name, value, checked, onChange, title, detail }: ChoiceProps) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tarto-ink ${
        checked ? "border-tarto-red bg-tarto-red/5" : "border-transparent hover:border-tarto-red/30"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-tarto-red" : "border-tarto-ink/30"
        }`}
      >
        {checked ? <span className="h-2.5 w-2.5 rounded-full bg-tarto-red" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-tarto-ink">{title}</span>
        {detail ? <span className="block text-sm text-tarto-ink/70">{detail}</span> : null}
      </span>
    </label>
  );
}

function ChoiceGroup({
  legend,
  id,
  error,
  children,
}: {
  legend: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      className="outline-none"
      {...errorProps(id, error)}
    >
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">{children}</div>
      <FieldError id={id} message={error} />
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export default function CakeBuilder({ occasions, sizes, flavors, whatsappNumber }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [serverState, formAction, pending] = useActionState<QuoteFormState, FormData>(
    submitQuoteRequest,
    {}
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  const set = (field: keyof BuilderState) => (value: string) =>
    dispatch({ type: "set", field, value });

  // Move focus to the step title whenever the step changes, so keyboard and
  // screen-reader users start at the top of the new step (not on a button
  // that no longer exists).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [state.step]);

  // Server rejected something: jump to the earliest step with a problem.
  useEffect(() => {
    const fieldErrors = serverState.fieldErrors;
    if (!fieldErrors) return;
    const steps = Object.keys(fieldErrors)
      .map((field) => FIELD_STEP[field as QuoteField])
      .filter((step): step is number => step !== undefined);
    if (steps.length === 0) return;
    dispatch({ type: "goTo", step: Math.min(...steps) });
    dispatch({ type: "errors", errors: fieldErrors });
  }, [serverState.fieldErrors]);

  const previews = useMemo(
    () => state.photos.map((file) => URL.createObjectURL(file)),
    [state.photos]
  );
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const occasionName =
    state.occasionId === OTHER_OCCASION
      ? state.occasionOther.trim()
      : occasions.find((item) => item.id === state.occasionId)?.name ?? "";

  function next() {
    const errors = validateStep(state.step, state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "errors", errors });
      const first = Object.keys(errors)[0];
      document.getElementById(first)?.focus();
      return;
    }
    dispatch({ type: "goTo", step: Math.min(state.step + 1, REVIEW_STEP) });
  }

  function back() {
    dispatch({ type: "goTo", step: Math.max(state.step - 1, 0) });
  }

  function addPhotos(list: FileList | null) {
    const files = Array.from(list ?? []).filter((file) => file.size > 0);
    const bad = files.find(
      (file) => !PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES
    );
    if (bad) {
      dispatch({
        type: "errors",
        errors: {
          referenceImages: !PHOTO_TYPES.includes(bad.type)
            ? "Only JPG, PNG, WEBP or GIF photos are allowed."
            : "Each photo must be under 5MB.",
        },
      });
      return;
    }
    if (state.photos.length + files.length > MAX_PHOTOS) {
      dispatch({
        type: "errors",
        errors: { referenceImages: `You can add up to ${MAX_PHOTOS} photos.` },
      });
    }
    dispatch({ type: "addPhotos", files });
  }

  function submit() {
    // Re-check every step: the customer may have jumped around.
    for (let step = 0; step < REVIEW_STEP; step += 1) {
      const errors = validateStep(step, state);
      if (Object.keys(errors).length > 0) {
        dispatch({ type: "goTo", step });
        dispatch({ type: "errors", errors });
        return;
      }
    }

    const formData = new FormData();
    formData.set("occasionId", state.occasionId);
    formData.set("occasionOther", state.occasionOther);
    formData.set("cakeType", CUSTOM_CAKE);
    formData.set("size", state.size);
    formData.set("flavor", state.flavor);
    formData.set("design", state.design);
    formData.set("message", state.message);
    formData.set("eventDate", state.eventDate);
    formData.set("deliveryMethod", state.deliveryMethod);
    formData.set("deliveryLocation", state.deliveryLocation);
    formData.set("name", state.name);
    formData.set("phone", state.phone);
    formData.set("email", state.email);
    const honeypot = document.getElementById(HONEYPOT_FIELD) as HTMLInputElement | null;
    formData.set(HONEYPOT_FIELD, honeypot?.value ?? "");
    state.photos.forEach((file) => formData.append("referenceImages", file));

    startTransition(() => formAction(formData));
  }

  const whatsappHref = whatsappNumber
    ? whatsAppLink(
        whatsappNumber,
        buildWhatsAppOrderMessage({
          customerName: state.name,
          cake: CUSTOM_CAKE,
          occasion: occasionName,
          size: state.size,
          flavor: state.flavor,
          design: state.design,
          inscription: state.message,
          date: formatDate(state.eventDate),
          deliveryMethod: state.deliveryMethod,
          deliveryLocation: state.deliveryLocation,
          hasPhotos: state.photos.length > 0,
        })
      )
    : null;

  const summary: [string, string, number][] = [
    ["Occasion", occasionName, 0],
    ["Size", state.size, 1],
    ["Flavour", state.flavor, 2],
    ["Design", state.design || "No specific design – surprise me", 3],
    ["Words on cake", state.message ? `“${state.message}”` : "None", 4],
    [
      "Inspiration photos",
      state.photos.length > 0 ? `${state.photos.length} attached` : "None",
      5,
    ],
    ["Date needed", formatDate(state.eventDate), 6],
    [
      "Delivery",
      state.deliveryMethod === "pickup"
        ? "Pickup"
        : `Delivery to ${state.deliveryLocation}`,
      6,
    ],
    ["Contact", `${state.name} · ${state.phone} · ${state.email}`, 6],
  ];

  // Design, message and photos are optional: label the button "Skip" while empty.
  const canSkip =
    (state.step === 3 && !state.design.trim()) ||
    (state.step === 4 && !state.message.trim()) ||
    (state.step === 5 && state.photos.length === 0);

  const progress = Math.round(((state.step + 1) / STEPS.length) * 100);
  const { errors } = state;

  return (
    <div>
      {/* Progress */}
      <div>
        <div className="flex items-baseline justify-between text-sm">
          <p className="font-semibold text-tarto-ink">
            Step {state.step + 1} of {STEPS.length}
          </p>
          <p className="text-tarto-ink/70">{STEPS[state.step]}</p>
        </div>
        <div
          role="progressbar"
          aria-label="Cake design progress"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={state.step + 1}
          className="mt-2 h-2 overflow-hidden rounded-full bg-tarto-ink/10"
        >
          <div
            className="h-full rounded-full bg-tarto-red transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Honeypot (see contact form) */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this empty</label>
        <input id={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 rounded-2xl bg-white/60 p-5 shadow-sm sm:p-7">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-tarto-ink outline-none"
        >
          {
            [
              "What are you celebrating?",
              "How big should it be?",
              "Choose a flavour",
              "Describe your design",
              "Words on the cake",
              "Inspiration photos",
              "When and where?",
              "Review your cake",
            ][state.step]
          }
        </h2>

        <div className="mt-5">
          {state.step === 0 ? (
            <>
              <ChoiceGroup legend="Occasion" id="occasionId" error={errors.occasionId}>
                {occasions.map((occasion) => (
                  <ChoiceCard
                    key={occasion.id}
                    name="occasion"
                    value={occasion.id}
                    checked={state.occasionId === occasion.id}
                    onChange={set("occasionId")}
                    title={occasion.name}
                  />
                ))}
                <ChoiceCard
                  name="occasion"
                  value={OTHER_OCCASION}
                  checked={state.occasionId === OTHER_OCCASION}
                  onChange={set("occasionId")}
                  title="Something else"
                />
              </ChoiceGroup>
              {state.occasionId === OTHER_OCCASION ? (
                <div className="mt-4">
                  <label htmlFor="occasionOther" className="text-sm font-semibold text-tarto-ink">
                    What are you celebrating?
                  </label>
                  <input
                    id="occasionOther"
                    value={state.occasionOther}
                    onChange={(event) => set("occasionOther")(event.target.value)}
                    maxLength={120}
                    placeholder="e.g. Introduction, Graduation, Baby shower"
                    className={inputClass}
                    {...errorProps("occasionOther", errors.occasionOther)}
                  />
                  <FieldError id="occasionOther" message={errors.occasionOther} />
                </div>
              ) : null}
            </>
          ) : null}

          {state.step === 1 ? (
            <ChoiceGroup legend="Size" id="size" error={errors.size}>
              {sizes.map((size) => (
                <ChoiceCard
                  key={size.name}
                  name="size"
                  value={size.name}
                  checked={state.size === size.name}
                  onChange={set("size")}
                  title={size.name}
                  detail={
                    size.servings
                      ? `Serves about ${size.servings}`
                      : size.description
                  }
                />
              ))}
              <ChoiceCard
                name="size"
                value={NOT_SURE}
                checked={state.size === NOT_SURE}
                onChange={set("size")}
                title="Not sure yet"
                detail="We'll recommend a size for your guest count"
              />
            </ChoiceGroup>
          ) : null}

          {state.step === 2 ? (
            <ChoiceGroup legend="Flavour" id="flavor" error={errors.flavor}>
              {flavors.map((flavor) => (
                <ChoiceCard
                  key={flavor.name}
                  name="flavor"
                  value={flavor.name}
                  checked={state.flavor === flavor.name}
                  onChange={set("flavor")}
                  title={flavor.name}
                  detail={flavor.description}
                />
              ))}
              <ChoiceCard
                name="flavor"
                value={NOT_SURE}
                checked={state.flavor === NOT_SURE}
                onChange={set("flavor")}
                title="Not sure yet"
                detail="We'll help you choose"
              />
            </ChoiceGroup>
          ) : null}

          {state.step === 3 ? (
            <div>
              <label htmlFor="design" className="text-sm font-semibold text-tarto-ink">
                Colours, theme and decorations{" "}
                <span className="font-normal text-tarto-ink/60">(optional)</span>
              </label>
              <textarea
                id="design"
                rows={5}
                maxLength={1000}
                value={state.design}
                onChange={(event) => set("design")(event.target.value)}
                placeholder="e.g. Two tiers, white and gold, fresh flowers on top, a football theme for a 10-year-old…"
                className={inputClass}
                {...errorProps("design", errors.design, "design-help")}
              />
              <p id="design-help" className="mt-1.5 text-sm text-tarto-ink/70">
                Describe it in your own words. You can add photos in a later step.
              </p>
              <FieldError id="design" message={errors.design} />
            </div>
          ) : null}

          {state.step === 4 ? (
            <div>
              <label htmlFor="message" className="text-sm font-semibold text-tarto-ink">
                Message to write on the cake{" "}
                <span className="font-normal text-tarto-ink/60">(optional)</span>
              </label>
              <input
                id="message"
                maxLength={120}
                value={state.message}
                onChange={(event) => set("message")(event.target.value)}
                placeholder="e.g. Happy Birthday Sarah!"
                className={inputClass}
                {...errorProps("message", errors.message, "message-help")}
              />
              <p id="message-help" className="mt-1.5 text-sm text-tarto-ink/70">
                {state.message.length}/120 characters. Leave empty for no message.
              </p>
              <FieldError id="message" message={errors.message} />
            </div>
          ) : null}

          {state.step === 5 ? (
            <div>
              <p id="referenceImages-help" className="text-sm text-tarto-ink/70">
                Optional. Add up to {MAX_PHOTOS} photos of cakes you like (JPG,
                PNG, WEBP or GIF, 5MB each).
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={PHOTO_TYPES.join(",")}
                multiple
                tabIndex={-1}
                className="sr-only"
                onChange={(event) => {
                  addPhotos(event.target.files);
                  event.target.value = "";
                }}
              />
              {state.photos.length < MAX_PHOTOS ? (
                <button
                  id="referenceImages"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-tarto-ink/20 bg-white text-sm font-semibold text-tarto-ink transition hover:border-tarto-red/40"
                  {...errorProps(
                    "referenceImages",
                    errors.referenceImages,
                    "referenceImages-help"
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-2" aria-hidden>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="9" cy="11" r="2" />
                    <path d="m21 16-5-5-7 7" />
                  </svg>
                  {state.photos.length > 0 ? "Add another photo" : "Add photos"}
                </button>
              ) : null}
              <FieldError id="referenceImages" message={errors.referenceImages} />
              {previews.length > 0 ? (
                <ul className="mt-4 grid grid-cols-3 gap-2.5">
                  {previews.map((src, index) => (
                    <li key={src} className="relative overflow-hidden rounded-xl bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Inspiration photo ${index + 1}`} className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove photo ${index + 1}`}
                        onClick={() => dispatch({ type: "removePhoto", index })}
                        className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-tarto-red shadow"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2.5]" aria-hidden>
                          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {state.step === 6 ? (
            <div className="space-y-5">
              <div>
                <label htmlFor="eventDate" className="text-sm font-semibold text-tarto-ink">
                  Date you need the cake
                </label>
                <input
                  id="eventDate"
                  type="date"
                  min={todayIso()}
                  value={state.eventDate}
                  onChange={(event) => set("eventDate")(event.target.value)}
                  className={inputClass}
                  {...errorProps("eventDate", errors.eventDate)}
                />
                <FieldError id="eventDate" message={errors.eventDate} />
              </div>

              <ChoiceGroup legend="Pickup or delivery" id="deliveryMethod" error={errors.deliveryMethod}>
                <ChoiceCard
                  name="deliveryMethod"
                  value="pickup"
                  checked={state.deliveryMethod === "pickup"}
                  onChange={set("deliveryMethod")}
                  title="I'll pick it up"
                />
                <ChoiceCard
                  name="deliveryMethod"
                  value="delivery"
                  checked={state.deliveryMethod === "delivery"}
                  onChange={set("deliveryMethod")}
                  title="Please deliver it"
                  detail="We'll confirm delivery details with your quote"
                />
              </ChoiceGroup>

              {state.deliveryMethod === "delivery" ? (
                <div>
                  <label htmlFor="deliveryLocation" className="text-sm font-semibold text-tarto-ink">
                    Delivery location
                  </label>
                  <input
                    id="deliveryLocation"
                    maxLength={255}
                    autoComplete="street-address"
                    value={state.deliveryLocation}
                    onChange={(event) => set("deliveryLocation")(event.target.value)}
                    placeholder="e.g. Ntinda, near Capital Shoppers"
                    className={inputClass}
                    {...errorProps("deliveryLocation", errors.deliveryLocation)}
                  />
                  <FieldError id="deliveryLocation" message={errors.deliveryLocation} />
                </div>
              ) : null}

              <div className="grid gap-5 border-t border-tarto-ink/10 pt-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="text-sm font-semibold text-tarto-ink">
                    Your name
                  </label>
                  <input
                    id="name"
                    autoComplete="name"
                    value={state.name}
                    onChange={(event) => set("name")(event.target.value)}
                    className={inputClass}
                    {...errorProps("name", errors.name)}
                  />
                  <FieldError id="name" message={errors.name} />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-semibold text-tarto-ink">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={state.phone}
                    onChange={(event) => set("phone")(event.target.value)}
                    placeholder="07XX XXX XXX"
                    className={inputClass}
                    {...errorProps("phone", errors.phone)}
                  />
                  <FieldError id="phone" message={errors.phone} />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-tarto-ink">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={state.email}
                    onChange={(event) => set("email")(event.target.value)}
                    className={inputClass}
                    {...errorProps("email", errors.email)}
                  />
                  <FieldError id="email" message={errors.email} />
                </div>
              </div>
            </div>
          ) : null}

          {state.step === REVIEW_STEP ? (
            <div>
              <dl className="divide-y divide-tarto-ink/10 rounded-xl bg-white px-4 text-sm">
                {summary.map(([label, value, step]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <dt className="text-tarto-ink/70">{label}</dt>
                      <dd className="mt-0.5 break-words font-medium text-tarto-ink">{value}</dd>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "goTo", step })}
                      aria-label={`Edit ${label.toLowerCase()}`}
                      className="min-h-11 shrink-0 px-2 text-sm font-semibold text-tarto-red hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </dl>
              <p className="mt-4 rounded-xl bg-tarto-yellow/30 px-4 py-3 text-sm text-tarto-ink">
                <strong>Price:</strong> custom cakes are priced by hand. We&apos;ll
                send you the price for this design before anything is baked.
              </p>
              {serverState.error ? (
                <p role="alert" className="mt-4 rounded-xl bg-tarto-red/10 px-4 py-3 text-sm text-tarto-red">
                  {serverState.error}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Step navigation: sticky at the bottom on phones, inline on larger screens. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-tarto-ink/10 bg-tarto-cream/95 px-4 py-3 backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        {state.step < REVIEW_STEP ? (
          <div className="mx-auto flex max-w-2xl gap-3">
            {state.step > 0 ? (
              <Button variant="outline" onClick={back} className="flex-1 sm:flex-none">
                Back
              </Button>
            ) : null}
            <Button onClick={next} className="flex-[2] sm:ml-auto sm:flex-none sm:px-10">
              {canSkip ? "Skip" : "Continue"}
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row-reverse">
            <Button onClick={submit} disabled={pending} size="lg" className="sm:flex-1">
              {pending ? "Sending your request…" : "Send Quote Request"}
            </Button>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "whatsapp", size: "lg", className: "sm:flex-1" })}
              >
                <WhatsAppIcon />
                Send via WhatsApp instead
              </a>
            ) : null}
            <Button variant="outline" onClick={back} className="sm:hidden">
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
