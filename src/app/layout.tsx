import type { Metadata } from "next";
import { connection } from "next/server";
import { Pacifico, Poppins } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";

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

const description =
  "Custom cakes for birthdays, weddings, and celebrations in Kampala, Uganda. Choose a design or create your own, and we confirm the price before baking.";

export const metadata: Metadata = {
  // Makes relative URLs (canonical, Open Graph images) absolute.
  metadataBase: new URL(siteUrl()),
  applicationName: "Tarto Cakes UG",
  title: {
    default: "Tarto Cakes UG | Great Taste in Every Bite",
    template: "%s | Tarto Cakes UG",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Tarto Cakes UG",
    locale: "en_UG",
    description,
    images: [
      {
        url: "/images/chocolate-layered-cake.jpg",
        alt: "Chocolate layer cake by Tarto Cakes UG",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tartocakesUg",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Shared page content (including the 404 footer) reads database settings.
  // Render on request so deployments do not require a database connection.
  await connection();

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${brandScript.variable} h-full antialiased`}
    >
      <body className="min-h-full w-full bg-tarto-cream font-sans text-tarto-ink">
        {children}
      </body>
    </html>
  );
}
