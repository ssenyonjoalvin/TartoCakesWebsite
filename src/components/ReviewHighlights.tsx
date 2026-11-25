import Link from "next/link";
import StarRating from "@/components/StarRating";
import SectionHeading from "@/components/ui/SectionHeading";
import type { PublicReview } from "@/lib/reviews";

type Props = {
  reviews: PublicReview[];
};

/** Approved customer reviews only (moderated in Admin → Cake Reviews). */
export default function ReviewHighlights({ reviews }: Props) {
  return (
    <section className="bg-tarto-cream py-14 sm:py-16">
      <div className="site-container">
        <SectionHeading eyebrow="Reviews" title="What our customers say" />
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
                <StarRating value={review.rating} />
                <blockquote className="mt-3 flex-1">
                  <p className="line-clamp-5 leading-relaxed text-tarto-ink/80">
                    “{review.comment}”
                  </p>
                </blockquote>
                <figcaption className="mt-5 border-t border-tarto-ink/10 pt-4 text-sm">
                  <span className="font-bold text-tarto-ink">{review.name}</span>
                  <span className="text-tarto-ink/70">
                    {" "}
                    on{" "}
                    <Link href={`/cakes/${review.cakeSlug}`} className="font-medium text-tarto-red hover:underline">
                      {review.cakeName}
                    </Link>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
