"use client";

import { usePathname } from "next/navigation";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { buildWhatsAppOrderMessage, whatsAppLink } from "@/lib/whatsapp";

type Props = {
  number: string;
};

// Pages with their own WhatsApp action and bottom controls; a floating
// button there would duplicate it and cover the step navigation.
const HIDDEN_ON = ["/design-your-cake", "/quote/thank-you"];

export default function WhatsAppFloat({ number }: Props) {
  const pathname = usePathname();
  if (!number || HIDDEN_ON.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <a
      href={whatsAppLink(number, buildWhatsAppOrderMessage({}))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Tarto Cakes on WhatsApp"
      className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#187540] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
