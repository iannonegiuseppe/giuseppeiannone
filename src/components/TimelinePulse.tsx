"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import { useActiveScrollId } from "@/components/useActiveScrollId";
import styles from "./TimelineVariants.module.scss";

const GRADIENTS = [styles.gradA, styles.gradB, styles.gradC];

// Preview variant — "The Pulse." A spine reading like a heartbeat
// strip; the current entry's dot pulses (suppressed under reduced
// motion, see TimelineVariants.module.scss's own media query). Reuses
// useActiveScrollId — the SAME hook TimelineRail.tsx and
// ScrollTrackingToc.tsx already use — for "which entry is active," not
// a second tracker. See TimelineVariants.module.scss's own top comment
// for the shared gradient/contrast system.
export function TimelinePulse({ entries }: { entries: TimelineEntryResolved[] }) {
  const ids = useMemo(() => entries.map((entry) => entry.id), [entries]);
  const activeId = useActiveScrollId(ids);

  return (
    <div className={styles.pulseWrap}>
      <div className={styles.pulseSpine} aria-hidden="true">
        <svg viewBox="0 0 4 400" preserveAspectRatio="none">
          <polyline
            points="2,0 2,140 0,148 2,156 4,140 2,148 2,400"
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="1"
          />
        </svg>
      </div>
      <ol className={styles.pulseList}>
        {entries.map((entry, index) => {
          const isActive = entry.id === activeId;
          return (
            <li
              key={entry.id}
              id={entry.id}
              data-active={isActive ? "true" : undefined}
              className={`${styles.pulseEntry} ${styles.card} ${GRADIENTS[index % GRADIENTS.length]}`}
            >
              <span className={`${styles.pulseDot} ${isActive ? styles.pulseAnimate : ""}`} />
              <p className={styles.pulsePlace}>{entry.place}</p>
              {entry.kicker ? <span className={styles.pulseKicker}>{entry.kicker}</span> : null}
              {entry.title ? <h3 className={styles.pulseTitle}>{entry.title}</h3> : null}
              <div className={`${styles.pulseCols} ${entry.image ? styles.pulseHasImage : ""}`}>
                {entry.image ? (
                  <div className={`${styles.pulseImage} ${styles.imageFrame}`}>
                    <Image src={entry.image.src} alt={entry.image.alt} fill sizes="144px" className={styles.imagePhoto} />
                  </div>
                ) : null}
                <div>
                  {entry.body.map((paragraph, i) => (
                    <p key={i} className={styles.pulseBody}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              {entry.pullQuote ? <p className={styles.pulseQuote}>{entry.pullQuote}</p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
