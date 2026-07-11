import Link from "next/link";
import styles from "./Card.module.scss";

// Shared by relatedTopics, conditionCard, and treatmentCard — the brief
// treats all three as the same visual pattern ("title + 2-line description
// + quiet arrow link"). relatedTopics has no description (it only ever
// references a document, not a custom object with its own copy), so this
// stays optional rather than forcing every caller to invent one.
export function Card({
  title,
  description,
  href,
}: {
  title: string;
  description?: string;
  href: string;
}) {
  return (
    <Link href={href} className={styles.card}>
      <span className={styles.title}>{title}</span>
      {description ? (
        <span className={styles.description}>{description}</span>
      ) : null}
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
