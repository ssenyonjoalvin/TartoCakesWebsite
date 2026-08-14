import type { Metadata } from "next";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export const metadata: Metadata = { title: "Orders / Inquiries" };

export default function AdminOrdersPage() {
  return (
    <AdminComingSoon
      title="Orders / Inquiries"
      description="Review quote requests and customer orders from the website."
    />
  );
}
