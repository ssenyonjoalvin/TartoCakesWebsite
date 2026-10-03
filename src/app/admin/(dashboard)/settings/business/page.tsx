import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BusinessInfoForm from "@/components/admin/BusinessInfoForm";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Business & Delivery" };

export default async function BusinessSettingsPage() {
  const { business } = await getSiteSettings();

  return (
    <div>
      <AdminPageHeader
        title="Business & Delivery"
        description="Opening hours, ordering notice, delivery and payment details shown to customers. Anything left empty stays hidden on the website."
      />
      <div className="mt-6 max-w-3xl">
        <BusinessInfoForm info={business} />
      </div>
    </div>
  );
}
