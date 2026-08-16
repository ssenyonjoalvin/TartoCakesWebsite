import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductManager from "@/components/admin/ProductManager";
import type { ProductRow } from "@/components/admin/product-types";

export const metadata: Metadata = { title: "Product Management" };

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function AdminProductsPage() {
  const [cakes, occasions, flavors, sizes] = await Promise.all([
    prisma.cake.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        occasion: true,
        flavor: true,
      },
    }),
    prisma.occasion.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.cakeFlavor.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.cakeSize.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const sizeNameById = new Map(sizes.map((size) => [size.id, size.name]));
  const sizeIdByName = new Map(sizes.map((size) => [size.name, size.id]));

  const products: ProductRow[] = cakes.map((cake) => {
    const rawSizes = asStringArray(cake.sizes);
    const sizeIds = rawSizes.map(
      (value) => sizeIdByName.get(value) ?? value
    );
    const sizeNames = sizeIds.map(
      (id) => sizeNameById.get(id) ?? id
    );
    const images = asStringArray(cake.images);
    return {
      id: cake.id,
      name: cake.name,
      description: cake.description,
      price: cake.price,
      image: cake.image,
      images: images.length > 0 ? images : cake.image ? [cake.image] : [],
      sizeIds,
      occasionId: cake.occasionId,
      flavorId: cake.flavorId,
      occasionName: cake.occasion?.name ?? null,
      flavorName: cake.flavor?.name ?? null,
      sizeNames,
      featured: cake.featured,
      published: cake.published,
    };
  });

  return (
    <ProductManager
      products={products}
      occasions={occasions.map((item) => ({ id: item.id, name: item.name }))}
      flavors={flavors.map((item) => ({ id: item.id, name: item.name }))}
      sizes={sizes.map((item) => ({ id: item.id, name: item.name }))}
    />
  );
}
