"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cakes", label: "Cakes" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-tarto-red/10 bg-tarto-cream/95 backdrop-blur-sm">
      <div className="site-container flex items-center justify-between gap-4 py-3">
        <Logo variant="header" />

        <nav aria-label="Main" className="hidden items-center gap-5 whitespace-nowrap xl:flex">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-tarto-red after:absolute after:bottom-0.5 after:left-0 after:h-0.5 after:w-full after:bg-tarto-red"
                    : "text-tarto-ink hover:text-tarto-red"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden shrink-0 sm:block">
            <ButtonLink href="/contact" className="shadow-sm">
              Request a Quote
            </ButtonLink>
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            ref={menuButton}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-tarto-red/20 text-tarto-ink xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 fill-none stroke-current stroke-2"
              strokeLinecap="round"
              aria-hidden
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-tarto-red/10 bg-tarto-cream px-4 py-4 xl:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center rounded-md px-3 text-base font-medium ${
                    active
                      ? "bg-tarto-red/10 text-tarto-red"
                      : "text-tarto-ink hover:bg-tarto-yellow/30"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <ButtonLink
              href="/contact"
              onClick={() => setOpen(false)}
              fullWidth
              className="mt-3"
            >
              Request a Quote
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
