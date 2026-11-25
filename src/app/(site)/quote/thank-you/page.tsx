import type { Metadata } from "next";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { hasQuoteAccess } from "@/lib/quote-access";
import {
  buildWhatsAppOrderMessage,
  quoteReference,
  whatsAppLink,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Request Received",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ id?: string }>;
};

/**
 * Only the browser that submitted the request can retrieve its summary.
 */
async function getQuoteSummary(id: string | undefined) {
  if (!id || id.length > 40) return null;
  if (!(await hasQuoteAccess(id))) return null;
  try {
    return await prisma.cakeOrder.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        cakeName: true,
        size: true,
        flavor: true,
        message: true,
        design: true,
        eventDate: true,
        deliveryMethod: true,
        deliveryLocation: true,
        referenceImages: true,
        occasionOther: true,
        occasion: { select: { name: true } },
      },
    });
  } catch {
    return null;
  }
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function QuoteThankYouPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const [order, { whatsappNumber, business }] = await Promise.all([
    getQuoteSummary(id),
    getSiteSettings(),
  ]);

  const reference = order ? quoteReference(order.id) : null;
  const firstName = order?.name.split(/\s+/)[0];
  const occasion = order?.occasionOther || order?.occasion?.name || undefined;
  const photoCount = Array.isArray(order?.referenceImages)
    ? order.referenceImages.length
    : 0;

  const rows = order
    ? [
        ["Cake", order.cakeName],
        ["Occasion", occasion],
        ["Size", order.size],
        ["Flavour", order.flavor],
        ["Words on cake", order.message ? `“${order.message}”` : null],
        ["Design notes", order.design],
        ["Date needed", order.eventDate ? formatDate(order.eventDate) : null],
        [
          "Delivery",
          order.deliveryMethod === "pickup"
            ? "Pickup"
            : order.deliveryMethod === "delivery"
              ? `Delivery to ${order.deliveryLocation ?? ""}`
              : null,
        ],
        ["Reference photos", photoCount > 0 ? `${photoCount} attached` : null],
      ].filter((row): row is [string, string] => Boolean(row[1]))
    : [];

  const whatsappMessage =
    order && whatsappNumber
      ? buildWhatsAppOrderMessage({
          reference: reference ?? undefined,
          customerName: order.name,
          cake: order.cakeName ?? undefined,
          occasion,
          size: order.size ?? undefined,
          flavor: order.flavor ?? undefined,
          date: order.eventDate ? formatDate(order.eventDate) : undefined,
        })
      : null;

  return (
    <section className="bg-tarto-cream py-14 sm:py-20">
      <div className="site-container mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5EC] text-[#2F6B45]">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[2.5]" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="mt-5 text-3xl font-bold text-tarto-ink sm:text-4xl">
            {firstName ? `Thank you, ${firstName}!` : "Thank you!"}
          </h1>
          <p className="mt-3 text-tarto-ink/75">
            We&apos;ve received your cake request. Our team will contact you to
            confirm the details and price before anything is baked.
            {business.quoteResponseTime
              ? ` We usually reply ${business.quoteResponseTime.replace(/\.$/, "")}.`
              : ""}
          </p>
          {reference ? (
            <p className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm text-tarto-ink shadow-sm">
              Your reference:&nbsp;<strong>{reference}</strong>
            </p>
          ) : null}
        </div>

        {rows.length > 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-tarto-ink">Your request</h2>
            <dl className="mt-4 divide-y divide-tarto-ink/10 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <dt className="text-tarto-ink/70">{label}</dt>
                  <dd className="whitespace-pre-wrap font-medium text-tarto-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-tarto-ink">What happens next</h2>
          <ol className="mt-4 space-y-3 text-sm text-tarto-ink/80">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tarto-red text-xs font-bold text-white">1</span>
              We review your request and design.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tarto-red text-xs font-bold text-white">2</span>
              We contact you to confirm the price and details.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tarto-red text-xs font-bold text-white">3</span>
              Once you confirm, we bake your cake for the date you chose.
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {whatsappMessage && whatsappNumber ? (
            <a
              href={whatsAppLink(whatsappNumber, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "whatsapp", size: "lg" })}
            >
              <WhatsAppIcon />
              Continue on WhatsApp
            </a>
          ) : null}
          <ButtonLink href="/cakes" variant="outline" size="lg">
            Browse More Cakes
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
