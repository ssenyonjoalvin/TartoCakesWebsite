import type { Metadata } from "next";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export const metadata: Metadata = { title: "Customer Management" };

export default function AdminCustomersPage() {
  return (
    <AdminComingSoon
      title="Customer Management"
      description="Keep customer names, contacts, and order history in one place."
    />
  );
}
