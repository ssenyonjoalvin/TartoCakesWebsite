import { ButtonLink } from "@/components/ui/Button";

export default function NotFoundMessage() {
  return (
    <section className="bg-tarto-cream py-20">
      <div className="site-container mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-tarto-amber">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-bold text-tarto-ink sm:text-4xl">
          This page isn&apos;t on the menu
        </h1>
        <p className="mt-4 text-tarto-ink/75">
          The link may be old, or the cake may no longer be available. Have a
          look at our current cakes or tell us what you have in mind.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/cakes" size="lg">
            View Our Cakes
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg">
            Request a Quote
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
