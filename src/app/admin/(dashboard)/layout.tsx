import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getAdminNotifications } from "@/lib/admin-notifications";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const notifications = await getAdminNotifications();

  return (
    <AdminShell
      name={session.name}
      email={session.email}
      role={session.role}
      avatarUrl={session.avatarUrl}
      notifications={notifications}
    >
      {children}
    </AdminShell>
  );
}
