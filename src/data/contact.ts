const mapCoordinates = {
  lat: 0.2784371717134128,
  lng: 32.56604877461288,
};

const mapLandmark = "Housing Finance Bank | Najjanankumbi Branch";

export const contactInfo = {
  businessName: "Tarto Cakes UG",
  phones: ["0700796794", "0700796743"],
  email: "hello@tartocakes.ug",
  address: "Pelican House, Stella — Najjanankumbi",
  city: "Kampala, Uganda",
  mapLandmark,
  mapCoordinates,
  mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(mapLandmark)}@${mapCoordinates.lat},${mapCoordinates.lng}&hl=en&z=17&output=embed`,
  mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLandmark)}`,
};

export function getCopyableAddress() {
  return `${contactInfo.mapLandmark}, ${contactInfo.address}, ${contactInfo.city}`;
}

export function getCopyableCoordinates() {
  const { lat, lng } = contactInfo.mapCoordinates;
  return `${lat}, ${lng}`;
}

export const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/TartoCakesUG" },
  { name: "Instagram", href: "https://www.instagram.com/tartocakes_ug" },
  { name: "TikTok", href: "https://www.tiktok.com/@tarto.cakesug" },
  { name: "X", href: "https://x.com/tartocakesUg" },
] as const;

export function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0")
    ? `+256${digits.slice(1)}`
    : `+${digits}`;
  return `tel:${international}`;
}

export function formatPhone(phone: string) {
  if (phone.length === 10) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  }
  return phone;
}
