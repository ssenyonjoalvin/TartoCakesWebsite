"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  avatarFromFormData,
  deleteProfileImage,
  saveProfileImage,
} from "@/lib/profile-images";

export type ProfileFormState = {
  error?: string;
  success?: string;
};

export type PhotoFormState = {
  error?: string;
  success?: string;
};

export async function updateOwnProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
  });
  if (!user) return { error: "Account not found." };

  const emailChanging = email !== user.email;
  const passwordChanging = newPassword.length > 0;

  if (emailChanging || passwordChanging) {
    if (!currentPassword) {
      return {
        error: "Enter your current password to change your email or password.",
      };
    }
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return { error: "Current password is incorrect." };
    }
  }

  if (passwordChanging && newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const emailTaken = await prisma.adminUser.findFirst({
    where: { email, NOT: { id: session.id } },
  });
  if (emailTaken) return { error: "That email is already in use." };

  await prisma.adminUser.update({
    where: { id: session.id },
    data: {
      name,
      email,
      ...(passwordChanging ? { passwordHash: hashPassword(newPassword) } : {}),
    },
  });

  revalidatePath("/admin/profile");
  revalidatePath("/admin/users");

  return { success: "Profile updated successfully." };
}

export async function updateProfilePhoto(
  _prev: PhotoFormState,
  formData: FormData
): Promise<PhotoFormState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const file = avatarFromFormData(formData);
  if (!file) return { error: "Choose an image to upload." };

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
    select: { avatarUrl: true },
  });
  if (!user) return { error: "Account not found." };

  try {
    const avatarUrl = await saveProfileImage(file);
    await prisma.adminUser.update({
      where: { id: session.id },
      data: { avatarUrl },
    });
    await deleteProfileImage(user.avatarUrl);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not upload profile photo.",
    };
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin", "layout");

  return { success: "Profile photo updated." };
}

export async function removeProfilePhoto(): Promise<PhotoFormState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
    select: { avatarUrl: true },
  });
  if (!user?.avatarUrl) return { error: "No profile photo to remove." };

  await prisma.adminUser.update({
    where: { id: session.id },
    data: { avatarUrl: null },
  });
  await deleteProfileImage(user.avatarUrl);

  revalidatePath("/admin/profile");
  revalidatePath("/admin", "layout");

  return { success: "Profile photo removed." };
}
