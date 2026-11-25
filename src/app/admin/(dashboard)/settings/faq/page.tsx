import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import FaqManager from "@/components/admin/FaqManager";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqSettingsPage() {
  const { faq } = await getSiteSettings();

  return (
    <div>
      <AdminPageHeader
        title="Frequently Asked Questions"
        description="Questions and answers shown on the website's FAQ page and homepage. Only visible questions with an answer are shown."
      />
      <div className="mt-6 max-w-3xl">
        <FaqManager initialItems={faq} />
      </div>
    </div>
  );
}
