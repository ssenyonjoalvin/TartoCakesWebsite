import "dotenv/config";
import { spawnSync } from "node:child_process";
import mariadb from "mariadb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { parseDatabaseUrl } from "../src/lib/db-url";
import { seedCatalog } from "./seed-catalog";

function databaseName() {
  const name = parseDatabaseUrl().database;
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(`Unsafe database name in DATABASE_URL: ${name}`);
  }
  return name;
}

function runPrisma(args: string[], inherit = true) {
  const result = spawnSync("npx", ["prisma", ...args], {
    stdio: inherit ? "inherit" : "pipe",
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    const detail = inherit ? "" : result.stderr || result.stdout;
    throw new Error(
      [`prisma ${args.join(" ")} failed`, detail].filter(Boolean).join("\n")
    );
  }
  return result.stdout ?? "";
}

function extractSql(output: string) {
  const start = output.search(/--\s*CreateTable|CREATE TABLE|ALTER TABLE/i);
  if (start < 0) return "";
  return output.slice(start).trim();
}

async function withServerConnection<T>(
  work: (connection: mariadb.Connection) => Promise<T>
) {
  const db = parseDatabaseUrl();
  const connection = await mariadb.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    ssl: db.ssl,
    allowPublicKeyRetrieval: true,
    multipleStatements: true,
    connectTimeout: 15_000,
  });

  try {
    return await work(connection);
  } finally {
    await connection.end();
  }
}

async function ensureDatabase() {
  const name = databaseName();
  await withServerConnection(async (connection) => {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${name}\``);
  });
  console.log(`Database ready: ${name}`);
}

const SCHEMA_TABLES = [
  "Cake",
  "BlogPost",
  "Customer",
  "cake_reviews",
  "cake_orders",
  "MediaAsset",
  "SiteSetting",
  "AdminUser",
  "admin_sessions",
  "CakeFlavor",
  "CakeSize",
  "Occasion",
];

async function tableIsUsable(
  connection: mariadb.Connection,
  table: string
) {
  try {
    await connection.query(`SELECT 1 FROM \`${table}\` LIMIT 1`);
    return true;
  } catch (error) {
    const code = Number((error as { errno?: number }).errno);
    if ([1146, 1932].includes(code)) return false;
    throw error;
  }
}

async function applySql(connection: mariadb.Connection, sql: string) {
  const statements = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await connection.query(`${statement};`);
    } catch (error) {
      const code = Number((error as { errno?: number }).errno);
      if ([1050, 1061, 1826, 1005].includes(code)) continue;
      throw error;
    }
  }
}

async function ensureSchema() {
  const name = databaseName();

  await withServerConnection(async (connection) => {
    await connection.query(`USE \`${name}\``);
    const healthy = await tableIsUsable(connection, "AdminUser");

    if (!healthy) {
      console.log("Clearing broken tables from a previous setup attempt...");
      await connection.query("SET FOREIGN_KEY_CHECKS=0");
      for (const table of SCHEMA_TABLES) {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      }
      await connection.query("SET FOREIGN_KEY_CHECKS=1");
    }

    const stillHealthy = await tableIsUsable(connection, "AdminUser");
    const output = runPrisma(
      stillHealthy
        ? [
            "migrate",
            "diff",
            "--from-config-datasource",
            "--to-schema",
            "prisma/schema.prisma",
            "--script",
          ]
        : [
            "migrate",
            "diff",
            "--from-empty",
            "--to-schema",
            "prisma/schema.prisma",
            "--script",
          ],
      false
    );
    const sql = extractSql(output);
    if (!sql) {
      console.log("Tables already match the schema.");
      return;
    }

    console.log("Creating tables...");
    await applySql(connection, sql);
    console.log("Tables ready.");
  });
}

function createClient() {
  const db = parseDatabaseUrl();
  return new PrismaClient({
    adapter: new PrismaMariaDb({
      ...db,
      connectionLimit: 2,
      allowPublicKeyRetrieval: true,
      connectTimeout: 15_000,
    }),
  });
}

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@tartocakes.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "TartoAdmin2026";
  const prisma = createClient();

  const existing = await prisma.adminUser.count();
  if (existing > 0) {
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
  console.log("Password is the ADMIN_PASSWORD value in .env");
}

async function ensureCatalogCakes() {
  const prisma = createClient();
  await seedCatalog(prisma);
}

async function main() {
  await ensureDatabase();
  runPrisma(["generate"]);
  await ensureSchema();
  await ensureAdmin();
  await ensureCatalogCakes();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
