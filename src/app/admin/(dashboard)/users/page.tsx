import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AddUserDialog from "@/components/admin/AddUserDialog";
import UserRowActions from "@/components/admin/UserRowActions";

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
    <div>
      <AdminPageHeader
        title="User Management"
        description="Track who can sign in to admin, and who authored each blog post."
        actions={<AddUserDialog />}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last login</th>
                <th className="px-5 py-3.5">Posts</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#F5F5F5] last:border-0"
                >
                  <td className="px-5 py-4 font-semibold text-[#2B2B2B]">
                    {user.name}
                    {user.id === session.id ? (
                      <span className="ml-2 text-xs font-medium text-tarto-red">
                        you
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-[#555]">{user.email}</td>
                  <td className="px-5 py-4 text-[#555]">
                    {user.role === "ADMIN" ? "Admin" : "Editor"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.active
                          ? "bg-[#E8F5EC] text-[#2F6B45]"
                          : "bg-[#EBEBEB] text-[#777]"
                      }`}
                    >
                      {user.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#555]">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="px-5 py-4 text-[#555]">
                    {user._count.blogPosts}
                  </td>
                  <td className="px-5 py-4">
                    <UserRowActions
                      user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        active: user.active,
                      }}
                      canRemove={user.id !== session.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
