"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/chocolate-layered-cake.jpg",
    alt: "Chocolate layer drip cake with cherries",
    position: "object-center",
  },
  {
    src: "/images/birthday-chocolate-cake.jpg",
    alt: "Birthday chocolate drip cake",
    position: "object-center",
  },
  {
    src: "/images/chocolate-cake.jpg",
    alt: "Chocolate celebration cake",
    position: "object-center",
  },
];

export default function HomeHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="w-full overflow-hidden bg-tarto-cream">
      <div className="grid w-full lg:grid-cols-[42%_58%]">
        <div className="flex flex-col justify-center px-4 py-14 sm:px-6 lg:px-10 xl:px-14 lg:py-20">
          <div className="animate-fade-up w-full max-w-lg">
            <p className="text-xs font-semibold tracking-[0.18em] text-tarto-orange sm:text-[0.8rem]">
              WELCOME TO TARTO CAKES
            </p>
            <h1 className="mt-3 text-[1.85rem] font-bold leading-tight text-tarto-ink sm:text-3xl lg:text-[2.15rem]">
              Great <span className="text-tarto-orange">Taste</span> in Every{" "}
              <span className="text-tarto-orange">Bite</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-tarto-ink/70 sm:text-[0.95rem]">
              Delicious, beautiful and memorable cakes for every celebration.
              Made with love, just for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/cakes"
                className="rounded-full bg-tarto-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-tarto-red/90"
              >
                View Our Cakes
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-tarto-yellow px-5 py-2.5 text-sm font-bold text-tarto-ink transition hover:bg-tarto-orange"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>

        <div className="relative min-h-[380px] w-full bg-[#f0e2c8] sm:min-h-[460px] lg:min-h-[560px]">
          {slides.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              loading={index === 0 ? undefined : "eager"}
              quality={95}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={`object-cover transition-opacity duration-700 ${slide.position} ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-tarto-cream to-transparent lg:w-12" />
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-2 pb-5 pt-1">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 w-2 rounded-full transition ${
              index === active
                ? "bg-tarto-red"
                : index === 1
                  ? "bg-tarto-orange"
                  : "bg-tarto-yellow"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
