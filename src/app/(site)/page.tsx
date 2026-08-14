import CakeCard from "@/components/CakeCard";
import HomeHero from "@/components/HomeHero";
import { cakes } from "@/data/cakes";

const features = [
  {
    title: "Fresh Ingredients",
    description: "Only the finest ingredients, baked fresh for every order.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
        <path
          d="M12 14h16l1.5 4H10.5L12 14z"
          fill="#fff"
          stroke="#d62828"
          strokeWidth="1.5"
        />
        <path
          d="M11 18h18l-1.2 12.5A3 3 0 0 1 24.8 33H15.2a3 3 0 0 1-3-2.5L11 18z"
          fill="#fff"
          stroke="#d62828"
          strokeWidth="1.5"
        />
        <path d="M20 8v4" stroke="#d62828" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="7" r="1.6" fill="#f6b21a" />
        <path d="M16 18h8" stroke="#d62828" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    title: "Custom Made",
    description: "Your vision, our craft — cakes made just for you.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
        <path
          d="M10 18c0-5 4.5-9 10-9s10 4 10 9v2H10v-2z"
          fill="#fff"
          stroke="#d62828"
          strokeWidth="1.6"
        />
        <path
          d="M12 20h16v8a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-8z"
          fill="#fff"
          stroke="#d62828"
          strokeWidth="1.6"
        />
        <path d="M14 16h12" stroke="#d62828" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    title: "On Time Delivery",
    description: "Reliable delivery, right on schedule for your event.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
        <circle cx="20" cy="20" r="12" fill="#fff" stroke="#d62828" strokeWidth="1.7" />
        <path
          d="M20 12v9l6 3.5"
          fill="none"
          stroke="#d62828"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="20" r="1.5" fill="#f6b21a" />
      </svg>
    ),
  },
  {
    title: "100% Satisfaction",
    description: "Every cake crafted with care to delight your guests.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
        <path
          d="M14 18v10H11a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h3zm0 0V13a3.5 3.5 0 0 1 7 0v5m8 0h-4.2A2.8 2.8 0 0 0 22 20.8V27a3 3 0 0 0 3 3h2.2a3 3 0 0 0 2.9-2.2l1.7-6A3 3 0 0 0 29 18h-3z"
          fill="#fff"
          stroke="#d62828"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const bestsellerSlugs = [
  "red-velvet",
  "chocolate-cake",
  "purple-butter-cream",
  "princess-pink-cake",
];

export default function HomePage() {
  const bestsellers = bestsellerSlugs
    .map((slug) => cakes.find((cake) => cake.slug === slug))
    .filter(Boolean);

  return (
    <>
      <HomeHero />

      <section className="bg-tarto-yellow">
        <div className="site-container grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3.5 text-left text-tarto-ink"
            >
              <div className="shrink-0">{feature.icon}</div>
              <div className="min-w-0">
                <p className="text-[0.95rem] font-bold leading-tight tracking-tight">
                  {feature.title}
                </p>
                <p className="mt-1 max-w-[15rem] text-[0.78rem] leading-relaxed text-tarto-ink/75">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-tarto-cream py-14 sm:py-16">
        <div className="site-container">
          <h2 className="text-center text-3xl font-bold tracking-wide text-tarto-red sm:text-4xl">
            OUR BESTSELLERS
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((cake) =>
              cake ? <CakeCard key={cake.id} cake={cake} /> : null
            )}
          </div>
        </div>
      </section>
    </>
  );
}
