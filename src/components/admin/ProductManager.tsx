"use client";

import { useMemo } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  deleteProduct,
  toggleProductPublished,
} from "@/app/admin/(dashboard)/products/actions";
import type { ProductOption, ProductRow } from "@/components/admin/product-types";

type Props = {
  products: ProductRow[];
  occasions: ProductOption[];
  flavors: ProductOption[];
  sizes: ProductOption[];
};

function formatPrice(amount: number) {
  return `UGX ${amount.toLocaleString("en-UG")}`;
}

function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

export default function ProductManager({
  products,
  occasions,
  flavors,
  sizes,
}: Props) {
  const sizeNameById = useMemo(() => {
    return new Map(sizes.map((size) => [size.id, size.name]));
  }, [sizes]);

  return (
    <div>
      <AdminPageHeader
        title="Product Management"
        description="Manage cakes with occasion, flavor, sizes, price, and uploaded images."
        actions={
          <Link
            href="/admin/products/new"
            className="rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90"
          >
            + Add cake
          </Link>
        }
      />

      {(occasions.length === 0 || flavors.length === 0 || sizes.length === 0) && (
        <div className="mt-4 rounded-xl border border-[#F6D9A8] bg-[#FFF8EB] px-4 py-3 text-sm text-[#7A5A20]">
          Add active items in Settings first
          {occasions.length === 0 ? " (Occasions)" : ""}
          {flavors.length === 0 ? " (Flavors)" : ""}
          {sizes.length === 0 ? " (Sizes)" : ""}.
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                <th className="px-5 py-3.5">Cake ID</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Occasion</th>
                <th className="px-5 py-3.5">Flavor</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Sizes</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#888]">
                    No cakes yet.{" "}
                    <Link href="/admin/products/new" className="font-semibold text-tarto-red hover:underline">
                      Add your first product
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[#F5F5F5] last:border-0">
                    <td className="px-5 py-4 font-mono text-xs text-[#777]">
                      {shortId(product.id)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover bg-[#F3F3F3]"
                        />
                        <div>
                          <p className="font-semibold text-[#2B2B2B]">{product.name}</p>
                          <p className="max-w-[220px] truncate text-xs text-[#999]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {product.occasionName ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {product.flavorName ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {product.sizeNames.length > 0
                        ? product.sizeNames.join(", ")
                        : product.sizeIds
                            .map((id) => sizeNameById.get(id) ?? id)
                            .join(", ") || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          product.published
                            ? "bg-[#E8F5EC] text-[#2F6B45]"
                            : "bg-[#EBEBEB] text-[#777]"
                        }`}
                      >
                        {product.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          aria-label={`Edit ${product.name}`}
                          title="Edit"
                          className="rounded-lg p-2 text-[#2563EB] transition hover:bg-[#EFF6FF]"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                            <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                            <path d="m13.5 6.5 3 3" />
                          </svg>
                        </Link>
                        <form action={toggleProductPublished}>
                          <input type="hidden" name="id" value={product.id} />
                          <input
                            type="hidden"
                            name="published"
                            value={product.published ? "true" : "false"}
                          />
                          <button
                            type="submit"
                            title={product.published ? "Unpublish" : "Publish"}
                            className="rounded-lg p-2 text-[#777] transition hover:bg-[#F5F5F5]"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                              {product.published ? (
                                <>
                                  <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                                  <circle cx="12" cy="12" r="2.5" />
                                </>
                              ) : (
                                <>
                                  <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                                  <path d="m4 4 16 16" />
                                </>
                              )}
                            </svg>
                          </button>
                        </form>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            aria-label={`Delete ${product.name}`}
                            title="Delete"
                            className="rounded-lg p-2 text-tarto-red transition hover:bg-[#FBEAEA]"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                              <path d="M4 7h16" />
                              <path d="M9 7V5h6v2" />
                              <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
