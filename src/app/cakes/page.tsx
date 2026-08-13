import type { Metadata } from "next";
import CakeGallery from "@/components/CakeGallery";

export const metadata: Metadata = {
  title: "Our Cakes",
  description:
    "Browse birthday, wedding, princess, and custom cakes from Tarto Cakes UG.",
};

export default function CakesPage() {
  return (
    <>
      <section className="bg-tarto-cream py-14">
        <div className="site-container">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-[0.18em] text-tarto-orange">
              CAKE GALLERY
            </p>
            <h1 className="mt-3 text-4xl font-bold text-tarto-ink sm:text-5xl">
              Our Cakes
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-tarto-ink/70">
              Explore our collection and filter by celebration type. Every cake
              can be customised for your occasion.
            </p>
          </div>
          <div className="mt-10">
            <CakeGallery />
          </div>
        </div>
      </section>
    </>
  );
}
