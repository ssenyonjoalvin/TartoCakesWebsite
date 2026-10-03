/**
 * WhatsApp helpers. Pure functions (no DB, no React) so they work in server
 * and client components alike.
 */

const UGANDA_CODE = "256";

/**
 * Turns what an admin types ("0700 796 794", "+256 700 796794",
 * "256700796794") into wa.me format: digits only with country code.
 * Returns null when it can't be a valid international number.
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);
  // Local Ugandan format: 07XX XXX XXX → 2567XX XXX XXX
  if (digits.startsWith("0") && digits.length === 10) {
    digits = UGANDA_CODE + digits.slice(1);
  }
  // E.164 allows up to 15 digits; anything under 10 can't include a country code.
  if (digits.length < 10 || digits.length > 15 || digits.startsWith("0")) {
    return null;
  }
  return digits;
}

/** "256700796794" → "+256 700 796 794" for display. */
export function formatWhatsAppNumber(digits: string) {
  if (digits.startsWith(UGANDA_CODE) && digits.length === 12) {
    const local = digits.slice(3);
    return `+256 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return `+${digits}`;
}

export function whatsAppLink(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type WhatsAppOrderDetails = {
  reference?: string;
  customerName?: string;
  cake?: string;
  occasion?: string;
  size?: string;
  flavor?: string;
  design?: string;
  inscription?: string;
  date?: string;
  deliveryMethod?: "pickup" | "delivery" | "";
  deliveryLocation?: string;
  /** Already formatted, e.g. "UGX 120,000". Labelled as an estimate in the message. */
  listedPrice?: string;
  hasPhotos?: boolean;
};

function line(label: string, value?: string) {
  const text = value?.trim();
  return text ? `• ${label}: ${text}` : null;
}

/** Structured, human-readable order message. Empty fields are left out. */
export function buildWhatsAppOrderMessage(details: WhatsAppOrderDetails) {
  const delivery =
    details.deliveryMethod === "pickup"
      ? line("Pickup", "I'll collect the cake")
      : details.deliveryMethod === "delivery"
        ? line("Deliver to", details.deliveryLocation || "location to confirm")
        : null;

  const lines = [
    details.reference
      ? `Hello Tarto Cakes, I just sent quote request ${details.reference} on your website.`
      : "Hello Tarto Cakes, I would like to order a cake.",
    "",
    line("Name", details.customerName),
    line("Cake", details.cake),
    line("Occasion", details.occasion),
    line("Size", details.size),
    line("Flavour", details.flavor),
    line("Design", details.design),
    line("Words on cake", details.inscription),
    line("Date needed", details.date),
    delivery,
    line("Listed price (to be confirmed)", details.listedPrice),
    details.hasPhotos ? "• I have reference photos to share." : null,
    "",
    "Please confirm the price and availability. Thank you!",
  ];

  return lines
    .filter((value): value is string => value !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Short customer-facing reference that matches the admin order list (#INQ-XXXX). */
export function quoteReference(orderId: string) {
  return `INQ-${orderId.replace(/\W/g, "").slice(-4).toUpperCase()}`;
}
