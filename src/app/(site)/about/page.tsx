import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About Tarto Cakes UG — our bakery story, craftsmanship, values, and master bakers.",
};

const processImages = [
  {
    src: "/images/cooking-with-love.jpg",
    alt: "Baking with love — flour heart on a board",
  },
  {
    src: "/images/chef-making-cake.jpg",
    alt: "Chef frosting a layered cake",
  },
  {
    src: "/images/chef-shaping-cake.jpg",
    alt: "Chef shaping and leveling a cake",
  },
  {
    src: "/images/white-wedding-cake.jpg",
    alt: "Finished celebration cake",
  },
];

const bakers = [
  {
    name: "Sarah Tarto",
    role: "Founder & Head Baker",
    bio: "Leads the bakery with a passion for flavour, finish, and celebration cakes made with heart.",
    image: "/images/sarah-tarto.jpg",
  },
  {
    name: "John Musoke",
    role: "Pastry Master",
    bio: "Specialises in structure, sponge, and the craft behind every clean, beautiful finish.",
    image: "/images/john-musoke.jpg",
  },
  {
    name: "Grace Nakato",
    role: "Cake Designer",
    bio: "Brings colour, theme, and creative detail to custom cakes for every kind of celebration.",
    image: "/images/grace-nakato.jpg",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero — compact spacing like the mockup */}
      <section className="bg-tarto-cream py-10 lg:py-14">
        <div className="site-container grid items-center gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-4 xl:gap-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-tarto-red">
              OUR PHILOSOPHY
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-tarto-ink sm:text-4xl lg:text-[2.55rem]">
              We bake more than cakes,{" "}
              <span className="text-tarto-red">we bake happiness.</span>
            </h1>
            <p className="mt-7 max-w-lg text-[0.95rem] leading-relaxed text-tarto-ink/75">
              At Tarto Cakes UG, every creation is driven by artisanal excellence —
              from the first whisk of batter to the final delicate finish. We bake
              with fresh ingredients, careful craftsmanship, and a whole lot of love,
              turning birthdays, weddings, and quiet everyday joys into moments that
              taste as beautiful as they look. Because for us, a cake is never just
              dessert — it is happiness, shared slice by slice.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/cakes"
                className="rounded-full bg-tarto-red px-6 py-3 text-sm font-bold text-white transition hover:bg-tarto-red/90"
              >
                Explore Our Gallery
              </Link>
              <Link
                href="#bakers"
                className="rounded-full border border-tarto-red bg-transparent px-6 py-3 text-sm font-bold text-tarto-red transition hover:bg-tarto-red hover:text-white"
              >
                Meet the Bakers
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-xl justify-self-center lg:max-w-none lg:justify-self-stretch">
            <div className="relative rotate-2 rounded-md bg-white p-2.5 shadow-[0_18px_45px_rgba(26,26,26,0.12)] sm:rotate-3">
              <div className="relative aspect-[5/4] overflow-hidden rounded-sm bg-tarto-cream sm:aspect-[4/3]">
                <Image
                  src="/images/about-hero.jpg"
                  alt="Tarto baker decorating a layered cake"
                  fill
                  priority
                  quality={92}
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="absolute -bottom-3 left-1 z-10 flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 shadow-lg sm:left-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tarto-yellow text-tarto-red">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6.2 5.5 5.5 0 0 1 21.5 12C19 16.5 12 21 12 21z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold leading-none text-tarto-ink">1,000+</p>
                <p className="mt-1 text-xs text-tarto-ink/65">Smiles Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Passion / craftsmanship */}
      <section className="bg-white py-16 lg:py-20">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {processImages.map((item, index) => (
              <div
                key={item.src}
                className={`relative overflow-hidden rounded-2xl ${
                  index % 2 === 0 ? "aspect-square" : "aspect-[4/5]"
                } ${index === 1 ? "mt-3 sm:mt-5" : ""} ${
                  index === 2 ? "mb-3 sm:mb-5" : ""
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-tarto-red">
              <span aria-hidden>★</span> THE ART OF BAKING
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-tarto-ink sm:text-4xl">
              A Passion for Perfection in Every Crumb.
            </h2>
            <p className="mt-5 leading-relaxed text-tarto-ink/75">
              From our earliest home bakes to a full celebration bakery, our
              philosophy has stayed the same: quality ingredients, patient
              technique, and cakes made to order for the people who matter most.
            </p>
            <p className="mt-4 leading-relaxed text-tarto-ink/75">
              Every sponge, drip, and decorative detail is finished by hand. We
              believe a cake should feel personal — flavoured for your taste,
              styled for your theme, and ready right on time.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tarto-red/10 text-tarto-red">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 12.5l2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-bold text-tarto-ink">100% Better Quality</p>
                  <p className="mt-1 text-sm text-tarto-ink/65">
                    Trusted ingredients and careful finish.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tarto-red/10 text-tarto-red">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                    <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6.2 5.5 5.5 0 0 1 21.5 12C19 16.5 12 21 12 21z" />
                  </svg>
                </span>
                <div>
                  <p className="font-bold text-tarto-ink">Handmade with Love</p>
                  <p className="mt-1 text-sm text-tarto-ink/65">
                    Freshly baked, never mass-produced.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="bg-tarto-cream py-16">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-tarto-ink sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-3 text-sm text-tarto-ink/70 sm:text-base">
              The ingredients of our success go beyond flour and sugar.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-tarto-red">★</p>
                  <h3 className="mt-2 text-xl font-bold text-tarto-ink">
                    Uncompromising Quality
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-tarto-ink/70">
                    From sponge to frosting, every cake is finished with care,
                    consistency, and pride in the details.
                  </p>
                </div>
                <div className="relative hidden h-28 w-36 shrink-0 overflow-hidden rounded-xl sm:block">
                  <Image
                    src="/images/chef-making-cake.jpg"
                    alt="Baker at work"
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              </div>
            </article>

            <article className="rounded-2xl bg-tarto-red p-6 text-white shadow-sm">
              <p className="text-tarto-yellow">◎</p>
              <h3 className="mt-2 text-xl font-bold">Ethical Sourcing</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                We choose trusted ingredients and partners so every slice tastes
                as good as it looks.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex text-sm font-semibold text-tarto-yellow hover:underline"
              >
                Learn more →
              </Link>
            </article>

            <article className="rounded-2xl bg-tarto-yellow p-6 shadow-sm">
              <p className="text-tarto-ink">◷</p>
              <h3 className="mt-2 text-xl font-bold text-tarto-ink">Timely Delivery</h3>
              <p className="mt-3 text-sm leading-relaxed text-tarto-ink/80">
                Your celebration timeline matters. We plan ahead and deliver on
                schedule — every time.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-tarto-red">✦</p>
                  <h3 className="mt-2 text-xl font-bold text-tarto-ink">Our Vision</h3>
                  <p className="mt-3 text-sm leading-relaxed text-tarto-ink/70">
                    To make every Ugandan celebration sweeter with cakes people
                    remember long after the party ends.
                  </p>
                </div>
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-tarto-red/30 text-center text-[10px] font-bold leading-tight text-tarto-red sm:flex">
                  TARTO
                  <br />
                  UG
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Master bakers */}
      <section id="bakers" className="bg-white py-16 lg:py-20">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-[0.16em] text-tarto-red">
              THE HANDS BEHIND THE SCENE
            </p>
            <h2 className="mt-3 text-3xl font-bold text-tarto-ink sm:text-4xl">
              Meet Our Master Bakers
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {bakers.map((baker) => (
              <article key={baker.name} className="text-center">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl bg-tarto-cream">
                  <Image
                    src={baker.image}
                    alt={baker.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 30vw"
                    className="object-cover object-top"
                  />
                </div>
                <h3 className="mt-4 text-lg font-bold text-tarto-ink">{baker.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-tarto-red">
                  {baker.role}
                </p>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-tarto-ink/70">
                  {baker.bio}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
