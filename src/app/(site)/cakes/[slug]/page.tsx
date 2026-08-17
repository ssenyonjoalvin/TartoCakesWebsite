import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CakeCard from "@/components/CakeCard";
import CakeOrderOptions from "@/components/CakeOrderOptions";
import { formatPrice } from "@/data/cakes";
import {
  getPublishedCakeBySlug,
  getPublishedCakes,
  relatedCakes,
} from "@/lib/public-cakes";
import CakeImageGallery from "@/components/CakeImageGallery";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cake = await getPublishedCakeBySlug(slug);
  if (!cake) return { title: "Cake Not Found" };
  return {
    title: cake.name,
    description: cake.description,
  };
}

export default async function CakeDetailPage({ params }: Props) {
  const { slug } = await params;
  const cakes = await getPublishedCakes();
  const cake = cakes.find((item) => item.slug === slug);
  if (!cake) notFound();

  const related = relatedCakes(cakes, cake, 3);
  const occasionName = cake.occasionName;

  return (
    <>
      <section className="bg-tarto-cream py-8 lg:py-12">
        <div className="site-container grid items-start gap-8 lg:grid-cols-[480px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[520px_minmax(0,1fr)]">
          <CakeImageGallery
            name={cake.name}
            images={cake.images.length > 0 ? cake.images : [cake.image]}
          />

          <div>
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-tarto-red">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span className="text-tarto-ink/40">&gt;</span>
              <Link href="/cakes" className="hover:underline">
                Cakes
              </Link>
              <span className="text-tarto-ink/40">&gt;</span>
              <span className="font-medium text-tarto-ink">{cake.name}</span>
            </nav>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-tarto-ink sm:text-4xl">
              {cake.name}
            </h1>

            <p className="mt-3 text-2xl font-bold text-tarto-red">
              {formatPrice(cake.price)}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-tarto-ink/60">
              {occasionName ? <span>{occasionName}</span> : null}
            </div>

            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-tarto-ink/75">
              {cake.description}
            </p>

            <CakeOrderOptions cake={cake} />
          </div>
        </div>

        {related.length > 0 ? (
          <div className="site-container mt-16">
            <h2 className="text-2xl font-bold text-tarto-ink">You Might Also Like</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <CakeCard key={item.id} cake={item} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
