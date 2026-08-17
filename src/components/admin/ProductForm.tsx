"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  createProduct,
  updateProduct,
  type ProductFieldErrors,
  type ProductFormState,
} from "@/app/admin/(dashboard)/products/actions";
import type { ProductOption, ProductRow } from "@/components/admin/product-types";
import ProductImageDropzone, {
  validateProductImageFiles,
} from "@/components/admin/ProductImageDropzone";
import type { MediaItem } from "@/lib/media-types";

const initialState: ProductFormState = {};

const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;
const PRICE_MAX = 100_000_000;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm outline-none focus:border-tarto-red/40 focus:bg-white";
const inputErrorClass =
  "mt-1.5 w-full rounded-xl border border-tarto-red bg-[#FFF5F5] px-3 py-2.5 text-sm outline-none focus:border-tarto-red";

type Props = {
  mode: "create" | "edit";
  product?: ProductRow;
  occasions: ProductOption[];
  flavors: ProductOption[];
  sizes: ProductOption[];
  libraryItems: MediaItem[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-tarto-red" role="alert">
      {message}
    </p>
  );
}

function validateClientForm(
  formData: FormData,
  keptImages: string[],
  libraryImages: string[],
  imageFiles: File[],
  mode: "create" | "edit"
): ProductFieldErrors {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = Number(priceRaw.replace(/,/g, ""));
  const occasionId = String(formData.get("occasionId") ?? "").trim();
  const flavorId = String(formData.get("flavorId") ?? "").trim();
  const sizeIds = formData
    .getAll("sizeIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const fieldErrors: ProductFieldErrors = {};

  if (!name) {
    fieldErrors.name = "Name is required.";
  } else if (name.length < 2) {
    fieldErrors.name = "Name must be at least 2 characters.";
  } else if (name.length > NAME_MAX) {
    fieldErrors.name = `Name must be ${NAME_MAX} characters or fewer.`;
  }

  if (!description) {
    fieldErrors.description = "Description is required.";
  } else if (description.length < 10) {
    fieldErrors.description = "Description must be at least 10 characters.";
  } else if (description.length > DESCRIPTION_MAX) {
    fieldErrors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!priceRaw) {
    fieldErrors.price = "Price is required.";
  } else if (!Number.isFinite(price) || price < 0) {
    fieldErrors.price = "Enter a valid price of 0 or more.";
  } else if (!Number.isInteger(price)) {
    fieldErrors.price = "Price must be a whole number.";
  } else if (price > PRICE_MAX) {
    fieldErrors.price = "Price is too high.";
  }

  if (!occasionId) fieldErrors.occasionId = "Select an occasion.";
  if (!flavorId) fieldErrors.flavorId = "Select a flavor.";
  if (sizeIds.length === 0) fieldErrors.sizeIds = "Select at least one size.";

  const imageError = validateProductImageFiles(
    imageFiles,
    keptImages.length,
    libraryImages.length,
    mode === "create" || keptImages.length === 0
  );
  if (imageError) fieldErrors.images = imageError;

  return fieldErrors;
}

export default function ProductForm({
  mode,
  product,
  occasions,
  flavors,
  sizes,
  libraryItems,
}: Props) {
  const action = mode === "edit" ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<ProductFieldErrors>({});
  const [clearedFields, setClearedFields] = useState<Set<keyof ProductFieldErrors>>(
    () => new Set()
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const existingImages = useMemo(
    () =>
      product?.images?.length
        ? product.images
        : product?.image
          ? [product.image]
          : [],
    [product]
  );
  const [keptImages, setKeptImages] = useState<string[]>(existingImages);

  const selectedSizes = useMemo(
    () => new Set(product?.sizeIds ?? []),
    [product]
  );

  const fieldErrors = useMemo(() => {
    const merged: ProductFieldErrors = {
      ...state.fieldErrors,
      ...clientErrors,
    };
    for (const field of clearedFields) {
      if (!(field in clientErrors)) {
        delete merged[field];
      }
    }
    return merged;
  }, [state.fieldErrors, clientErrors, clearedFields]);

  function clearField(field: keyof ProductFieldErrors) {
    setClearedFields((current) => new Set(current).add(field));
    setClientErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function fieldClass(field: keyof ProductFieldErrors) {
    return fieldErrors[field] ? inputErrorClass : inputClass;
  }

  return (
    <form
      action={formAction}
      noValidate
      className="mt-8 space-y-8"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const errors = validateClientForm(
          formData,
          keptImages,
          libraryImages,
          imageFiles,
          mode
        );
        if (Object.keys(errors).length > 0) {
          event.preventDefault();
          setClearedFields(new Set());
          setClientErrors(errors);
          const firstKey = Object.keys(errors)[0];
          const el = event.currentTarget.querySelector<HTMLElement>(
            `[name="${firstKey}"], #${firstKey}`
          );
          el?.focus();
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setClearedFields(new Set());
          setClientErrors({});
        }
      }}
    >
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-[#333]">
            Name <span className="text-tarto-red">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={NAME_MAX}
            defaultValue={product?.name ?? ""}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={fieldClass("name")}
            placeholder="e.g. Red Velvet Cake"
            onChange={() => clearField("name")}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label htmlFor="price" className="text-sm font-semibold text-[#333]">
            Price (UGX) <span className="text-tarto-red">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            max={PRICE_MAX}
            step={1}
            required
            defaultValue={product?.price ?? ""}
            aria-invalid={Boolean(fieldErrors.price)}
            className={fieldClass("price")}
            placeholder="120000"
            onChange={() => clearField("price")}
          />
          <FieldError message={fieldErrors.price} />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="description" className="text-sm font-semibold text-[#333]">
            Description <span className="text-tarto-red">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={DESCRIPTION_MAX}
            rows={4}
            defaultValue={product?.description ?? ""}
            aria-invalid={Boolean(fieldErrors.description)}
            className={fieldClass("description")}
            placeholder="Short product description"
            onChange={() => clearField("description")}
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <div>
          <label htmlFor="occasionId" className="text-sm font-semibold text-[#333]">
            Occasion <span className="text-tarto-red">*</span>
          </label>
          <select
            id="occasionId"
            name="occasionId"
            required
            defaultValue={product?.occasionId ?? ""}
            aria-invalid={Boolean(fieldErrors.occasionId)}
            className={fieldClass("occasionId")}
            onChange={() => clearField("occasionId")}
          >
            <option value="">Select occasion...</option>
            {occasions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.occasionId} />
        </div>

        <div>
          <label htmlFor="flavorId" className="text-sm font-semibold text-[#333]">
            Flavor <span className="text-tarto-red">*</span>
          </label>
          <select
            id="flavorId"
            name="flavorId"
            required
            defaultValue={product?.flavorId ?? ""}
            aria-invalid={Boolean(fieldErrors.flavorId)}
            className={fieldClass("flavorId")}
            onChange={() => clearField("flavorId")}
          >
            <option value="">Select flavor...</option>
            {flavors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.flavorId} />
        </div>
      </div>

      <div>
        <ProductImageDropzone
          existingImages={existingImages}
          keptImages={keptImages}
          onKeptImagesChange={setKeptImages}
          libraryImages={libraryImages}
          onLibraryImagesChange={setLibraryImages}
          libraryItems={libraryItems}
          files={imageFiles}
          onFilesChange={setImageFiles}
          error={fieldErrors.images}
          required={mode === "create"}
          onError={(message) => {
            if (message) {
              setClearedFields((current) => {
                const next = new Set(current);
                next.delete("images");
                return next;
              });
              setClientErrors((current) => ({ ...current, images: message }));
            } else {
              clearField("images");
            }
          }}
        />
        <FieldError message={fieldErrors.images} />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#333]">
          Sizes available <span className="text-tarto-red">*</span>
        </p>
        <div
          className={`mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
            fieldErrors.sizeIds ? "rounded-xl bg-[#FFF5F5] p-3" : ""
          }`}
        >
          {sizes.length === 0 ? (
            <p className="text-sm text-[#888] sm:col-span-2">
              No active sizes yet. Add them under Settings → Cake Sizes.
            </p>
          ) : (
            sizes.map((size) => (
              <label
                key={size.id}
                className="flex items-center gap-2 text-sm text-[#444]"
              >
                <input
                  type="checkbox"
                  name="sizeIds"
                  value={size.id}
                  defaultChecked={selectedSizes.has(size.id)}
                  className="h-4 w-4 accent-tarto-red"
                  onChange={() => clearField("sizeIds")}
                />
                {size.name}
              </label>
            ))
          )}
        </div>
        <FieldError message={fieldErrors.sizeIds} />
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-2 text-sm text-[#555]">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured ?? false}
            className="h-4 w-4 accent-tarto-red"
          />
          Featured on homepage
        </label>

        <label className="flex items-center gap-2 text-sm text-[#555]">
          <input
            type="checkbox"
            name="published"
            defaultChecked={product?.published ?? true}
            className="h-4 w-4 accent-tarto-red"
          />
          Published
        </label>
      </div>

      {state.error && Object.keys(clientErrors).length === 0 ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red" role="alert">
          {state.error}
        </p>
      ) : null}

      {Object.keys(fieldErrors).length > 0 ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red" role="alert">
          Please fix the highlighted fields before saving.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-[#F0F0F0] pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-tarto-red px-5 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90 disabled:opacity-70"
        >
          {pending
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Add cake"}
        </button>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-[#777] hover:text-tarto-red"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
