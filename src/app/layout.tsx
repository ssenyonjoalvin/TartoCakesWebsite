import type { Metadata } from "next";
import { Pacifico, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const brandScript = Pacifico({
  variable: "--font-brand-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Tarto Cakes UG | Great Taste in Every Bite",
    template: "%s | Tarto Cakes UG",
  },
  description:
    "Custom cakes for birthdays, weddings, and celebrations across Uganda. Fresh ingredients, handmade with love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${brandScript.variable} h-full antialiased`}
    >
      <body className="flex min-h-full w-full flex-col bg-tarto-cream font-sans text-tarto-ink">
        <Header />
        <main className="w-full flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
