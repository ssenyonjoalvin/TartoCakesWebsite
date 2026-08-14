"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/generated/prisma/client";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "User Management", adminOnly: true },
  { href: "/admin/blog", label: "Blog Management" },
  { href: "/admin/products", label: "Product Management" },
  { href: "/admin/orders", label: "Orders / Inquiries" },
  { href: "/admin/media", label: "Media Management" },
  { href: "/admin/customers", label: "Customer Management" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const items = nav.filter((item) => !item.adminOnly || role === "ADMIN");

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active
                ? "bg-tarto-cream text-tarto-red"
                : "text-tarto-ink hover:bg-tarto-cream hover:text-tarto-red"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
