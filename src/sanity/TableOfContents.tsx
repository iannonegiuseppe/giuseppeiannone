import { getTranslations } from "next-intl/server";
import type { TocHeading } from "./headings";
import styles from "./TableOfContents.module.scss";

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
    <nav aria-label={t("label")} className={styles.nav}>
      <p className={styles.label}>{t("label")}</p>
      <ol className={styles.list}>
        {headings.map((heading) => (
          <li key={heading.key} data-level={heading.level} className={styles.item}>
            <a href={`#${heading.id}`} className={styles.link}>
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
