import { getTranslations } from "next-intl/server";
import type { TocHeading } from "./headings";

// Only worth rendering when there's an actual structure to jump around
// in — a single heading isn't a table of contents.
export async function TableOfContents({
  locale,
  headings,
}: {
  locale: string;
  headings: TocHeading[];
}) {
  if (headings.length < 2) return null;

  const t = await getTranslations({ locale, namespace: "TableOfContents" });

  return (
    <nav aria-label={t("label")}>
      <p>{t("label")}</p>
      <ol>
        {headings.map((heading) => (
          <li key={heading.key} data-level={heading.level}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
