import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import type { ProductRow } from "@/components/admin/product-types";

export const metadata: Metadata = { title: "Edit Cake" };

type Props = {
  params: Promise<{ id: string }>;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [cake, occasions, flavors, sizes] = await Promise.all([
    prisma.cake.findUnique({
      where: { id },
      include: { occasion: true, flavor: true },
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

  if (!cake) notFound();

  const sizeNameById = new Map(sizes.map((size) => [size.id, size.name]));
  const sizeIdByName = new Map(sizes.map((size) => [size.name, size.id]));
  const rawSizes = asStringArray(cake.sizes);
  const sizeIds = rawSizes.map((value) => sizeIdByName.get(value) ?? value);
  const images = asStringArray(cake.images);

  const product: ProductRow = {
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
    sizeNames: sizeIds.map((sizeId) => sizeNameById.get(sizeId) ?? sizeId),
    featured: cake.featured,
    published: cake.published,
  };

  return (
    <div>
      <AdminPageHeader
        title="Edit cake"
        description={`Update ${cake.name}.`}
        actions={
          <Link
            href="/admin/products"
            className="rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#444] hover:bg-[#F7F7F7]"
          >
            Back to products
          </Link>
        }
      />
      <ProductForm
        mode="edit"
        product={product}
        occasions={occasions.map((item) => ({ id: item.id, name: item.name }))}
        flavors={flavors.map((item) => ({ id: item.id, name: item.name }))}
        sizes={sizes.map((item) => ({ id: item.id, name: item.name }))}
      />
    </div>
  );
}
