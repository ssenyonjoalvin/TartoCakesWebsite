"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cakes", label: "Cakes" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-tarto-red/10 bg-tarto-cream/95 backdrop-blur-sm">
      <div className="site-container flex items-center justify-between gap-4 py-3">
        <Logo variant="header" />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors ${
                  active
                    ? "text-tarto-red after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-tarto-red"
                    : "text-tarto-ink hover:text-tarto-red"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden rounded-full bg-tarto-red px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tarto-red/90 sm:inline-flex"
          >
            Request a Quote
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-tarto-red/20 text-tarto-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-tarto-red/10 bg-tarto-cream px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-2 py-2 text-sm font-medium ${
                    active
                      ? "text-tarto-red underline underline-offset-4"
                      : "text-tarto-ink hover:bg-tarto-yellow/30"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md bg-tarto-red px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Request a Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
