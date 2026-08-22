import type { Metadata } from "next";
import CakeGallery from "@/components/CakeGallery";
import { getActiveOccasions, getPublishedCakes } from "@/lib/public-cakes";

export const metadata: Metadata = {
  title: "Our Cakes",
  description:
    "Browse cakes by occasion from Tarto Cakes UG — birthdays, weddings, and more.",
};

export default async function CakesPage() {
  const [cakes, dbOccasions] = await Promise.all([
    getPublishedCakes(),
    getActiveOccasions(),
  ]);

  const occasions =
    dbOccasions.length > 0
      ? dbOccasions
      : Array.from(
          new Map(
            cakes
              .filter((cake) => cake.occasionSlug && cake.occasionName)
              .map((cake) => [
                cake.occasionSlug!,
                {
                  slug: cake.occasionSlug!,
                  name: cake.occasionName!,
                },
              ])
          ).values()
        );

  return (
    <>
      <section className="bg-tarto-cream py-14">
        <div className="site-container">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-[0.18em] text-tarto-orange">
              CAKE GALLERY
            </p>
            <h1 className="mt-3 text-4xl font-bold text-tarto-ink sm:text-5xl">
              Our Cakes
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-tarto-ink/70">
              Explore our collection and filter by occasion. Every cake can be
              customised for your celebration.
            </p>
          </div>
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
                  occasionSlug: cake.occasionSlug,
                  occasionName: cake.occasionName,
                  reviewSummary: cake.reviewSummary,
                }))}
                occasions={occasions}
              />
            ) : (
              <p className="text-center text-tarto-ink/70">
                No cakes are published yet. Add products in the admin dashboard
                to show them here.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
