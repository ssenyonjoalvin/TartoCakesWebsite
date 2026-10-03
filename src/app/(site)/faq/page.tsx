import type { Metadata } from "next";
import ContactOptions from "@/components/ContactOptions";
import FaqList from "@/components/FaqList";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSiteSettings, publicFaq } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const items = publicFaq(await getSiteSettings());
  return {
    title: "Frequently Asked Questions",
    description:
      "Answers about ordering custom cakes from Tarto Cakes UG in Kampala: notice, delivery, pickup, payment and more.",
    // An empty FAQ page shouldn't appear in search results.
    robots: items.length === 0 ? { index: false } : undefined,
  };
}

export default async function FaqPage() {
  const settings = await getSiteSettings();
  const items = publicFaq(settings);

  // FAQPage structured data lets Google show answers directly in results.
  const jsonLd =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <section className="bg-tarto-cream py-14">
      <div className="site-container mx-auto max-w-3xl">
        <SectionHeading
          as="h1"
          eyebrow="Help"
          title="Frequently Asked Questions"
          description={
            items.length > 0
              ? "Everything you need to know about ordering from Tarto Cakes."
              : undefined
          }
        />

        <div className="mt-10">
          {items.length > 0 ? (
            <FaqList items={items} />
          ) : (
            <p className="text-center text-tarto-ink/75">
              We&apos;re putting our answers together. In the meantime, just ask
              us. We reply to every message.
            </p>
          )}
        </div>

        <div className="mt-10">
          <ContactOptions whatsappNumber={settings.whatsappNumber} />
        </div>
      </div>

      {jsonLd ? (
        <script
          type="application/ld+json"
          // JSON.stringify output is safe here; escape "<" so an answer can't close the script tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
    </section>
  );
}
