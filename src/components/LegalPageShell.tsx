import { PortableText, type PortableTextComponents } from "next-sanity";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import type { BreadcrumbItem } from "@/sanity/breadcrumbs";
import type { TocHeading } from "@/sanity/headings";
import { ReadingArea } from "@/components/ReadingArea";
import styles from "./legalPageShell.module.scss";

// Privacy/cookie policy pass — shared shell for the two legal-document
// routes (identical shape: breadcrumbs, h1, an editor-set revision date,
// then the same reading experience article/pillar already use). One
// component with two callers rather than two near-duplicate page.tsx
// bodies, same reasoning ReadingArea.tsx itself was extracted for. Does
// NOT reuse the article route's cover band (photo/author/reading time) —
// none of that applies to a legal document; this is closer to the
// pillar/generic-page routes' plainer top-of-page pattern.
export function LegalPageShell({
  trail,
  title,
  lastUpdatedLabel,
  lastUpdatedDate,
  lastUpdatedPlaceholder,
  locale,
  headings,
  body,
  components,
}: {
  trail: BreadcrumbItem[];
  title: string;
  lastUpdatedLabel: string;
  /** ISO date string (YYYY-MM-DD), from the document's own `lastUpdated` field. */
  lastUpdatedDate?: string;
  /** Shown in place of a real date when the field is still empty — e.g.
   * "[DA CONFERMARE]"/"[TO BE CONFIRMED]" — so an unfilled field reads as
   * visibly unfinished rather than silently disappearing. */
  lastUpdatedPlaceholder: string;
  locale: string;
  headings: TocHeading[];
  body: unknown;
  components: PortableTextComponents;
}) {
  const tocHeadings = headings.filter((heading) => heading.level === "h2");

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Breadcrumbs trail={trail} />
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.meta}>
          {lastUpdatedLabel}:{" "}
          {lastUpdatedDate ? (
            <time dateTime={lastUpdatedDate}>
              {/* timeZone: "UTC" is required, not decorative — a plain
                  Sanity `date` value ("2026-08-13", no time component) is
                  parsed as UTC midnight; without pinning the format to UTC
                  too, toLocaleDateString would render it in whatever
                  timezone this runs in, which can roll it back a day. */}
              {new Date(lastUpdatedDate).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          ) : (
            lastUpdatedPlaceholder
          )}
        </p>
      </div>
      <ReadingArea headings={tocHeadings}>
        <PortableText value={body as never} components={components} />
      </ReadingArea>
    </main>
  );
}
