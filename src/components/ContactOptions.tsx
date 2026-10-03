import WhatsAppIcon from "@/components/WhatsAppIcon";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { contactInfo, formatPhone, phoneHref } from "@/data/contact";
import { buildWhatsAppOrderMessage, whatsAppLink } from "@/lib/whatsapp";

type Props = {
  whatsappNumber: string;
  title?: string;
  text?: string;
};

/** "Still have questions?" block: WhatsApp (if configured), call, quote. */
export default function ContactOptions({
  whatsappNumber,
  title = "Still have questions?",
  text = "Talk to us. We're happy to help you plan your cake.",
}: Props) {
  const phone = contactInfo.phones[0];

  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-tarto-ink">{title}</h2>
      <p className="mt-2 text-tarto-ink/75">{text}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {whatsappNumber ? (
          <a
            href={whatsAppLink(whatsappNumber, buildWhatsAppOrderMessage({}))}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "whatsapp" })}
          >
            <WhatsAppIcon />
            WhatsApp us
          </a>
        ) : null}
        {phone ? (
          <a href={phoneHref(phone)} className={buttonClasses({ variant: "outline" })}>
            Call {formatPhone(phone)}
          </a>
        ) : null}
        <ButtonLink href="/contact">Request a Quote</ButtonLink>
      </div>
    </div>
  );
}
