"use client";

import { useActiveScrollId } from "@/components/useActiveScrollId";
import styles from "./TimelineSection.module.scss";

export interface TimelineRailEntry {
  id: string;
  place: string;
  year?: string;
}

// Chi sono timeline pass — sticky year rail, left column on ≥lg. Reuses
// useActiveScrollId (extracted from ScrollTrackingToc.tsx this same
// pass) for the "which entry is currently being read" tracking — same
// Lenis-driven mechanism, same active-offset constant — rather than a
// second scroll listener. What had to change from ScrollTrackingToc
// itself: everything about the RENDER. This isn't a table of contents —
// no "Sommario" label, no heading text; each link shows a year (when
// known) and a place, and entries without a year show the place alone
// (see chiSonoSection.ts's own field description — 6 of 8 entries have
// no year yet, deliberately, not a bug).
export function TimelineRail({ entries, topOffset }: { entries: TimelineRailEntry[]; topOffset: string }) {
  const activeId = useActiveScrollId(entries.map((entry) => entry.id));

  return (
    <nav aria-label="Timeline" className={styles.rail} style={{ top: topOffset }}>
      <ol className={styles.railList}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={styles.railLink}
              data-active={entry.id === activeId ? "true" : undefined}
            >
              {entry.year ? <span className={styles.railYear}>{entry.year}</span> : null}
              <span className={styles.railPlace}>{entry.place}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
