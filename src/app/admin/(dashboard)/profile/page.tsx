import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProfileAvatar from "@/components/admin/ProfileAvatar";
import ProfileForm from "@/components/admin/ProfileForm";
import ProfilePhotoForm from "@/components/admin/ProfilePhotoForm";

export const metadata: Metadata = { title: "My Profile" };

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

export default async function AdminProfilePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
    include: { _count: { select: { blogPosts: true } } },
  });
  if (!user) redirect("/admin/login");

  return (
    <div>
      <AdminPageHeader
        title="My Profile"
        description="View your account details and update your name, email, or password."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center">
            <ProfileAvatar name={user.name} avatarUrl={user.avatarUrl} />
            <p className="mt-4 text-lg font-bold text-tarto-ink">{user.name}</p>
            <p className="mt-1 text-sm text-[#777]">{user.email}</p>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                user.role === "ADMIN"
                  ? "bg-[#FBEAEA] text-tarto-red"
                  : "bg-[#EBEBEB] text-[#555]"
              }`}
            >
              {user.role === "ADMIN" ? "Admin" : "Editor"}
            </span>
          </div>

          <dl className="mt-6 space-y-3 border-t border-[#F0F0F0] pt-6 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#777]">Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user.active
                      ? "bg-[#E8F5EC] text-[#2F6B45]"
                      : "bg-[#EBEBEB] text-[#777]"
                  }`}
                >
                  {user.active ? "Active" : "Disabled"}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#777]">Last login</dt>
              <dd className="text-right font-medium text-tarto-ink">
                {formatDate(user.lastLoginAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#777]">Member since</dt>
              <dd className="text-right font-medium text-tarto-ink">
                {formatDate(user.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#777]">Blog posts</dt>
              <dd className="font-medium text-tarto-ink">
                {user._count.blogPosts}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
          <h2 className="text-lg font-bold text-tarto-ink">Account settings</h2>
          <p className="mt-1 text-sm text-[#777]">
            Update your personal details. Role changes are managed by an admin.
          </p>
          <div className="mt-6">
            <ProfileForm
              key={`${user.name}-${user.email}`}
              user={{
                name: user.name,
                email: user.email,
                role: user.role,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
          <h2 className="text-lg font-bold text-tarto-ink">Profile photo</h2>
          <p className="mt-1 text-sm text-[#777]">
            Upload a photo for your admin account. It appears in the header and
            sidebar.
          </p>
          <div className="mt-6">
            <ProfilePhotoForm
              key={user.avatarUrl ?? "no-avatar"}
              name={user.name}
              avatarUrl={user.avatarUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
