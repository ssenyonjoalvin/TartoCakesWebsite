import type { FaqItem } from "@/lib/business-fields";

type Props = {
  items: FaqItem[];
};

/**
 * Native <details>/<summary> accordion: keyboard and screen-reader support
 * built in, works without JavaScript, and answers stay in the HTML for SEO.
 */
export default function FaqList({ items }: Props) {
  return (
    <div className="divide-y divide-tarto-ink/10 overflow-hidden rounded-2xl bg-white shadow-sm">
      {items.map((item) => (
        <details key={item.id} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-tarto-ink hover:bg-tarto-cream/60 [&::-webkit-details-marker]:hidden">
            {item.question}
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 fill-none stroke-tarto-red stroke-2 transition group-open:rotate-45"
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </summary>
          <p className="whitespace-pre-line px-5 pb-5 text-[0.95rem] leading-relaxed text-tarto-ink/80">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
