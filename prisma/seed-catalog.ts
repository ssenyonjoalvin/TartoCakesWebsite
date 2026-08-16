import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { cakes, categoryLabels } from "../src/data/cakes";
import type { CakeCategory } from "../src/data/cakes";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(url),
});

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

async function main() {
  const flavors = uniqueSorted(cakes.flatMap((cake) => cake.flavors));
  const sizes = uniqueSorted(cakes.flatMap((cake) => cake.sizes));
  const occasions = (
    Object.keys(categoryLabels) as Array<CakeCategory | "all">
  )
    .filter((key) => key !== "all")
    .map((key, index) => ({
      name: categoryLabels[key].replace(/ Cakes$/, ""),
      slug: key,
      sortOrder: index,
      description: `${categoryLabels[key]} for celebrations.`,
    }));

  for (const [index, name] of flavors.entries()) {
    await prisma.cakeFlavor.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: index, active: true },
    });
  }

  for (const [index, name] of sizes.entries()) {
    await prisma.cakeSize.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: index, active: true },
    });
  }

  for (const occasion of occasions) {
    await prisma.occasion.upsert({
      where: { slug: occasion.slug },
      update: { name: occasion.name },
      create: {
        name: occasion.name,
        slug: occasion.slug,
        description: occasion.description,
        sortOrder: occasion.sortOrder,
        active: true,
      },
    });
  }

  console.log(
    `Seeded ${flavors.length} flavors, ${sizes.length} sizes, ${occasions.length} occasions.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
