import type { Metadata } from "next";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <AdminComingSoon
      title="Settings"
      description="Update contact details, social links, and site preferences."
    />
  );
}
