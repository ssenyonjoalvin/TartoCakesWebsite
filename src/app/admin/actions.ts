"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSession,
  destroyCurrentAdminSession,
  verifyAdminCredentials,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAdmin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (isRateLimited(`login:${await clientIp()}`, 10, 10 * 60 * 1000)) {
    return { error: "Too many sign-in attempts. Please wait 10 minutes and try again." };
  }
  if (!email || email.length > 254 || !password || password.length > 256) {
    return { error: "Invalid email or password." };
  }

  try {
    const user = await verifyAdminCredentials(email, password);
    if (!user) return { error: "Invalid email or password." };
    const { token, maxAge } = await createAdminSession(user.id, remember);
    const store = await cookies();
    store.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions(maxAge));
  } catch {
    console.error("Admin sign-in could not complete.");
    return { error: "Sign in is temporarily unavailable. Please try again shortly." };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyCurrentAdminSession();
}
