import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const modules = [
  { href: "/admin/users", title: "User Management", body: "See who signed in and who posted each blog.", adminOnly: true },
  { href: "/admin/blog", title: "Blog Management", body: "Create and edit bakery stories." },
  { href: "/admin/products", title: "Product Management", body: "Add, update, and organise cakes." },
  { href: "/admin/orders", title: "Orders / Inquiries", body: "Track quote requests from the site." },
  { href: "/admin/media", title: "Media Management", body: "Upload and organise cake photos." },
  { href: "/admin/customers", title: "Customer Management", body: "Keep customer details in one place." },
  { href: "/admin/settings", title: "Settings", body: "Contact info, socials, and site options." },
];

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const visible = modules.filter(
    (item) => !item.adminOnly || session?.role === "ADMIN"
  );

  return (
    <div>
      <p className="text-sm font-semibold tracking-[0.14em] text-tarto-orange">
        TARTO CAKES UG
      </p>
      <h1 className="mt-2 text-3xl font-bold text-tarto-ink">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm text-tarto-ink/70">
        Welcome{session ? `, ${session.name}` : ""}. Manage bakery content and
        team access from here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-bold text-tarto-ink">{item.title}</h2>
            <p className="mt-2 text-sm text-tarto-ink/65">{item.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
