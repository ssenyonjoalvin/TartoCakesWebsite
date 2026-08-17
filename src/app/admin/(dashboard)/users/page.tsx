import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export const metadata: Metadata = { title: "User Management" };

function formatDate(value: Date | null) {
  if (!value) return "Never";
  return value.toLocaleString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/admin");

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { blogPosts: true } } },
  });

  return (
    <AdminUsersTable
      currentUserId={session.id}
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        lastLoginLabel: formatDate(user.lastLoginAt),
        postCount: user._count.blogPosts,
      }))}
    />
  );
}
