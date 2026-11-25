import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/auth-secret";

const COOKIE = "tarto_quote_access";
const MAX_AGE = 60 * 60;

function signature(value: string) {
  return createHmac("sha256", getAuthSecret()).update(`quote:${value}`).digest("hex");
}

export async function grantQuoteAccess(id: string) {
  const value = `${id}.${Date.now() + MAX_AGE * 1000}`;
  (await cookies()).set(COOKIE, `${value}.${signature(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/quote/thank-you",
    maxAge: MAX_AGE,
  });
}

export async function hasQuoteAccess(id: string) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [orderId, expires, mac, extra] = token.split(".");
  if (extra || orderId !== id || !expires || !mac || Number(expires) <= Date.now() || !Number.isFinite(Number(expires))) return false;
  const expected = Buffer.from(signature(`${orderId}.${expires}`));
  const received = Buffer.from(mac);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
