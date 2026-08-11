"use client";

import { useActiveScrollId } from "@/components/useActiveScrollId";
import styles from "./TimelineSection.module.scss";

export interface TimelineRailEntry {
  id: string;
  place: string;
  year?: string;
  kicker?: string;
}

// Chi sono timeline rebuild — sticky rail, the 220px first column of the
// section's lg+ layout (TimelineSection.module.scss's own .layout).
// Reuses useActiveScrollId (the same hook ScrollTrackingToc.tsx uses on
// the article/pillar routes) for the "which entry is currently being
// read" tracking, rather than a second scroll listener — this is the
// ONE piece of that pass's abandoned rail that survives into the
// pin-free rebuild; the render below is unchanged from it. Not a table
// of contents — no "Sommario" label, no heading text; each link shows a
// place, and entries without a year show the place alone.
//
// Proportions: inactive links show the place name alone, small and
// muted; the ACTIVE link alone expands to show the place at display
// scale plus its year/kicker beneath in small-caps gold — so the current
// position is unmistakable without having to read every line.
//
// topOffset defaults to var(--header-height-collapsed) — same default,
// same reasoning, as ReadingArea.tsx's own ScrollTrackingToc caller: a
// sticky rail only ever visibly pins after scrolling well past the
// header's collapse threshold, and the timeline sits far enough down
// the page that the header is always collapsed by the time this matters.
export function TimelineRail({
  entries,
  topOffset = "var(--header-height-collapsed)",
}: {
  entries: TimelineRailEntry[];
  topOffset?: string;
}) {
  const activeId = useActiveScrollId(entries.map((entry) => entry.id));

  return (
    <nav aria-label="Timeline" className={styles.rail} style={{ top: topOffset }}>
      <ol className={styles.railList}>
        {entries.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className={styles.railLink}
                data-active={isActive ? "true" : undefined}
              >
                <span className={styles.railPlace}>{entry.place}</span>
                {isActive && (entry.year || entry.kicker) ? (
                  <span className={styles.railMeta}>
                    {entry.year ? <span className={styles.railYear}>{entry.year}</span> : null}
                    {entry.kicker ? <span className={styles.railKicker}>{entry.kicker}</span> : null}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
