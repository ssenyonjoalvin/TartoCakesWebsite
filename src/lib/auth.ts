import { createHmac, timingSafeEqual } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session-cookie";
import type { AdminRole } from "@/generated/prisma/client";

export { ADMIN_SESSION_COOKIE };

const SESSION_DAYS = 1;
const SESSION_DAYS_REMEMBERED = 30;

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl: string | null;
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
    avatarUrl: user.avatarUrl,
  } satisfies AdminSession;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encodeSessionCookie(sessionId: string) {
  return `${sessionId}.${sign(sessionId)}`;
}

function readSessionCookie(token: string | undefined) {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const sessionId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!sessionId || !signature) return null;

  const expected = sign(sessionId);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return sessionId;
}

export function sessionMaxAge(remember: boolean) {
  const days = remember ? SESSION_DAYS_REMEMBERED : SESSION_DAYS;
  return days * 24 * 60 * 60;
}

export function adminSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function createAdminSession(userId: string, remember: boolean) {
  const maxAge = sessionMaxAge(remember);
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await prisma.adminSession.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

  const session = await prisma.adminSession.create({
    data: { userId, expiresAt },
  });

  return {
    token: encodeSessionCookie(session.id),
    maxAge,
  };
}

export async function destroyCurrentAdminSession() {
  const store = await cookies();
  const sessionId = readSessionCookie(store.get(ADMIN_SESSION_COOKIE)?.value);
  if (sessionId) {
    await prisma.adminSession.deleteMany({ where: { id: sessionId } });
  }

  store.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(0),
    expires: new Date(0),
  });
}

export async function destroyUserSessions(userId: string) {
  await prisma.adminSession.deleteMany({ where: { userId } });
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const store = await cookies();
  const sessionId = readSessionCookie(store.get(ADMIN_SESSION_COOKIE)?.value);
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.deleteMany({ where: { id: session.id } });
    return null;
  }

  if (!session.user.active) {
    await prisma.adminSession.deleteMany({ where: { userId: session.userId } });
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    avatarUrl: session.user.avatarUrl,
  };
});
