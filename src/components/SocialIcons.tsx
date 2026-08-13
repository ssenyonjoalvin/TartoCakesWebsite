import { socialLinks } from "@/data/contact";

type Props = {
  variant?: "light" | "dark";
};

const icons = {
  Facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6L16 12h-3V10c0-.6.4-1 1-1z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 2A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 16.5 5h-9zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm5.2-2.7a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M14.2 3h2.6c.2 1.5 1.1 2.8 2.4 3.6V9c-1.2-.05-2.3-.4-3.2-1v6.3A5.3 5.3 0 1 1 10 9.1v2.4a2.9 2.9 0 1 0 2.2 2.8V3z" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M4 4h4.2l4.1 5.8L16.8 4H20l-6.3 8.3L20.4 20h-4.2l-4.5-6.3L7.2 20H4l6.7-8.8L4 4z" />
    </svg>
  ),
};

export default function SocialIcons({ variant = "light" }: Props) {
  const styles =
    variant === "dark"
      ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
      : "border-tarto-ink/10 bg-tarto-cream text-tarto-ink hover:bg-tarto-yellow/40";

  return (
    <div className="flex flex-wrap gap-2">
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.href}
          aria-label={social.name}
          target={social.href !== "#" ? "_blank" : undefined}
          rel={social.href !== "#" ? "noopener noreferrer" : undefined}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${styles}`}
        >
          {icons[social.name]}
        </a>
      ))}
    </div>
  );
}
