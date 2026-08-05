import Link from "next/link";
import styles from "./RecognitionSubtopicList.module.scss";

export interface SubtopicListItem {
  key: string;
  label: string;
  href?: string;
}

// A directory, not a repeat of the quotes above — plain small-caps names,
// no cards, no grid of boxes (per the brief). Static (no reveal
// animation, see PillarRecognition.tsx's own comment on why) — this is
// navigation, not part of the "overheard remarks" composition the quotes
// above are.
export function RecognitionSubtopicList({
  kicker,
  items,
}: {
  kicker: string;
  items: SubtopicListItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className={styles.list}>
      <p className={styles.kicker}>
        <span className={styles.kickerRule} aria-hidden="true" />
        {kicker}
      </p>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.key} className={styles.item}>
            {item.href ? (
              <Link href={item.href} className={styles.itemLink}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.itemText}>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
