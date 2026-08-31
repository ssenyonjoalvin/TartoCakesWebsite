import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import LocationMap from "@/components/LocationMap";
import SocialIcons from "@/components/SocialIcons";
import { contactInfo, formatPhone, phoneHref } from "@/data/contact";
import { getPublishedCakes } from "@/lib/public-cakes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a custom cake quote from Tarto Cakes UG. Call, email, or visit us at Pelican House, Stella — Najjanankumbi.",
};

async function getCakeOptions() {
  const cakes = await getPublishedCakes();
  return cakes.map((cake) => ({ name: cake.name, slug: cake.slug }));
}

async function getOccasionOptions() {
  try {
    const rows = await prisma.occasion.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return rows;
  } catch {
    return [];
  }
}

async function getSizeOptions() {
  try {
    const rows = await prisma.cakeSize.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { name: true },
    });
    return rows.map((row) => row.name);
  } catch {
    return [];
  }
}

async function getFlavorOptions() {
  try {
    const rows = await prisma.cakeFlavor.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { name: true },
    });
    return rows.map((row) => row.name);
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const [cakeOptions, occasionOptions, sizeOptions, flavorOptions] =
    await Promise.all([
      getCakeOptions(),
      getOccasionOptions(),
      getSizeOptions(),
      getFlavorOptions(),
    ]);

  return (
    <>
      <section className="bg-tarto-cream py-14">
        <div className="site-container">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-[0.18em] text-tarto-orange">
              WE&apos;D LOVE TO HEAR FROM YOU
            </p>
            <h1 className="mt-3 text-4xl font-bold text-tarto-ink sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-tarto-ink/70">
              Tell us about your celebration and we will help you design the
              perfect cake — flavours, size, theme, and delivery.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-tarto-ink">
                  Contact Information
                </h2>
                <ul className="mt-5 space-y-4 text-sm text-tarto-ink/80">
                  <li className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tarto-yellow/50 text-tarto-red">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                        <path d="M6 4h3l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-tarto-ink">Phone</p>
                      {contactInfo.phones.map((phone) => (
                        <p key={phone}>
                          <a href={phoneHref(phone)} className="hover:text-tarto-red">
                            {formatPhone(phone)}
                          </a>
                        </p>
                      ))}
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tarto-yellow/50 text-tarto-red">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 7 9-7" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-tarto-ink">Email</p>
                      <a href={`mailto:${contactInfo.email}`} className="hover:text-tarto-red">
                        {contactInfo.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tarto-yellow/50 text-tarto-red">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                        <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-tarto-ink">Address</p>
                      <p className="font-semibold text-tarto-ink">
                        {contactInfo.businessName}
                      </p>
                      <p className="text-tarto-ink/70">
                        At {contactInfo.mapLandmark}
                      </p>
                      <p>{contactInfo.address}</p>
                      <p>{contactInfo.city}</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold text-tarto-ink">Follow us</p>
                  <SocialIcons variant="light" />
                </div>
              </div>

              <LocationMap />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-tarto-ink">
                Request a Custom Quote
              </h2>
              <p className="mt-2 text-sm text-tarto-ink/70">
                Share a few details and we will get back to you with pricing and
                availability.
              </p>
              <Suspense
                fallback={
                  <p className="mt-6 text-sm text-tarto-ink/60">Loading form...</p>
                }
              >
                <ContactForm
                  cakes={cakeOptions}
                  occasions={occasionOptions}
                  sizes={sizeOptions}
                  flavors={flavorOptions}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
