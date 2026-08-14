import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { deleteAdminUser } from "./actions";

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-tarto-orange">
            TEAM
          </p>
          <h1 className="mt-2 text-3xl font-bold text-tarto-ink">
            User Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-tarto-ink/70">
            Track who can sign in to admin, and who authored each blog post.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-lg bg-tarto-red px-4 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90"
        >
          Add user
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-tarto-ink/10 text-xs font-semibold uppercase tracking-wide text-tarto-ink/55">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-tarto-ink/5 last:border-0">
                <td className="px-4 py-3 font-semibold text-tarto-ink">
                  {user.name}
                  {user.id === session.id ? (
                    <span className="ml-2 text-xs font-medium text-tarto-orange">
                      you
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-tarto-ink/75">{user.email}</td>
                <td className="px-4 py-3">{user.role === "ADMIN" ? "Admin" : "Editor"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      user.active
                        ? "font-medium text-emerald-700"
                        : "font-medium text-tarto-ink/45"
                    }
                  >
                    {user.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-tarto-ink/70">
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="px-4 py-3">{user._count.blogPosts}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-semibold text-tarto-red hover:underline"
                    >
                      Edit
                    </Link>
                    {user.id !== session.id ? (
                      <form action={deleteAdminUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                          type="submit"
                          className="font-semibold text-tarto-ink/45 hover:text-tarto-red"
                        >
                          Remove
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
