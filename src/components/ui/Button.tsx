import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "light" | "whatsapp";
type Size = "md" | "lg";

type StyleProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition disabled:cursor-not-allowed disabled:opacity-70";

const variants: Record<Variant, string> = {
  primary: "bg-tarto-red text-white hover:bg-tarto-red/90",
  secondary: "bg-tarto-yellow text-tarto-ink hover:bg-tarto-orange",
  outline:
    "border-2 border-tarto-red text-tarto-red hover:bg-tarto-red hover:text-white",
  // For red/dark sections: white pill with red text.
  light: "bg-white text-tarto-red hover:bg-tarto-yellow hover:text-tarto-ink",
  // WhatsApp green, darkened to 5.7:1 with white text (AA for any size).
  whatsapp: "bg-[#187540] text-white hover:bg-[#125e33]",
};

// min-h-11 = 44px, the recommended minimum touch target.
const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: StyleProps = {}) {
  return [
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonLinkProps = StyleProps & ComponentProps<typeof Link>;

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={buttonClasses({ variant, size, fullWidth, className })}
    />
  );
}

type ButtonProps = StyleProps & ComponentProps<"button">;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={buttonClasses({ variant, size, fullWidth, className })}
    />
  );
}
