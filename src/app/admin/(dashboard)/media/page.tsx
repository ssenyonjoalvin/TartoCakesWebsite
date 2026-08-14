import type { Metadata } from "next";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export const metadata: Metadata = { title: "Media Management" };

export default function AdminMediaPage() {
  return (
    <AdminComingSoon
      title="Media Management"
      description="Upload and organise cake photos used across the site."
    />
  );
}
