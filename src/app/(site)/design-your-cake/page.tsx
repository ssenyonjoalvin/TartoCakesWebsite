import type { Metadata } from "next";
import CakeBuilder from "@/components/CakeBuilder";
import SectionHeading from "@/components/ui/SectionHeading";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Design Your Cake",
  description:
    "Design a custom cake with Tarto Cakes UG in a few simple steps: occasion, size, flavour, design and delivery. We confirm the price before baking.",
};

async function getBuilderOptions() {
  // Options come from Admin → Settings (occasions, sizes, flavours), so the
  // builder only ever offers what the bakery actually makes.
  const [occasions, sizes, flavors] = await Promise.all([
    prisma.occasion.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.cakeSize.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, servings: true, description: true },
    }),
    prisma.cakeFlavor.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, description: true },
    }),
  ]);
  return { occasions, sizes, flavors };
}

export default async function DesignYourCakePage() {
  const [options, { whatsappNumber }] = await Promise.all([
    getBuilderOptions(),
    getSiteSettings(),
  ]);

  return (
    <section className="bg-tarto-cream pb-48 pt-10 sm:pb-16 sm:pt-14">
      <div className="site-container">
        <SectionHeading
          as="h1"
          eyebrow="Custom cakes"
          title="Design Your Cake"
          description="Tell us about your celebration in a few quick steps. We'll confirm the price and details with you before anything is baked."
        />
        <div className="mx-auto mt-10 max-w-2xl">
          <CakeBuilder
            occasions={options.occasions}
            sizes={options.sizes}
            flavors={options.flavors}
            whatsappNumber={whatsappNumber}
          />
        </div>
      </div>
    </section>
  );
}
