import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import { TimelineRouteEntry } from "@/components/TimelineRouteEntry";
import { TimelineRoutePinned } from "@/components/TimelineRoutePinned";
import styles from "./TimelineVariants.module.scss";

const GRADIENTS = [styles.gradA, styles.gradB, styles.gradC];

// "The Route" — the permanent timeline block (promoted from a
// query-param preview variant; see TimelineSection.tsx's own comment).
// Two ENTIRELY separate render paths,
// BOTH always in the DOM — CSS decides which is visible (see
// .routeFallback/.routePinWrap in TimelineVariants.module.scss),
// exactly the pattern the original TimelinePinned.tsx established for
// the same reason: server and client always render identical markup,
// so there's no hydration-mismatch risk from branching on
// viewport/motion-preference (neither is known at render time).
//
// - .routeFallback: the normal-flow list (TimelineRouteEntry.tsx) —
//   place name is the card's own headline, a dashed line threads a
//   dot marker per entry that pins while its own card scrolls past,
//   the photo frame parallaxes, cards overlap like a fanned stack.
//   This is BOTH the below-lg layout AND the prefers-reduced-motion
//   fallback.
// - .routePinWrap: lg+, motion-allowed only — the whole section pins
//   to the viewport and entries advance inside it, driven by the
//   existing Lenis instance (TimelineRoutePinned.tsx's own top
//   comment has the full reasoning, including why this doesn't repeat
//   the problem the original pin was removed for).
export function TimelineRoute({
  entries,
  kicker,
  heading,
  description,
}: {
  entries: TimelineEntryResolved[];
  kicker?: string;
  heading?: string;
  description?: string;
}) {
  return (
    <>
      <div className={`${styles.routeWrap} ${styles.routeFallback}`}>
        <div className={styles.routeLine} aria-hidden="true" />
        <ol className={styles.routeList}>
          {entries.map((entry, index) => (
            <TimelineRouteEntry key={entry.id} entry={entry} gradient={GRADIENTS[index % GRADIENTS.length] ?? ""} />
          ))}
        </ol>
      </div>
      <TimelineRoutePinned entries={entries} kicker={kicker} heading={heading} description={description} />
    </>
  );
}
