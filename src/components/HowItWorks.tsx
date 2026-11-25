import { ButtonLink } from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

// Describes the ordering process only. No promises about timings or fees,
// which belong to the owner-managed delivery/FAQ settings.
const STEPS = [
  { title: "Choose your cake", text: "Browse our gallery, or start from scratch with your own idea." },
  { title: "Make it yours", text: "Pick the size and flavour, describe the design and add a message." },
  { title: "Send your request", text: "Order online in a few minutes, or message us on WhatsApp." },
  { title: "We confirm and bake", text: "We confirm the price and details with you before we start baking." },
  { title: "Enjoy your cake", text: "Pick it up or have it delivered, ready for your celebration." },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="site-container">
        <SectionHeading eyebrow="How it works" title="Ordering is easy" />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl bg-tarto-cream p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tarto-red text-base font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-bold text-tarto-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-tarto-ink/75">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/cakes" size="lg">
            View Our Cakes
          </ButtonLink>
          <ButtonLink href="/design-your-cake" variant="outline" size="lg">
            Design Your Cake
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
