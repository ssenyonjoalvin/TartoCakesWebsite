import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import AdminUserForm from "@/components/admin/AdminUserForm";

export const metadata: Metadata = { title: "Edit User" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminUserPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/admin");

  const { id } = await params;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-tarto-ink">Edit user</h1>
      <p className="mt-2 max-w-xl text-sm text-tarto-ink/70">
        Update access for {user.name}. Blog posts they wrote stay linked to
        this account.
      </p>
      <AdminUserForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        }}
      />
    </div>
  );
}
