"use client";

import { useEffect } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { contactInfo, formatPhone, phoneHref } from "@/data/contact";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Shown when a public page throws (most often: the database is unreachable).
 * Header and footer still render because they live in the parent layout,
 * so customers can always call us even when the catalog is down.
 */
export default function SiteError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const phone = contactInfo.phones[0];

  return (
    <section className="bg-tarto-cream py-20">
      <div className="site-container mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-tarto-amber">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-bold text-tarto-ink sm:text-4xl">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-4 text-tarto-ink/75">
          Please try again in a moment. If you&apos;re planning an order, you
          can still reach us directly by phone.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="lg">
            Try again
          </Button>
          {phone ? (
            <a
              href={phoneHref(phone)}
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              Call {formatPhone(phone)}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
