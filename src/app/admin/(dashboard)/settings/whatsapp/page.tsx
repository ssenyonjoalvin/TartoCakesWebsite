import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import WhatsAppSettingsForm from "@/components/admin/WhatsAppSettingsForm";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "WhatsApp Ordering" };

const placements = [
  "Floating chat button on every public page",
  "“Order on WhatsApp” on each cake page (with cake, size and flavour filled in)",
  "“Send via WhatsApp” in Design Your Cake",
  "“Continue on WhatsApp” after a quote request, with its reference number",
];

export default async function WhatsAppSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/admin");

  const { whatsappNumber } = await getSiteSettings();

  return (
    <div>
      <AdminPageHeader
        title="WhatsApp Ordering"
        description="Set the number customers message when they order from the website."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-5 flex items-center gap-2 text-sm">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                whatsappNumber
                  ? "bg-[#E8F5EC] text-[#2F6B45]"
                  : "bg-[#EBEBEB] text-[#555]"
              }`}
            >
              {whatsappNumber ? "Live" : "Off"}
            </span>
            <span className="text-[#777]">
              {whatsappNumber
                ? `Customers message ${formatWhatsAppNumber(whatsappNumber)}`
                : "WhatsApp buttons are hidden on the website"}
            </span>
          </div>
          <WhatsAppSettingsForm currentNumber={whatsappNumber} />
        </div>

        <aside className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <h2 className="text-sm font-bold text-tarto-ink">Where this number appears</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-[#555]">
            {placements.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="text-tarto-red">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[#888]">
            Only admins can change this setting.
          </p>
        </aside>
      </div>
    </div>
  );
}
