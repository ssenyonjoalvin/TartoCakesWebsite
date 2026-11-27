import type { Metadata } from "next";
import CakeGallery from "@/components/CakeGallery";
import SectionHeading from "@/components/ui/SectionHeading";
import { filtersFromParams, flavorsInCatalog } from "@/lib/catalog-filter";
import { getActiveOccasions, getPublishedCakes } from "@/lib/public-cakes";

export const metadata: Metadata = {
  title: "Our Cakes",
  description:
    "Browse cakes by occasion and flavour from Tarto Cakes UG — birthdays, weddings, and more in Kampala.",
  // Filtered views (?occasion=…) all point search engines at the main catalog.
  alternates: { canonical: "/cakes" },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CakesPage({ searchParams }: Props) {
  const [cakes, dbOccasions, rawParams] = await Promise.all([
    getPublishedCakes(),
    getActiveOccasions(),
    searchParams,
  ]);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const initialFilters = filtersFromParams(params);

  // Only offer occasions that have at least one published cake, so a chip
  // never leads to an empty grid.
  const usedOccasions = new Set(
    cakes.map((cake) => cake.occasionSlug).filter(Boolean)
  );
  const occasions =
    dbOccasions.length > 0
      ? dbOccasions.filter((occasion) => usedOccasions.has(occasion.slug))
      : Array.from(
          new Map(
            cakes
              .filter((cake) => cake.occasionSlug && cake.occasionName)
              .map((cake) => [
                cake.occasionSlug!,
                { slug: cake.occasionSlug!, name: cake.occasionName! },
              ])
          ).values()
        );

  return (
    <section className="bg-tarto-cream py-14">
      <div className="site-container">
        <SectionHeading
          as="h1"
          title="Our Cakes"
          description="Search our collection or filter by occasion and flavour. Every cake can be customised for your celebration."
        />
        <div className="mt-10">
          {cakes.length > 0 ? (
            <CakeGallery
              cakes={cakes.map((cake) => ({
                id: cake.id,
                slug: cake.slug,
                name: cake.name,
                price: cake.price,
                image: cake.image,
                description: cake.description,
                sizes: cake.sizes,
                flavors: cake.flavors,
                featured: Boolean(cake.featured),
                occasionSlug: cake.occasionSlug,
                occasionName: cake.occasionName,
                reviewSummary: cake.reviewSummary,
              }))}
              occasions={occasions}
              flavors={flavorsInCatalog(cakes)}
              initialFilters={initialFilters}
            />
          ) : (
            <p className="text-center text-tarto-ink/70">
              Our cake gallery is being updated. Please check back soon, or
              contact us to request a custom cake.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
