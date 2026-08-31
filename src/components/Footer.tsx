import Link from "next/link";
import Logo from "@/components/Logo";
import CtaBanner from "@/components/CtaBanner";
import SocialIcons from "@/components/SocialIcons";
import { contactInfo, formatPhone, phoneHref } from "@/data/contact";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/cakes", label: "Cakes" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <>
      <CtaBanner />

      <footer className="bg-tarto-red text-white">
        <div className="site-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="footer" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/85">
              Freshly baked cakes for birthdays, weddings, and every sweet moment
              in between. Great taste in every bite.
            </p>
            <div className="mt-5">
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-tarto-yellow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              {contactInfo.phones.map((phone) => (
                <li key={phone}>
                  <a href={phoneHref(phone)} className="hover:text-tarto-yellow">
                    {formatPhone(phone)}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${contactInfo.email}`} className="hover:text-tarto-yellow">
                  {contactInfo.email}
                </a>
              </li>
              <li>
                {contactInfo.address}
                <br />
                {contactInfo.city}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="mt-3 text-sm text-white/85">
              Get cake ideas, offers, and seasonal specials in your inbox.
            </p>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                placeholder="Your email"
                className="w-full rounded-md border-0 bg-white px-3 py-2.5 text-sm text-tarto-ink placeholder:text-tarto-ink/50 outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-tarto-yellow px-4 py-2.5 text-sm font-semibold text-tarto-ink transition hover:bg-tarto-orange"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/15">
          <div className="site-container py-4 text-center text-xs text-white/70">
            ©{" "}
            <Link
              href="/admin/login"
              className="cursor-default text-inherit no-underline"
              aria-label="Staff sign in"
            >
              {new Date().getFullYear()}
            </Link>{" "}
            Tarto Cakes UG. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
