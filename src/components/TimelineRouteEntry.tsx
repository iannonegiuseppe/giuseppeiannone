"use client";

import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import { TimelineRouteCardContent } from "@/components/TimelineRouteCardContent";
import { useRevealOnScroll } from "@/components/useRevealOnScroll";
import styles from "./TimelineVariants.module.scss";

// One Route entry — the normal-flow / fallback rendering (below lg, or
// under reduced motion — see TimelineRoute.tsx's own dual-tree
// comment). The slide-in reveal, the postcard-stack overlap (tilt +
// negative margin), the sticky dot-pin and the frame parallax all live
// in TimelineVariants.module.scss's own Route section; this component
// only owns the reveal STATE (useRevealOnScroll, shared with the
// shipped TimelineEntry.tsx and TimelineCaseFileEntry.tsx) and passes
// it down via data-revealed so both the card AND its own dot marker
// can react to the same one signal.
export function TimelineRouteEntry({ entry, gradient }: { entry: TimelineEntryResolved; gradient: string }) {
  const { ref, revealed } = useRevealOnScroll<HTMLLIElement>();

  return (
    <li
      ref={ref}
      id={entry.id}
      data-revealed={revealed ? "true" : undefined}
      className={`${styles.routeEntry} ${entry.image ? styles.routeHasImage : ""}`}
    >
      <div className={styles.routeMarker} />
      <div className={`${styles.routeCard} ${styles.card} ${gradient}`}>
        <TimelineRouteCardContent entry={entry} />
      </div>
    </li>
  );
}
