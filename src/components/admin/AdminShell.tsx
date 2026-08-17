"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import AdminNav from "@/components/admin/AdminNav";
import ProfileAvatar from "@/components/admin/ProfileAvatar";
import type { AdminRole } from "@/generated/prisma/client";

type Props = {
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl: string | null;
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
  return "Search...";
}

export default function AdminShell({
  name,
  email,
  role,
  avatarUrl,
  children,
}: Props) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F4F4F5] text-tarto-ink">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[#E8E8E8] bg-[#FAFAFA] lg:flex">
        <div className="px-5 py-6">
          <Link href="/admin" className="block">
            <p className="font-brand text-[1.65rem] leading-none text-tarto-red">
              Tarto Cakes
            </p>
            <p className="mt-1 text-xs text-[#888]">Tarto Confectionery</p>
          </Link>
        </div>
        <AdminNav role={role} />
        <form action={logoutAdmin} className="mt-auto border-t border-[#EAEAEA] px-4 py-4">
          <button
            type="submit"
            className="text-sm font-semibold text-tarto-red hover:underline"
          >
            Sign out
          </button>
        </form>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[#F4F4F5]">
        <header className="sticky top-0 z-20 border-b border-[#E8E8E8] bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#999]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                type="search"
                placeholder={searchPlaceholder(pathname)}
                className="w-full max-w-xl rounded-full border border-[#E6E6E6] bg-[#F7F7F7] py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#A0A0A0] focus:border-tarto-red/30 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-full p-2 text-[#666] transition hover:bg-[#F3F3F3] hover:text-tarto-ink"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9Z" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Help"
                className="rounded-full p-2 text-[#666] transition hover:bg-[#F3F3F3] hover:text-tarto-ink"
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

          <div className="flex items-center justify-between border-t border-[#F0F0F0] px-4 py-2 lg:hidden">
            <p className="font-brand text-lg text-tarto-red">Tarto Cakes</p>
            <form action={logoutAdmin}>
              <button type="submit" className="text-sm font-semibold text-tarto-red">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E8E8] bg-white px-4 py-4 text-xs text-[#888] sm:px-6 lg:px-8">
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
