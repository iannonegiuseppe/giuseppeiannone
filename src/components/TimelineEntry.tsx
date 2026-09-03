"use client";

import Image from "next/image";
import { useRevealOnScroll } from "@/components/useRevealOnScroll";
import styles from "./TimelineSection.module.scss";

export interface TimelineEntryResolved {
  id: string;
  place: string;
  kicker?: string;
  title?: string;
  body: string[];
  pullQuote?: string;
  image?: { src: string; width: number; height: number; alt: string } | null;
}

// Timeline rebuild (pinning removed) — one entry, normal document flow.
// Image sits in its own fixed-width grid column (lg+) so an entry
// without one leaves that column empty rather than pulling the text
// column left — the .entryText cell below is given an EXPLICIT
// grid-column (not left to auto-placement), which is what actually
// guarantees this: auto-placement would put the lone rendered cell
// (text) into column 1 whenever the image cell is absent from the DOM.
//
// Reveals once as it scrolls into view (opacity + a small upward drift),
// then stays revealed — never re-hides on scroll-out, via
// useRevealOnScroll (shared with TimelineCaseFileEntry.tsx and
// TimelineRouteEntry.tsx — same hook, not tripled). Reduced-motion
// users get the fully-visible state unconditionally, two ways: the
// hook's own observer never starts, AND the CSS itself only defines
// the hidden/offset starting state inside `@media
// (prefers-reduced-motion: no-preference)` (TimelineSection.module.scss)
// — so nothing ever starts hidden pre-hydration or with JS disabled.
export function TimelineEntry({
  id,
  place,
  kicker,
  title,
  body,
  pullQuote,
  image,
  isFirst,
}: TimelineEntryResolved & { isFirst: boolean }) {
  const { ref, revealed } = useRevealOnScroll<HTMLElement>();

  return (
    <article
      id={id}
      ref={ref}
      className={`${styles.entry} ${isFirst ? "" : styles.entryDivider}`}
      data-revealed={revealed ? "true" : undefined}
    >
      <p className={styles.entryPlaceMobile}>{place}</p>
      {image ? (
        <div className={styles.entryImage}>
          {/* Was "420px" — px-only, so Next's vw filter never engaged and
              every width in the list was authorised. .entryImage tracks
              --timeline-image-width (TimelineSection.module.scss): 420px at
              xl+, 320px at lg, and the full stacked column below lg. */}
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 80rem) 420px, (min-width: 64rem) 320px, 90vw"
            className={styles.entryImagePhoto}
          />
        </div>
      ) : null}
      <div className={styles.entryText}>
        {kicker ? <p className={styles.entryKicker}>{kicker}</p> : null}
        {title ? <h3 className={styles.entryTitle}>{title}</h3> : null}
        {body.map((paragraph, index) => (
          <p key={index} className={styles.entryBody}>
            {paragraph}
          </p>
        ))}
        {pullQuote ? <p className={styles.entryQuote}>{pullQuote}</p> : null}
      </div>
    </article>
  );
}
