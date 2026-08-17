"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  name: string;
  images: string[];
};

export default function CakeImageGallery({ name, images }: Props) {
  const photos = images.filter(Boolean);
  const [active, setActive] = useState(photos[0] ?? "");

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-[#f7efe3] text-sm text-tarto-ink/50 sm:aspect-[4/5]">
        No photo yet
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f7efe3] shadow-[0_10px_30px_rgba(26,26,26,0.08)] sm:aspect-[4/5]">
        <Image
          src={active}
          alt={name}
          fill
          priority
          quality={95}
          sizes="(max-width: 1024px) 90vw, 520px"
          className="object-cover object-center"
        />
      </div>
      {photos.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {photos.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-[#f7efe3] ${
                active === src
                  ? "ring-2 ring-tarto-red"
                  : "opacity-80 hover:opacity-100"
              }`}
              aria-label="View photo"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
