import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { AdminRole } from "@/generated/prisma/client";

export const ADMIN_SESSION_COOKIE = "tarto_admin_session";

const SESSION_DAYS = 1;
const SESSION_DAYS_REMEMBERED = 30;

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

function getSecret() {
  return process.env.AUTH_SECRET ?? "tarto-dev-secret-change-me";
}

function getBootstrapEmail() {
  return (process.env.ADMIN_EMAIL ?? "admin@tartocakes.com").trim().toLowerCase();
}

function getBootstrapPassword() {
  return process.env.ADMIN_PASSWORD ?? "TartoAdmin2026";
}

export async function ensureBootstrapAdmin() {
  const count = await prisma.adminUser.count();
  if (count > 0) return;

  await prisma.adminUser.create({
    data: {
      email: getBootstrapEmail(),
      name: "Tarto Admin",
      passwordHash: hashPassword(getBootstrapPassword()),
      role: "ADMIN",
      active: true,
    },
  });
}

export async function verifyAdminCredentials(email: string, password: string) {
  await ensureBootstrapAdmin();

  const givenEmail = email.trim().toLowerCase();
  if (!givenEmail || !password) return null;

  const user = await prisma.adminUser.findUnique({
    where: { email: givenEmail },
  });
  if (!user || !user.active) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  } satisfies AdminSession;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminSessionToken(userId: string, remember: boolean) {
  const days = remember ? SESSION_DAYS_REMEMBERED : SESSION_DAYS;
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `${userId}|${expiresAt}`;
  return `${payload}|${sign(payload)}`;
}

function readAdminSessionToken(token: string | undefined) {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [userId, expiresAt, signature] = parts;
  const expected = sign(`${userId}|${expiresAt}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expiresAt) < Date.now()) return null;
  return { userId };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const parsed = readAdminSessionToken(
    store.get(ADMIN_SESSION_COOKIE)?.value
  );
  if (!parsed) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: parsed.userId },
  });
  if (!user || !user.active) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function sessionMaxAge(remember: boolean) {
  const days = remember ? SESSION_DAYS_REMEMBERED : SESSION_DAYS;
  return days * 24 * 60 * 60;
}
