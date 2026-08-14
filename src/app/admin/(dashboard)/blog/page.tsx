import type { Metadata } from "next";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export const metadata: Metadata = { title: "Blog Management" };

export default function AdminBlogPage() {
  return (
    <AdminComingSoon
      title="Blog Management"
      description="Create, edit, and publish bakery stories from the Tarto Cakes UG admin."
    />
  );
}
