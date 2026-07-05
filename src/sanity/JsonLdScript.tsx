// Escapes "<" so a "</script>" substring inside any field (e.g. a title
// containing literal text) can't prematurely close the script tag.
export function JsonLdScript({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
