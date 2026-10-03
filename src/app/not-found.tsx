import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NotFoundMessage from "@/components/NotFoundMessage";

export const metadata: Metadata = {
  title: "Page Not Found",
};

// Handles URLs that match no route at all. These sit outside the (site)
// route group, so they don't get its layout; add header/footer here.
export default function RootNotFound() {
  return (
    <div className="flex min-h-full w-full flex-col">
      <Header />
      <main id="main" className="w-full flex-1">
        <NotFoundMessage />
      </main>
      <Footer />
    </div>
  );
}
