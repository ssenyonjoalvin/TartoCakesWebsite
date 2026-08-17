"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export type CatalogKind = "flavors" | "sizes" | "occasions";

export type CatalogFormState = {
  error?: string;
};

const paths: Record<CatalogKind, string> = {
  flavors: "/admin/settings/flavors",
  sizes: "/admin/settings/sizes",
  occasions: "/admin/settings/occasions",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function listCatalog(kind: CatalogKind) {
  await requireSession();
  if (kind === "flavors") {
    return prisma.cakeFlavor.findMany({ orderBy: { name: "asc" } });
  }
  if (kind === "sizes") {
    return prisma.cakeSize.findMany({ orderBy: { name: "asc" } });
  }
  return prisma.occasion.findMany({ orderBy: { name: "asc" } });
}

export async function createCatalogItem(
  kind: CatalogKind,
  _prev: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const servingsRaw = String(formData.get("servings") ?? "").trim();
  const servings = servingsRaw ? Number(servingsRaw) : null;

  if (!name) return { error: "Name is required." };

  try {
    if (kind === "flavors") {
      await prisma.cakeFlavor.create({
        data: { name, description, active: true },
      });
    } else if (kind === "sizes") {
      await prisma.cakeSize.create({
        data: {
          name,
          description,
          servings: Number.isFinite(servings) ? servings : null,
          active: true,
        },
      });
    } else {
      await prisma.occasion.create({
        data: {
          name,
          slug: slugify(name),
          description,
          active: true,
        },
      });
    }
  } catch {
    return { error: "That name is already in use." };
  }

  revalidatePath(paths[kind]);
  revalidatePath("/admin/settings");
  redirect(paths[kind]);
}

export async function updateCatalogItem(
  kind: CatalogKind,
  _prev: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";
  const servingsRaw = String(formData.get("servings") ?? "").trim();
  const servings = servingsRaw ? Number(servingsRaw) : null;

  if (!id || !name) return { error: "Name is required." };

  try {
    if (kind === "flavors") {
      await prisma.cakeFlavor.update({
        where: { id },
        data: { name, description, active },
      });
    } else if (kind === "sizes") {
      await prisma.cakeSize.update({
        where: { id },
        data: {
          name,
          description,
          active,
          servings: Number.isFinite(servings) ? servings : null,
        },
      });
    } else {
      await prisma.occasion.update({
        where: { id },
        data: {
          name,
          slug: slugify(name),
          description,
          active,
        },
      });
    }
  } catch {
    return { error: "Could not save. That name may already be in use." };
  }

  revalidatePath(paths[kind]);
  revalidatePath("/admin/settings");
  redirect(paths[kind]);
}

export async function deleteCatalogItem(kind: CatalogKind, formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  if (kind === "flavors") await prisma.cakeFlavor.delete({ where: { id } });
  else if (kind === "sizes") await prisma.cakeSize.delete({ where: { id } });
  else await prisma.occasion.delete({ where: { id } });

  revalidatePath(paths[kind]);
  revalidatePath("/admin/settings");
}

export async function toggleCatalogItem(kind: CatalogKind, formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  if (kind === "flavors") {
    await prisma.cakeFlavor.update({
      where: { id },
      data: { active: !active },
    });
  } else if (kind === "sizes") {
    await prisma.cakeSize.update({
      where: { id },
      data: { active: !active },
    });
  } else {
    await prisma.occasion.update({
      where: { id },
      data: { active: !active },
    });
  }

  revalidatePath(paths[kind]);
  revalidatePath("/admin/settings");
}
