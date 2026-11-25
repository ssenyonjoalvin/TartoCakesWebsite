"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { src: "/images/hero-background-v2.webp", alt: "Cream and chocolate drip cake topped with cherries in a warm bakery" },
  { src: "/images/hero-strawberry-background.webp", alt: "Strawberry vanilla celebration cake in a warm bakery" },
  { src: "/images/hero-caramel-background.webp", alt: "Caramel chocolate celebration cake in a warm bakery" },
];

export default function HomeHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label="Welcome to Tarto Cakes"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden bg-[#faf2e5]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={index === active ? slide.alt : ""}
            aria-hidden={index !== active}
            fill
            priority={index === 0}
            quality={90}
            sizes="100vw"
            className={`object-cover object-[65%_center] md:object-right transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(250,242,229,0.96)_0%,rgba(250,242,229,0.88)_45%,rgba(250,242,229,0.45)_100%)] md:bg-[linear-gradient(90deg,rgba(250,242,229,0.92)_0%,rgba(250,242,229,0.72)_30%,rgba(250,242,229,0.16)_53%,transparent_70%)]" />
      </div>

      <div className="site-container relative z-10 mx-auto flex min-h-[520px] max-w-[1600px] items-center pb-24 pt-16 md:min-h-[560px] md:py-24 xl:min-h-[640px] xl:py-28">
        <div className="w-full md:w-[48%]">
          <p className="text-sm font-semibold uppercase tracking-[0.04em] text-[#b94e08]">
            Welcome to Tarto Cakes
          </p>
          <h1 className="mt-3 text-[clamp(2.5rem,4.7vw,4.75rem)] font-bold leading-[1.12] tracking-[-0.045em] text-tarto-ink">
            Great <span className="text-[#e99500]">Taste</span>
            <br />
            in Every <span className="text-[#e99500]">Bite</span>
          </h1>
          <p className="mt-5 max-w-[24rem] text-base leading-[1.85] text-tarto-ink/80 lg:text-lg">
            Delicious, beautiful and memorable cakes for every celebration.
            Made with love, just for you.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 lg:mt-8 lg:gap-5">
            <Link href="/cakes" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#c91b0b] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#aa1608] sm:px-7 sm:text-base">
              View Our Cakes
            </Link>
            <Link href="/design-your-cake" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ffbd08] px-6 py-3 text-sm font-bold text-tarto-ink shadow-sm transition hover:bg-[#efac00] sm:px-7 sm:text-base">
              Request a Quote
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show cake photo ${index + 1} of ${slides.length}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => { setActive(index); setPaused(true); }}
            className="flex h-11 w-8 items-center justify-center rounded-full"
          >
            <span className={`h-2.5 w-2.5 rounded-full transition-transform ${index === active ? "scale-125 bg-[#e98500] ring-4 ring-white/60" : index === 1 ? "bg-[#ffb400]" : "bg-[#bd241b]"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
