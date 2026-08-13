import Link from "next/link";

type Props = {
  title?: string;
  buttonLabel?: string;
  href?: string;
};

export default function CtaBanner({
  title = "Ready to make your celebration unforgettable? Let us bake your next happy moment.",
  buttonLabel = "Request a Quote",
  href = "/contact",
}: Props) {
  return (
    <section className="bg-tarto-red">
      <div className="site-container flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
        <div className="flex items-start gap-4 md:items-center">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white sm:inline-flex">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
              <path d="M12 2c.8 0 1.5.7 1.5 1.5S12.8 5 12 5s-1.5-.7-1.5-1.5S11.2 2 12 2zm-5 5h10a2 2 0 0 1 2 2v1H5V9a2 2 0 0 1 2-2zm-2 5h14l-1.2 8.2A2 2 0 0 1 15.8 22H8.2a2 2 0 0 1-2-1.8L5 12z" />
            </svg>
          </span>
          <p className="max-w-2xl text-xl font-semibold leading-snug text-white md:text-2xl">
            {title}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-full bg-tarto-orange px-6 py-3 text-sm font-bold text-white transition hover:bg-tarto-yellow hover:text-tarto-ink"
        >
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
