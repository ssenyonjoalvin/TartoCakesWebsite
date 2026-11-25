import type { Metadata } from "next";
import ContactOptions from "@/components/ContactOptions";
import SectionHeading from "@/components/ui/SectionHeading";
import { contactInfo } from "@/data/contact";
import type { BusinessInfo } from "@/lib/business-fields";
import { getSiteSettings, hasDeliveryInfo } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const { business } = await getSiteSettings();
  return {
    title: "Delivery & Pickup",
    description:
      "Cake delivery and pickup from Tarto Cakes UG in Kampala: delivery areas, fees, how early to order and pickup details.",
    alternates: { canonical: "/delivery" },
    robots: hasDeliveryInfo(business) ? undefined : { index: false },
  };
}

const SECTIONS: { key: keyof BusinessInfo; title: string; icon: string }[] = [
  { key: "orderNotice", title: "How early to order", icon: "M12 7v5l3.5 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
  { key: "sameDayOrders", title: "Same-day orders", icon: "M13 3 5 14h6l-1 7 8-11h-6l1-7z" },
  { key: "deliveryAreas", title: "Where we deliver", icon: "M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
  { key: "deliveryFees", title: "Delivery fees", icon: "M3 7h11v10H3zM14 10h4l3 3v4h-7V10zM7 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { key: "pickupInfo", title: "Pickup", icon: "M4 10h16l-1.5 10h-13L4 10zM8 10V7a4 4 0 0 1 8 0v3" },
  { key: "openingHours", title: "Opening hours", icon: "M4 5h16v15H4zM4 9h16M9 3v4M15 3v4" },
  { key: "paymentMethods", title: "Payment", icon: "M3 6h18v12H3zM3 10h18M7 15h4" },
];

export default async function DeliveryPage() {
  const { business, whatsappNumber } = await getSiteSettings();
  const filled = SECTIONS.filter((section) => business[section.key].trim());

  return (
    <section className="bg-tarto-cream py-14">
      <div className="site-container mx-auto max-w-4xl">
        <SectionHeading
          as="h1"
          eyebrow="Getting your cake"
          title="Delivery & Pickup"
          description={`Planning when and how your cake reaches you. We're based at ${contactInfo.address}, ${contactInfo.city}.`}
        />

        {filled.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {filled.map((section) => (
              <article key={section.key} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tarto-red/10 text-tarto-red">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={section.icon} />
                    </svg>
                  </span>
                  <h2 className="text-lg font-bold text-tarto-ink">{section.title}</h2>
                </div>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-tarto-ink/80">
                  {business[section.key]}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-tarto-ink/75">
            Delivery details depend on your location and date. Tell us where
            and when you need your cake and we&apos;ll confirm the options.
          </p>
        )}

        <div className="mt-10">
          <ContactOptions
            whatsappNumber={whatsappNumber}
            title="Ask about delivery to your area"
            text="Send us your location and date and we'll confirm the delivery options."
          />
        </div>
      </div>
    </section>
  );
}
