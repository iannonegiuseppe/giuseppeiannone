import Image from "next/image";
import styles from "./ResourcesSection.module.scss";
import sharedStyles from "./sharedSections.module.scss";

export type ResourceArticle = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string; // ISO date string
  cover: string; // LAB MOCK — see ResourcesSection.tsx's file-level comment
  category: string; // LAB MOCK — see ResourcesSection.tsx's file-level comment
};

function formatItalianDate(iso: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// Reusable panel: the whole thing is one <a> (no separate "read more"),
// cover image with the standard tonal treatment, a bottom scrim, and
// bottom-left content (category pill, date, title). Hover/reduced-motion
// states live in sectionsShared.module.scss.
export function ArticlePanel({ article, href }: { article: ResourceArticle; href: string }) {
  return (
    <a href={href} className={styles.resourcesPanel}>
      <Image
        src={article.cover}
        alt=""
        fill
        sizes="(min-width: 48rem) 34vw, 85vw"
        className={`${styles.resourcesPanelImg} ${sharedStyles.heroOverlapPhotoTreated}`}
      />
      <span className={styles.resourcesPanelScrimBase} aria-hidden="true" />
      <span className={styles.resourcesPanelScrimHover} aria-hidden="true" />
      <span className={styles.resourcesPanelContent}>
        <span className={styles.resourcesPanelMeta}>
          <span className={styles.resourcesPanelPill}>{article.category}</span>
          <span className={styles.resourcesPanelDate}>{formatItalianDate(article.publishedAt)}</span>
        </span>
        <span className={styles.resourcesPanelTitle}>{article.title}</span>
      </span>
    </a>
  );
}
