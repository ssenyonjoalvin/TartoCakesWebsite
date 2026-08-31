"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLogoutButton, {
  AdminSessionGuard,
} from "@/components/admin/AdminSessionGuard";
import AdminNav from "@/components/admin/AdminNav";
import AdminNotifications from "@/components/admin/AdminNotifications";
import ProfileAvatar from "@/components/admin/ProfileAvatar";
import { AdminSearchProvider, useAdminSearch } from "@/components/admin/AdminSearch";
import type { AdminRole } from "@/generated/prisma/client";
import type { AdminNotificationSummary } from "@/lib/admin-notifications";

type Props = {
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl: string | null;
  notifications: AdminNotificationSummary;
  children: React.ReactNode;
};

function searchPlaceholder(pathname: string) {
  if (pathname.startsWith("/admin/profile")) return "Search profile...";
  if (pathname.startsWith("/admin/settings")) return "Search settings...";
  if (pathname.startsWith("/admin/customers")) return "Search customers...";
  if (pathname.startsWith("/admin/users")) return "Search users...";
  if (pathname.startsWith("/admin/orders")) return "Search orders...";
  if (pathname.startsWith("/admin/blog")) return "Search posts...";
  if (pathname.startsWith("/admin/products")) return "Search products...";
  if (pathname.startsWith("/admin/media")) return "Search media...";
  if (pathname.startsWith("/admin/reviews")) return "Search reviews...";
  return "Search...";
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="block">
      <p className="font-brand text-[1.65rem] leading-none text-tarto-red">
        Tarto Cakes
      </p>
      <p className="mt-1 text-xs text-[#888]">Tarto Confectionery</p>
    </Link>
  );
}

function SidebarContent({
  role,
  notifications,
  onNavigate,
}: {
  role: AdminRole;
  notifications: AdminNotificationSummary;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-5 py-6">
        <SidebarBrand />
      </div>
      <AdminNav
        role={role}
        newInquiries={notifications.newInquiries}
        pendingReviews={notifications.pendingReviews}
        onNavigate={onNavigate}
      />
      <div className="mt-auto border-t border-[#EAEAEA] px-4 py-4">
        <AdminLogoutButton />
      </div>
    </>
  );
}

export default function AdminShell(props: Props) {
  return (
    <AdminSearchProvider>
      <AdminShellLayout {...props} />
    </AdminSearchProvider>
  );
}

function AdminShellLayout({
  name,
  email,
  role,
  avatarUrl,
  notifications,
  children,
}: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { query, setQuery } = useAdminSearch();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#F4F4F5] text-tarto-ink">
      <AdminSessionGuard />
      <aside className="hidden h-full w-[260px] shrink-0 flex-col overflow-y-auto border-r border-[#E8E8E8] bg-[#FAFAFA] lg:flex">
        <SidebarContent role={role} notifications={notifications} />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(280px,88vw)] flex-col overflow-y-auto bg-[#FAFAFA] shadow-2xl">
            <SidebarContent
              role={role}
              notifications={notifications}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#F4F4F5]">
        <header className="sticky top-0 z-20 border-b border-[#E8E8E8] bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 lg:px-8">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E6E6E6] text-tarto-ink transition hover:bg-[#F7F7F7] lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <Link href="/admin" className="shrink-0 lg:hidden">
              <p className="font-brand text-xl leading-none text-tarto-red">
                Tarto
              </p>
            </Link>

            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#999]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder(pathname)}
                className="w-full max-w-xl rounded-full border border-[#E6E6E6] bg-[#F7F7F7] py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#A0A0A0] focus:border-tarto-red/30 focus:bg-white"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <AdminNotifications summary={notifications} />
              <button
                type="button"
                aria-label="Help"
                className="hidden rounded-full p-2 text-[#666] transition hover:bg-[#F3F3F3] hover:text-tarto-ink sm:inline-flex"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8" />
                  <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </button>
              <Link
                href="/admin/profile"
                className="ml-1 block transition hover:opacity-90"
                title={`${name} — View profile`}
              >
                <ProfileAvatar name={name} avatarUrl={avatarUrl} size="sm" />
              </Link>
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</div>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E8E8] bg-white px-3 py-4 text-xs text-[#888] sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Tarto Cakes UG Admin</p>
          <div className="flex flex-wrap gap-4">
            <span>Privacy Policy</span>
            <span>Support</span>
            <span>Terms of Service</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
