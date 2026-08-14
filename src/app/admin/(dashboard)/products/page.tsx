import type { Metadata } from "next";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export const metadata: Metadata = { title: "Product Management" };

export default function AdminProductsPage() {
  return (
    <AdminComingSoon
      title="Product Management"
      description="Add and update cakes, prices, flavours, and categories."
    />
  );
}
