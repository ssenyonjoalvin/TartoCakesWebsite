import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { ButtonLink } from "@/components/ui/Button";
import { formatCakePrice } from "@/lib/pricing";

type Props = {
  cake: {
    slug: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    sizes?: string[];
    flavors?: string[];
    occasionName?: string | null;
    reviewSummary?: {
      average: number;
      count: number;
    };
  };
  /** Show the occasion badge (useful in the mixed catalog, noise on related cakes). */
  showOccasion?: boolean;
};

export default function CakeCard({ cake, showOccasion = false }: Props) {
  const reviewCount = cake.reviewSummary?.count ?? 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(214,40,40,0.12)]">
      <Link
        href={`/cakes/${cake.slug}`}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-[4/5] overflow-hidden bg-[#f7efe3]"
      >
        {cake.image ? (
          <Image
            src={cake.image}
            alt={cake.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover object-center transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-tarto-ink/50">
            Photo coming soon
          </span>
        )}
        {showOccasion && cake.occasionName ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-tarto-ink shadow-sm">
            {cake.occasionName}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4 text-center">
        <h3 className="text-lg font-bold text-tarto-ink">{cake.name}</h3>
        {reviewCount > 0 ? (
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-tarto-ink/70">
            <StarRating value={cake.reviewSummary?.average ?? 0} />
            <span>({reviewCount})</span>
          </div>
        ) : null}
        {cake.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-tarto-ink/70">
            {cake.description}
          </p>
        ) : null}
        <p className="mb-4 mt-2 text-base font-bold text-tarto-red">
          {formatCakePrice(cake)}
        </p>
        <ButtonLink
          href={`/cakes/${cake.slug}`}
          aria-label={`View details for ${cake.name}`}
          className="mt-auto"
        >
          View Details
        </ButtonLink>
      </div>
    </article>
  );
}
