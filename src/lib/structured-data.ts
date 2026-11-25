import { contactInfo, socialLinks } from "@/data/contact";
import type { PublicCake } from "@/lib/public-cakes";
import { absoluteUrl } from "@/lib/site-url";

/**
 * schema.org builders. Only facts the site already shows go in here
 * (name, address, phones, coordinates, socials, listed prices, real review
 * counts), never anything that isn't on the page.
 */

function internationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `+256${digits.slice(1)}` : `+${digits}`;
}

export function bakeryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": absoluteUrl("/#bakery"),
    name: contactInfo.businessName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/logo.png"),
    image: absoluteUrl("/images/chocolate-layered-cake.jpg"),
    telephone: contactInfo.phones.map(internationalPhone),
    email: contactInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address,
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contactInfo.mapCoordinates.lat,
      longitude: contactInfo.mapCoordinates.lng,
    },
    sameAs: socialLinks.map((link) => link.href),
    servesCuisine: "Cakes",
    currenciesAccepted: "UGX",
  };
}

export function cakeJsonLd(cake: PublicCake) {
  const images = (cake.images.length > 0 ? cake.images : [cake.image])
    .filter(Boolean)
    .map(absoluteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cake.name,
    description: cake.description,
    image: images,
    url: absoluteUrl(`/cakes/${cake.slug}`),
    category: cake.occasionName ?? "Cakes",
    brand: { "@type": "Brand", name: contactInfo.businessName },
    offers: {
      "@type": "Offer",
      priceCurrency: "UGX",
      price: cake.price,
      availability: "https://schema.org/MadeToOrder",
      url: absoluteUrl(`/cakes/${cake.slug}`),
      seller: { "@id": absoluteUrl("/#bakery") },
    },
    // Only real, approved reviews, and only when there are some.
    ...(cake.reviewSummary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(cake.reviewSummary.average.toFixed(1)),
            reviewCount: cake.reviewSummary.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}
