"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  filesFromFormData,
  saveProductImages,
} from "@/lib/product-images";
import { parseMediaUrls } from "@/lib/media";
import type { CakeCategory } from "@/generated/prisma/client";

export type ProductFieldErrors = {
  name?: string;
  description?: string;
  price?: string;
  occasionId?: string;
  flavorId?: string;
  sizeIds?: string;
  images?: string;
};

export type ProductFormState = {
  error?: string;
  fieldErrors?: ProductFieldErrors;
};

const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;
const PRICE_MAX = 100_000_000;

async function requireSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseSizeIds(formData: FormData) {
  return formData
    .getAll("sizeIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function parseKeepImages(formData: FormData) {
  return formData
    .getAll("keepImages")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function categoryFromSlug(slug: string | null | undefined): CakeCategory {
  const allowed: CakeCategory[] = [
    "birthday",
    "wedding",
    "princess",
    "custom",
    "romantic",
  ];
  if (slug && allowed.includes(slug as CakeCategory)) {
    return slug as CakeCategory;
  }
  return "custom";
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "cake";
  let n = 1;
  while (true) {
    const existing = await prisma.cake.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

function validateProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = Number(priceRaw.replace(/,/g, ""));
  const occasionId = String(formData.get("occasionId") ?? "").trim();
  const flavorId = String(formData.get("flavorId") ?? "").trim();
  const sizeIds = parseSizeIds(formData);
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
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

  if (!occasionId) {
    fieldErrors.occasionId = "Select an occasion.";
  }

  if (!flavorId) {
    fieldErrors.flavorId = "Select a flavor.";
  }

  if (sizeIds.length === 0) {
    fieldErrors.sizeIds = "Select at least one size.";
  }

  return {
    name,
    description,
    price,
    occasionId,
    flavorId,
    sizeIds,
    featured,
    published,
    fieldErrors,
  };
}

async function resolveImages(formData: FormData, requireAtLeastOne: boolean) {
  const kept = parseKeepImages(formData);
  const library = parseMediaUrls(formData, "libraryImages");
  const uploadedFiles = filesFromFormData(formData, "imageFiles");

  if (kept.length + library.length + uploadedFiles.length > 12) {
    return {
      fieldErrors: {
        images: "You can add up to 12 images per product.",
      },
    } as const;
  }

  let uploaded: string[] = [];
  try {
    uploaded = await saveProductImages(uploadedFiles);
  } catch (error) {
    return {
      fieldErrors: {
        images:
          error instanceof Error
            ? error.message
            : "Could not upload images.",
      },
    } as const;
  }

  const images = [...kept, ...library, ...uploaded];
  if (requireAtLeastOne && images.length === 0) {
    return {
      fieldErrors: {
        images: "Upload at least one product image.",
      },
    } as const;
  }
  return { images } as const;
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const parsed = validateProductFields(formData);
  const imageResult = await resolveImages(formData, true);
  const fieldErrors: ProductFieldErrors = { ...parsed.fieldErrors };
  if ("fieldErrors" in imageResult) {
    Object.assign(fieldErrors, imageResult.fieldErrors);
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const images = "images" in imageResult ? imageResult.images : [];
  const { name, description, price, occasionId, flavorId, sizeIds, featured, published } =
    parsed;

  const occasion = await prisma.occasion.findUnique({
    where: { id: occasionId },
  });
  if (!occasion) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { occasionId: "Selected occasion was not found." },
    };
  }

  const flavor = await prisma.cakeFlavor.findUnique({
    where: { id: flavorId },
  });
  if (!flavor) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { flavorId: "Selected flavor was not found." },
    };
  }

  const selectedSizes = await prisma.cakeSize.findMany({
    where: { id: { in: sizeIds }, active: true },
  });
  if (selectedSizes.length === 0) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { sizeIds: "Select at least one valid size." },
    };
  }

  const slug = await uniqueSlug(name);

  await prisma.cake.create({
    data: {
      name,
      slug,
      description,
      price: Math.round(price),
      category: categoryFromSlug(occasion.slug),
      image: images[0],
      images,
      occasionId,
      flavorId,
      sizes: sizeIds,
      flavors: [flavor.name],
      featured,
      published,
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Product not found." };

  const parsed = validateProductFields(formData);
  const imageResult = await resolveImages(formData, true);
  const fieldErrors: ProductFieldErrors = { ...parsed.fieldErrors };
  if ("fieldErrors" in imageResult) {
    Object.assign(fieldErrors, imageResult.fieldErrors);
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const images = "images" in imageResult ? imageResult.images : [];
  const { name, description, price, occasionId, flavorId, sizeIds, featured, published } =
    parsed;

  const occasion = await prisma.occasion.findUnique({
    where: { id: occasionId },
  });
  if (!occasion) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { occasionId: "Selected occasion was not found." },
    };
  }

  const flavor = await prisma.cakeFlavor.findUnique({
    where: { id: flavorId },
  });
  if (!flavor) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { flavorId: "Selected flavor was not found." },
    };
  }

  const selectedSizes = await prisma.cakeSize.findMany({
    where: { id: { in: sizeIds }, active: true },
  });
  if (selectedSizes.length === 0) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { sizeIds: "Select at least one valid size." },
    };
  }

  const slug = await uniqueSlug(name, id);

  await prisma.cake.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price: Math.round(price),
      category: categoryFromSlug(occasion.slug),
      image: images[0],
      images,
      occasionId,
      flavorId,
      sizes: sizeIds,
      flavors: [flavor.name],
      featured,
      published,
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.cake.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function toggleProductPublished(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  if (!id) return;
  await prisma.cake.update({
    where: { id },
    data: { published: !published },
  });
  revalidatePath("/admin/products");
}
