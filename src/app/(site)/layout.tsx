import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getSiteSettings } from "@/lib/site-settings";
import { contactInfo } from "@/data/contact";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getSiteSettings never throws, so a DB outage can't take down the layout
  // (and with it the error page that tells customers to call us).
  const { whatsappNumber } = await getSiteSettings();

  return (
    <div className="flex min-h-full w-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-tarto-ink focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="w-full flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat number={whatsappNumber || normalizeWhatsAppNumber(contactInfo.phones[0]) || ""} />
    </div>
  );
}
