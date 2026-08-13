import Link from "next/link";

type Props = {
  className?: string;
  variant?: "header" | "footer";
};

export default function Logo({ className = "", variant = "header" }: Props) {
  const isHeader = variant === "header";

  return (
    <Link
      href="/"
      className={`inline-flex items-baseline gap-1.5 transition hover:opacity-90 ${className}`}
      aria-label="Tarto Cakes UG — Home"
    >
      <span
        className={`font-brand leading-none ${
          isHeader
            ? "text-3xl text-tarto-orange sm:text-4xl lg:text-[2.75rem]"
            : "text-3xl text-tarto-yellow"
        }`}
        style={
          isHeader
            ? {
                WebkitTextStroke: "1.5px #d62828",
                paintOrder: "stroke fill",
              }
            : undefined
        }
      >
        Tarto Cakes
      </span>
      <span
        className={`font-sans font-bold ${
          isHeader
            ? "text-base text-tarto-red sm:text-lg"
            : "text-sm text-white"
        }`}
      >
        UG
      </span>
    </Link>
  );
}
