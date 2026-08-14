import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminUserForm from "@/components/admin/AdminUserForm";

export const metadata: Metadata = { title: "Add User" };

export default async function NewAdminUserPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/admin");

  return (
    <div>
      <h1 className="text-3xl font-bold text-tarto-ink">Add user</h1>
      <p className="mt-2 max-w-xl text-sm text-tarto-ink/70">
        New team members can sign in to admin. Editors can post blogs; admins
        can also manage users.
      </p>
      <AdminUserForm />
    </div>
  );
}
