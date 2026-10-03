import Image from "next/image";
import Link from "next/link";
import type { OccasionShowcase } from "@/lib/public-cakes";

type Props = {
  occasions: OccasionShowcase[];
};

export default function OccasionGrid({ occasions }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {occasions.map((occasion) => (
        <li key={occasion.slug}>
          <Link
            href={`/cakes?occasion=${encodeURIComponent(occasion.slug)}`}
            className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[#f7efe3]"
          >
            <Image
              src={occasion.image}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            {/* Gradient keeps white text readable on any photo. */}
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
              <span className="block text-base font-bold leading-tight sm:text-lg">
                {occasion.name}
              </span>
              <span className="mt-0.5 block text-xs text-white/85 sm:text-sm">
                {occasion.cakeCount === 1
                  ? "1 design"
                  : `${occasion.cakeCount} designs`}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
