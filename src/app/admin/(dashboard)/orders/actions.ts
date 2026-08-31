"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import type { OrderStatus } from "@/generated/prisma/client";

const allowed: OrderStatus[] = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

export async function updateOrderStatus(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as OrderStatus;
  if (!id || !allowed.includes(status)) return;

  await prisma.cakeOrder.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin", "layout");
}
