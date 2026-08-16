"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import type { AdminRole } from "@/generated/prisma/client";

export type UserFormState = {
  error?: string;
};

async function requireAdminManager() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") {
    return { error: "Only admins can manage users." } as const;
  }
  return { session };
}

function parseRole(value: FormDataEntryValue | null): AdminRole {
  return value === "ADMIN" ? "ADMIN" : "EDITOR";
}

export async function createAdminUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const access = await requireAdminManager();
  if ("error" in access) return { error: access.error };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const exists = await prisma.adminUser.findUnique({ where: { email } });
  if (exists) return { error: "That email is already in use." };

  await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      active: true,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateAdminUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const access = await requireAdminManager();
  if ("error" in access) return { error: access.error };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));
  const active = formData.get("active") === "on";

  if (!id || !name || !email) {
    return { error: "Name and email are required." };
  }
  if (password && password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const current = await prisma.adminUser.findUnique({ where: { id } });
  if (!current) return { error: "User not found." };

  if (id === access.session.id && !active) {
    return { error: "You cannot deactivate your own account." };
  }
  if (id === access.session.id && role !== "ADMIN") {
    return { error: "You cannot remove your own admin role." };
  }

  const emailTaken = await prisma.adminUser.findFirst({
    where: { email, NOT: { id } },
  });
  if (emailTaken) return { error: "That email is already in use." };

  if (current.role === "ADMIN" && role !== "ADMIN") {
    const otherAdmins = await prisma.adminUser.count({
      where: { role: "ADMIN", active: true, NOT: { id } },
    });
    if (otherAdmins === 0) {
      return { error: "Keep at least one active admin." };
    }
  }

  await prisma.adminUser.update({
    where: { id },
    data: {
      name,
      email,
      role,
      active,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteAdminUser(formData: FormData) {
  const access = await requireAdminManager();
  if ("error" in access) return;

  const id = String(formData.get("id") ?? "");
  if (!id || id === access.session.id) return;

  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) return;

  if (user.role === "ADMIN") {
    const otherAdmins = await prisma.adminUser.count({
      where: { role: "ADMIN", active: true, NOT: { id } },
    });
    if (otherAdmins === 0) return;
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
}
