"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { AdminRole } from "@/generated/prisma/client";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
  icon: ReactNode;
};

const iconClass = "h-[18px] w-[18px] shrink-0";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M19.5 19a4.5 4.5 0 0 0-3-4.2" />
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="M12 12 4 7M12 12l8-5M12 12v10" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 7h13l-1.5 8H8.5L7 7Z" />
      <path d="M7 7 6 4H3" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="m21 16-5-5-7 7" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
};

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: icons.dashboard },
  { href: "/admin/users", label: "User Management", adminOnly: true, icon: icons.users },
  { href: "/admin/blog", label: "Blog Management", icon: icons.blog },
  { href: "/admin/products", label: "Product Management", icon: icons.products },
  { href: "/admin/orders", label: "Orders / Inquiries", icon: icons.orders },
  { href: "/admin/media", label: "Media Management", icon: icons.media },
  { href: "/admin/customers", label: "Customer Management", icon: icons.customers },
];

const settingsChildren = [
  { href: "/admin/profile", label: "My Profile" },
  { href: "/admin/settings/flavors", label: "Cake Flavors" },
  { href: "/admin/settings/sizes", label: "Cake Sizes" },
  { href: "/admin/settings/occasions", label: "Occasions" },
];

function navClass(active: boolean) {
  return `relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
    active
      ? "bg-[#FBEAEA] text-tarto-red"
      : "text-[#555] hover:bg-[#F7F7F7] hover:text-tarto-ink"
  }`;
}

export default function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const items = nav.filter((item) => !item.adminOnly || role === "ADMIN");
  const settingsActive =
    pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/profile");
  const [settingsOpen, setSettingsOpen] = useState(settingsActive);

  useEffect(() => {
    if (settingsActive) setSettingsOpen(true);
  }, [settingsActive]);

  return (
    <nav className="flex flex-1 flex-col px-3 py-4">
      <div className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navClass(active)}
            >
              {item.icon}
              <span>{item.label}</span>
              {active ? (
                <span className="absolute inset-y-1.5 right-0 w-[3px] rounded-l-full bg-tarto-red" />
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 border-t border-[#EAEAEA] pt-4">
        <div>
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            className={`${navClass(settingsActive && pathname === "/admin/settings")} w-full`}
            aria-expanded={settingsOpen}
          >
            {icons.settings}
            <span className="flex-1 text-left">Settings</span>
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 shrink-0 transition ${settingsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {settingsOpen ? (
            <div className="mt-1 ml-2 space-y-1 border-l border-[#E8E8E8] pl-3">
              {settingsChildren.map((child) => {
                const active = pathname.startsWith(child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`relative block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-[#FBEAEA] text-tarto-red"
                        : "text-[#666] hover:bg-[#F7F7F7] hover:text-tarto-ink"
                    }`}
                  >
                    {child.label}
                    {active ? (
                      <span className="absolute inset-y-1.5 right-0 w-[3px] rounded-l-full bg-tarto-red" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <Link
          href="/contact"
          className="flex items-center justify-center rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-tarto-red/90"
        >
          Request a Quote
        </Link>
      </div>
    </nav>
  );
}
