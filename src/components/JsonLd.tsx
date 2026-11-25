type Props = {
  data: Record<string, unknown>;
};

/**
 * Structured data (schema.org) for search engines. "<" is escaped so text
 * typed by staff or customers can never close the <script> tag early.
 */
export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
