"use client";

import Image from "next/image";
import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import { useRevealOnScroll } from "@/components/useRevealOnScroll";
import styles from "./TimelineVariants.module.scss";

// One Case File entry — staggered reveal (tab, then card) and the
// tab/card overlap live in TimelineVariants.module.scss's own Case
// File section; this component only owns the reveal STATE
// (useRevealOnScroll, shared with the shipped TimelineEntry.tsx and
// TimelineRouteEntry.tsx).
export function TimelineCaseFileEntry({
  entry,
  gradient,
  noteTag,
}: {
  entry: TimelineEntryResolved;
  gradient: string;
  noteTag: string;
}) {
  const { ref, revealed } = useRevealOnScroll<HTMLLIElement>();

  return (
    <li ref={ref} id={entry.id} data-revealed={revealed ? "true" : undefined} className={styles.cfEntry}>
      <span className={styles.cfTab}>{entry.place}</span>
      <div className={`${styles.cfCard} ${styles.card} ${gradient}`}>
        {entry.kicker ? <p className={styles.cfKicker}>{entry.kicker}</p> : null}
        {entry.title ? <h3 className={styles.cfTitle}>{entry.title}</h3> : null}
        {entry.image ? (
          <div className={styles.cfRow}>
            <div>
              {entry.body.map((paragraph, i) => (
                <p key={i} className={styles.cfBody}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className={`${styles.cfImage} ${styles.imageFrame}`}>
              <Image src={entry.image.src} alt={entry.image.alt} fill sizes="128px" className={styles.imagePhoto} />
            </div>
          </div>
        ) : (
          entry.body.map((paragraph, i) => (
            <p key={i} className={styles.cfBody}>
              {paragraph}
            </p>
          ))
        )}
        {entry.pullQuote ? (
          <div className={styles.cfNote}>
            <span className={styles.cfNoteTag}>{noteTag}</span>
            <p>{entry.pullQuote}</p>
          </div>
        ) : null}
      </div>
    </li>
  );
}
