/**
 * Shapes and admin form metadata for owner-supplied business facts.
 * No server imports here: the admin form (a client component) uses it too.
 */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  published: boolean;
};

export type BusinessInfo = {
  openingHours: string;
  deliveryAreas: string;
  deliveryFees: string;
  orderNotice: string;
  sameDayOrders: string;
  pickupInfo: string;
  paymentMethods: string;
  quoteResponseTime: string;
};

export const BUSINESS_FIELDS: {
  key: keyof BusinessInfo;
  label: string;
  help: string;
  placeholder: string;
  group: "business" | "delivery" | "ordering";
}[] = [
  {
    key: "openingHours",
    label: "Opening hours",
    help: "Shown on the contact and delivery pages.",
    placeholder: "e.g. Monday–Saturday: 8am–7pm\nSunday: closed",
    group: "business",
  },
  {
    key: "paymentMethods",
    label: "Payment methods",
    help: "How customers can pay, and whether a deposit is needed.",
    placeholder: "e.g. MTN Mobile Money, Airtel Money, cash on pickup",
    group: "business",
  },
  {
    key: "orderNotice",
    label: "How early should customers order?",
    help: "Minimum notice for standard and custom cakes.",
    placeholder: "e.g. Standard cakes: 2 days\nWedding and tiered cakes: 2 weeks",
    group: "ordering",
  },
  {
    key: "sameDayOrders",
    label: "Same-day orders",
    help: "Leave empty if you don't take same-day orders.",
    placeholder: "e.g. Possible for simple designs. Call before 10am.",
    group: "ordering",
  },
  {
    key: "quoteResponseTime",
    label: "Quote response time",
    help: "Shown to customers right after they send a request.",
    placeholder: "e.g. within a few hours during opening times",
    group: "ordering",
  },
  {
    key: "deliveryAreas",
    label: "Delivery areas",
    help: "Where you deliver.",
    placeholder: "e.g. All of Kampala and Entebbe. Further areas on request.",
    group: "delivery",
  },
  {
    key: "deliveryFees",
    label: "Delivery fees",
    help: "How delivery is priced.",
    placeholder: "e.g. From UGX 10,000 within Kampala, depending on distance.",
    group: "delivery",
  },
  {
    key: "pickupInfo",
    label: "Pickup",
    help: "Where and when customers can collect cakes.",
    placeholder: "e.g. Collect from our shop at Pelican House, Najjanankumbi.",
    group: "delivery",
  },
];
