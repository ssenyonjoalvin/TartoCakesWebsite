import CakeCard from "@/components/CakeCard";
import HomeHero from "@/components/HomeHero";
import FaqList from "@/components/FaqList";
import HowItWorks from "@/components/HowItWorks";
import OccasionGrid from "@/components/OccasionGrid";
import ReviewHighlights from "@/components/ReviewHighlights";
import { ButtonLink } from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { getOccasionShowcase, getPublishedCakes } from "@/lib/public-cakes";
import { getApprovedReviews } from "@/lib/reviews";
import { getSiteSettings, publicFaq } from "@/lib/site-settings";

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

export default async function HomePage() {
  const [published, occasions, reviews, settings] = await Promise.all([
    getPublishedCakes(),
    getOccasionShowcase(),
    getApprovedReviews(3),
    getSiteSettings(),
  ]);
  const faqPreview = publicFaq(settings).slice(0, 4);
  const featured = published.filter((cake) => cake.featured);
  const bestsellers = (featured.length > 0 ? featured : published).slice(0, 4);

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

      {occasions.length > 0 ? (
        <section className="bg-white py-14 sm:py-16">
          <div className="site-container">
            <SectionHeading
              eyebrow="Shop by occasion"
              title="What are you celebrating?"
            />
            <div className="mt-10">
              <OccasionGrid occasions={occasions} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-tarto-cream py-14 sm:py-16">
        <div className="site-container">
          <SectionHeading
            eyebrow="Customer favourites"
            title="Our Bestsellers"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((cake) => (
              <CakeCard key={cake.id} cake={cake} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/cakes" variant="outline" size="lg">
              View All Cakes
            </ButtonLink>
          </div>
        </div>
      </section>

      <HowItWorks />

      {reviews.length > 0 ? <ReviewHighlights reviews={reviews} /> : null}

      {faqPreview.length > 0 ? (
        <section className="bg-white py-14 sm:py-16">
          <div className="site-container mx-auto max-w-3xl">
            <SectionHeading eyebrow="Questions" title="Good to know" />
            <div className="mt-10">
              <FaqList items={faqPreview} />
            </div>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/faq" variant="outline">
                See all questions
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
