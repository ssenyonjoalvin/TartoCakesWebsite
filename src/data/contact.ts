export const contactInfo = {
  phones: ["0700796794", "0700796743"],
  email: "hello@tartocakes.ug",
  address: "Pelican House, Stella — Najjanankumbi",
  city: "Kampala, Uganda",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3989.7711997370056!2d32.56380467535441!3d0.2784626371698654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sNajjanankumbi%20pelican%20house!5e0!3m2!1sen!2sug!4v1786647842103!5m2!1sen!2sug",
};

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
