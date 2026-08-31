import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { parseDatabaseUrl } from "../src/lib/db-url";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    ...parseDatabaseUrl(),
    connectionLimit: 2,
    allowPublicKeyRetrieval: true,
  }),
});

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@tartocakes.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "TartoAdmin2026";

  if ((await prisma.adminUser.count()) > 0) {
    console.log("Admin account already exists.");
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      name: "Tarto Admin",
      passwordHash: hashPassword(password),
      role: "ADMIN",
      active: true,
    },
  });

  console.log(`Created admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await Promise.race([
      prisma.$disconnect(),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
  });
