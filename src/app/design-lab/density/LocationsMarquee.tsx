import NextImage from "next/image";
import styles from "./locationsMarquee.module.scss";

export type LocationsMarqueeItem = {
  id: string;
  name: string;
  photoUrl: string;
  alt: string;
};

// Locations marquee (structure pass, slot 13) — continuous auto-scroll:
// the item list is rendered TWICE, back-to-back, and the track animates
// translateX(0) -> translateX(-50%); since the second half is an
// identical copy of the first, that lands exactly back on the start —
// a seamless loop with no jump. The second copy is aria-hidden and not
// tabbable (decorative only, exists purely to make the loop seamless),
// and is hidden entirely under prefers-reduced-motion (see the SCSS),
// where the block instead renders as one plain, natively-scrollable row.
//
// Each real item is a focusable <figure> (no role/action implied — just
// reachable) so tabbing through the page can trigger animation-play-state:
// paused via :focus-within, same as :hover — required so the motion is
// pausable by keyboard, not just mouse, and never traps focus (a figure
// with no interactive children can't trap it).
export function LocationsMarquee({ items }: { items: LocationsMarqueeItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.trackHalf}>
          <Row items={items} />
        </div>
        <div className={`${styles.trackHalf} ${styles.trackHalfDuplicate}`} aria-hidden="true">
          <Row items={items} decorative />
        </div>
      </div>
    </div>
  );
}

function Row({ items, decorative }: { items: LocationsMarqueeItem[]; decorative?: boolean }) {
  return (
    <>
      {items.map((item) => (
        <figure
          key={`${decorative ? "dup-" : ""}${item.id}`}
          className={styles.item}
          tabIndex={decorative ? undefined : 0}
        >
          <div className={styles.photoFrame}>
            <NextImage
              src={item.photoUrl}
              alt={decorative ? "" : item.alt}
              fill
              sizes="(min-width: 64rem) 28vw, (min-width: 48rem) 38vw, 78vw"
              className={styles.photoImg}
            />
          </div>
          <figcaption className={styles.caption} aria-hidden={decorative}>
            {item.name}
          </figcaption>
        </figure>
      ))}
    </>
  );
}
