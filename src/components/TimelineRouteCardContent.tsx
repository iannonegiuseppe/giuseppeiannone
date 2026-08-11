import Image from "next/image";
import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import styles from "./TimelineVariants.module.scss";

// The inner content of a Route card (place/kicker/title/body/quote,
// optionally an image) — shared between the normal-flow card
// (TimelineRouteEntry.tsx) and the pinned stage (TimelineRoutePinned.tsx),
// which wrap it in two different outer elements/transition mechanisms
// but render identical content either way.
//
// hideImage: the pinned stage's own card is position:absolute with a
// fixed box (no internal scroll, no overflow clipping) — the image row
// pushed real content past that fixed height and visibly spilled below
// the card's own rounded edge (caught from a live screenshot, not a
// report). Rather than re-fit an image into a box that was never
// designed to accommodate one, the pinned stage drops it entirely — the
// normal-flow card (which has real in-flow height, no such ceiling)
// keeps its image untouched.
export function TimelineRouteCardContent({ entry, hideImage }: { entry: TimelineEntryResolved; hideImage?: boolean }) {
  return (
    <>
      <p className={styles.routePlace}>{entry.place}</p>
      <div className={styles.routeMeta}>
        {entry.kicker ? <span className={styles.routeKicker}>{entry.kicker}</span> : null}
        {entry.title ? <span className={styles.routeTitle}>{entry.title}</span> : null}
      </div>
      <div className={styles.routeCols}>
        <div className={styles.routeColsText}>
          {entry.body.map((paragraph, i) => (
            <p key={i} className={styles.routeBody}>
              {paragraph}
            </p>
          ))}
          {entry.pullQuote ? <p className={styles.routeQuote}>{entry.pullQuote}</p> : null}
        </div>
        {entry.image && !hideImage ? (
          <div className={`${styles.routeImage} ${styles.imageFrame}`}>
            <Image src={entry.image.src} alt={entry.image.alt} fill sizes="192px" className={styles.imagePhoto} />
          </div>
        ) : null}
      </div>
    </>
  );
}
