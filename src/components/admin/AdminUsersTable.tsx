"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AddUserDialog from "@/components/admin/AddUserDialog";
import TablePagination from "@/components/admin/TablePagination";
import UserRowActions from "@/components/admin/UserRowActions";
import { useTablePagination } from "@/components/admin/useTablePagination";
import { matchesSearch, useAdminSearch } from "@/components/admin/AdminSearch";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
  lastLoginLabel: string;
  postCount: number;
};

type Props = {
  users: AdminUserRow[];
  currentUserId: string;
};

export default function AdminUsersTable({ users, currentUserId }: Props) {
  const { query } = useAdminSearch();
  const visible = users.filter((user) =>
    matchesSearch(query, user.name, user.email, user.role)
  );
  const pagination = useTablePagination(visible, query);

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
              {pagination.total === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#888]">
                    {query.trim()
                      ? "No users match this search."
                      : "No users yet."}
                  </td>
                </tr>
              ) : (
              pagination.items.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#F5F5F5] last:border-0"
                >
                  <td className="px-5 py-4 font-semibold text-[#2B2B2B]">
                    {user.name}
                    {user.id === currentUserId ? (
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
                  <td className="px-5 py-4 text-[#555]">{user.lastLoginLabel}</td>
                  <td className="px-5 py-4 text-[#555]">{user.postCount}</td>
                  <td className="px-5 py-4">
                    <UserRowActions
                      user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        active: user.active,
                      }}
                      canRemove={user.id !== currentUserId}
                    />
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={pagination.setPage}
          label="users"
        />
      </div>
    </div>
  );
}
