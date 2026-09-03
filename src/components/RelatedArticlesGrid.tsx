import Image from "next/image";
import Link from "next/link";
import type { Image as SanityImage } from "sanity";
import { articleCoverUrl } from "@/sanity/image";
import { articlePath, type Locale } from "@/sanity/paths";
import styles from "./RelatedArticlesGrid.module.scss";

export interface RelatedArticleDoc {
  _id: string;
  title: string;
  slug: string;
  cover?: (SanityImage & { alt?: string }) | undefined;
  publishedAt: string | null;
}

// Extracted verbatim from the blog article route's own page.tsx (the
// "Item 5" related-posts block, article.module.scss's own
// .relatedSection/.relatedGrid/.relatedCard rules) so the pillar page can
// reuse the exact same card — cover image, hover scale, title color shift
// — instead of a second implementation. See that route's page.tsx for the
// one remaining caller besides the pillar route. Markup/CSS unchanged;
// only the heading text became a prop (the article route's own locale-
// ternary copy stays exactly as it was there — this component doesn't
// invent a new convention, just stops hardcoding ONE caller's copy).
export function RelatedArticlesGrid({
  items,
  locale,
  heading,
}: {
  items: RelatedArticleDoc[];
  locale: string;
  heading: string;
}) {
  if (items.length === 0) return null;

  const typedLocale = locale as Locale;

  return (
    <div className={styles.relatedSection}>
      <div className={styles.relatedInner}>
        <h2 className={styles.relatedHeading}>{heading}</h2>
        <div className={styles.relatedGrid}>
          {items.map((item) => {
            // Shared single cover source (see articleCoverUrl). It returns
            // null for exactly the unparseable-ref case the old `dims`
            // guard covered, so the URL is now the guard.
            const coverSrc = item.cover ? articleCoverUrl(item.cover) : null;
            return (
              <Link
                key={item._id}
                href={articlePath(typedLocale, item.slug)}
                className={styles.relatedCard}
              >
                <div className={styles.relatedCardImage}>
                  {coverSrc ? (
                    <Image
                      src={coverSrc}
                      alt=""
                      fill
                      sizes="(min-width: 48rem) 33vw, 100vw"
                      className={styles.relatedCardImg}
                    />
                  ) : null}
                </div>
                <p className={styles.relatedCardTitle}>{item.title}</p>
                {item.publishedAt ? (
                  <time className={styles.relatedCardDate} dateTime={item.publishedAt}>
                    {new Date(item.publishedAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
