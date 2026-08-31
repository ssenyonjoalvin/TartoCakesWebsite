import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { cakes, categoryLabels, type CakeCategory } from "../src/data/cakes";
import { parseDatabaseUrl } from "../src/lib/db-url";

const occasionMeta: { slug: CakeCategory; sortOrder: number }[] = [
  { slug: "birthday", sortOrder: 0 },
  { slug: "wedding", sortOrder: 1 },
  { slug: "princess", sortOrder: 2 },
  { slug: "custom", sortOrder: 3 },
  { slug: "romantic", sortOrder: 4 },
];

export async function seedCatalog(prisma: PrismaClient) {
  for (const occasion of occasionMeta) {
    await prisma.occasion.upsert({
      where: { slug: occasion.slug },
      create: {
        slug: occasion.slug,
        name: categoryLabels[occasion.slug],
        active: true,
        sortOrder: occasion.sortOrder,
      },
      update: {},
    });
  }

  const flavorNames = [
    ...new Set(cakes.flatMap((cake) => cake.flavors).filter(Boolean)),
  ];
  for (const name of flavorNames) {
    await prisma.cakeFlavor.upsert({
      where: { name },
      create: { name, active: true },
      update: {},
    });
  }

  const sizeNames = [
    ...new Set(cakes.flatMap((cake) => cake.sizes).filter(Boolean)),
  ];
  for (const name of sizeNames) {
    await prisma.cakeSize.upsert({
      where: { name },
      create: { name, active: true },
      update: {},
    });
  }

  const [occasions, flavors, sizes, existingCakes] = await Promise.all([
    prisma.occasion.findMany({ select: { id: true, slug: true } }),
    prisma.cakeFlavor.findMany({ select: { id: true, name: true } }),
    prisma.cakeSize.findMany({ select: { id: true, name: true } }),
    prisma.cake.findMany({ select: { slug: true } }),
  ]);

  const occasionIdBySlug = new Map(occasions.map((row) => [row.slug, row.id]));
  const flavorIdByName = new Map(flavors.map((row) => [row.name, row.id]));
  const sizeIdByName = new Map(sizes.map((row) => [row.name, row.id]));
  const existingSlugs = new Set(existingCakes.map((row) => row.slug));

  const missing = cakes.filter((cake) => !existingSlugs.has(cake.slug));
  if (missing.length === 0) {
    console.log("Catalog cakes already exist in the database.");
    return;
  }

  for (const cake of missing) {
    const flavorId = flavorIdByName.get(cake.flavors[0] ?? "") ?? null;
    const sizeIds = cake.sizes
      .map((name) => sizeIdByName.get(name))
      .filter((id): id is string => Boolean(id));

    await prisma.cake.create({
      data: {
        slug: cake.slug,
        name: cake.name,
        price: cake.price,
        category: cake.category,
        image: cake.image,
        images: [cake.image],
        description: cake.description,
        sizes: sizeIds,
        flavors: cake.flavors,
        featured: cake.featured ?? false,
        published: true,
        occasionId: occasionIdBySlug.get(cake.category) ?? null,
        flavorId,
      },
    });
  }

  console.log(`Added ${missing.length} catalog cake${missing.length === 1 ? "" : "s"} to the database.`);
}

function createClient() {
  return new PrismaClient({
    adapter: new PrismaMariaDb({
      ...parseDatabaseUrl(),
      connectionLimit: 2,
      allowPublicKeyRetrieval: true,
    }),
  });
}

async function runStandalone() {
  const prisma = createClient();
  try {
    await seedCatalog(prisma);
  } finally {
    await Promise.race([
      prisma.$disconnect(),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
  }
}

const invokedDirectly = process.argv[1]?.includes("seed-catalog");
if (invokedDirectly) {
  runStandalone().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
