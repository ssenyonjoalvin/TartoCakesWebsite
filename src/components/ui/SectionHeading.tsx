type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: "h1" | "h2";
  align?: "center" | "left";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  align = "center",
  className = "",
}: Props) {
  const centered = align === "center";

  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-tarto-amber">
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={`mt-3 font-bold text-tarto-ink ${
          Heading === "h1" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {title}
      </Heading>
      {description ? (
        <p className={`mt-4 text-tarto-ink/70 ${centered ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
