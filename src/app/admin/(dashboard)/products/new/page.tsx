import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listMediaItems } from "@/lib/media";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add Cake" };

export default async function NewProductPage() {
  const [occasions, flavors, sizes, libraryItems] = await Promise.all([
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
    listMediaItems(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Add cake"
        description="Upload photos and set occasion, flavor, sizes, and price."
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
        mode="create"
        occasions={occasions.map((item) => ({ id: item.id, name: item.name }))}
        flavors={flavors.map((item) => ({ id: item.id, name: item.name }))}
        sizes={sizes.map((item) => ({ id: item.id, name: item.name }))}
        libraryItems={libraryItems}
      />
    </div>
  );
}
