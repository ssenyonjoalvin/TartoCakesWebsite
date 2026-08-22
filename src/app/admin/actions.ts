"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const { token, maxAge } = await createAdminSession(user.id, remember);
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions(maxAge));

  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyCurrentAdminSession();
}
