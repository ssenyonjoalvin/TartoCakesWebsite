"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";

const slides = [
  {
    src: "/images/chocolate-layered-cake.jpg",
    alt: "Chocolate layer drip cake with cherries",
  },
  {
    src: "/images/birthday-chocolate-cake.jpg",
    alt: "Birthday chocolate drip cake",
  },
  {
    src: "/images/chocolate-cake.jpg",
    alt: "Chocolate celebration cake",
  },
];

const ROTATE_MS = 5000;

export default function HomeHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Respect the OS "reduce motion" setting: no auto-rotation at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (paused) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      aria-label="Welcome"
      className="w-full overflow-hidden bg-tarto-cream"
    >
      <div className="grid w-full lg:grid-cols-[42%_58%]">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-10 lg:py-20 xl:px-14">
          <div className="animate-fade-up w-full max-w-lg">
            <p className="text-xs font-semibold tracking-[0.18em] text-tarto-amber sm:text-[0.8rem]">
              CUSTOM CAKES IN KAMPALA
            </p>
            <h1 className="mt-3 text-[2rem] font-bold leading-tight text-tarto-ink sm:text-4xl lg:text-[2.6rem]">
              Great <span className="text-tarto-red">Taste</span> in Every{" "}
              <span className="text-tarto-red">Bite</span>
            </h1>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-tarto-ink/75 sm:text-base">
              Birthday, wedding and celebration cakes made to order. Choose a
              design from our gallery or share your own idea, and we will
              confirm the price and details with you.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/cakes" size="lg">
                View Our Cakes
              </ButtonLink>
              <ButtonLink
                href={`/contact?cake=${encodeURIComponent("Custom Cake")}`}
                variant="secondary"
                size="lg"
              >
                Create Your Cake
              </ButtonLink>
            </div>
          </div>
        </div>

        <div
          className="relative min-h-[320px] w-full bg-[#f0e2c8] sm:min-h-[460px] lg:min-h-[560px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slides.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={index === active ? slide.alt : ""}
              aria-hidden={index !== active}
              fill
              priority={index === 0}
              quality={85}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={`object-cover object-center transition-opacity duration-700 ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-tarto-cream to-transparent lg:w-12" />
        </div>
      </div>

      <div
        className="flex w-full items-center justify-center gap-1 pb-3"
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show photo ${index + 1} of ${slides.length}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => setActive(index)}
            className="flex h-11 w-11 items-center justify-center rounded-full"
          >
            <span
              className={`block rounded-full transition-all ${
                index === active
                  ? "h-2.5 w-6 bg-tarto-red"
                  : "h-2.5 w-2.5 bg-tarto-ink/25"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
