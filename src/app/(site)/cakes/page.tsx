import type { Metadata } from "next";
import CakeGallery, {
  type GalleryCake,
  type GalleryOccasion,
} from "@/components/CakeGallery";
import { cakes as staticCakes, categoryLabels } from "@/data/cakes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Our Cakes",
  description:
    "Browse cakes by occasion from Tarto Cakes UG — birthdays, weddings, and more.",
};

async function getGalleryData(): Promise<{
  cakes: GalleryCake[];
  occasions: GalleryOccasion[];
}> {
  try {
    const [dbCakes, dbOccasions] = await Promise.all([
      prisma.cake.findMany({
        where: { published: true },
        include: { occasion: true },
        orderBy: [{ occasion: { name: "asc" } }, { name: "asc" }],
      }),
      prisma.occasion.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { slug: true, name: true },
      }),
    ]);

    if (dbCakes.length > 0) {
      const cakes: GalleryCake[] = dbCakes.map((cake) => ({
        id: cake.id,
        slug: cake.slug,
        name: cake.name,
        price: cake.price,
        image: cake.image,
        description: cake.description,
        occasionSlug: cake.occasion?.slug ?? null,
        occasionName: cake.occasion?.name ?? null,
      }));

      // Prefer settings occasions; if empty, derive from cakes
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

      return { cakes, occasions };
    }
  } catch {
    // fall through
  }

  const cakes: GalleryCake[] = staticCakes.map((cake) => ({
    id: cake.id,
    slug: cake.slug,
    name: cake.name,
    price: cake.price,
    image: cake.image,
    description: cake.description,
    occasionSlug: cake.category,
    occasionName: categoryLabels[cake.category],
  }));

  const occasions: GalleryOccasion[] = (
    ["birthday", "wedding", "princess", "custom", "romantic"] as const
  ).map((slug) => ({
    slug,
    name: categoryLabels[slug],
  }));

  return { cakes, occasions };
}

export default async function CakesPage() {
  const { cakes, occasions } = await getGalleryData();

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
            <CakeGallery cakes={cakes} occasions={occasions} />
          </div>
        </div>
      </section>
    </>
  );
}
