import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const modules = [
  {
    href: "/admin/users",
    title: "User Management",
    body: "See who signed in and who posted each blog.",
    adminOnly: true,
  },
  {
    href: "/admin/blog",
    title: "Blog Management",
    body: "Create and edit bakery stories.",
  },
  {
    href: "/admin/products",
    title: "Product Management",
    body: "Add, update, and organise cakes.",
  },
  {
    href: "/admin/orders",
    title: "Orders / Inquiries",
    body: "Track quote requests from the site.",
  },
  {
    href: "/admin/media",
    title: "Media Management",
    body: "Upload and organise cake photos.",
  },
  {
    href: "/admin/customers",
    title: "Customer Management",
    body: "Quotes, subscribers, and client history.",
  },
  {
    href: "/admin/settings",
    title: "Settings",
    body: "Flavors, sizes, occasions, and site options.",
  },
];

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const visible = modules.filter(
    (item) => !item.adminOnly || session?.role === "ADMIN"
  );

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description={`Welcome${session ? `, ${session.name}` : ""}. Manage bakery content, customers, and team access from here.`}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
          >
            <h2 className="font-bold text-[#2B2B2B]">{item.title}</h2>
            <p className="mt-2 text-sm text-[#777]">{item.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
