"use client";

import NextImage from "next/image";
import { useEffect, useRef } from "react";
import { useSediMapContext } from "./SediMapContext";
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
// Light-surface + heading-zone pass: was a bare photo row; now carries
// its own kicker/h2/intro (homePage.spaziLab — /design-lab only, see
// homePage.ts's own comment), reusing the exact heading-zone recipe
// Diplomi/Video already established (kicker rule geometry, h2 weight
// 400 + font-synthesis:none, italic accent word). introLine gates on
// allPhotosReal (see DesignLabHomepage.tsx's own comment on how that's
// computed) — it asserts the photos are real/own, so it must not render
// while any slot is still the temporary interior-stock fallback.
//
// Each real item is now a real <button> (whole-card click, same pattern
// as Diplomi's cards) that also selects the matching map location via
// SediMapContext — clicking a room photo does what clicking its address
// already does (flyTo + open the popup), per this pass's own proposal
// part (d): the strip photo and the popup photo are the same underlying
// source, so this removes the redundancy instead of just tolerating it.
export function LocationsMarquee({
  kicker,
  heading,
  headingEmphasisWord,
  introLine,
  allPhotosReal,
  items,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  introLine?: string;
  allPhotosReal: boolean;
  items: LocationsMarqueeItem[];
}) {
  if (items.length === 0) return null;

  const trackRef = useRef<HTMLDivElement>(null);

  // Correction pass, item 2a: the track's own CSS animation only pauses on
  // :hover/:focus-within — real for mouse (which always hovers before a
  // click lands) and keyboard, but touch has no :hover state at all, so a
  // tap always lands on a still-moving target. Measured directly: with
  // the animation running, Playwright's own actionability check ("element
  // is not stable") never passes; with it disabled (reduced motion), every
  // card clicks cleanly. pointerdown fires at the very start of BOTH a
  // mouse press and a touch tap — pausing there (not just on hover)
  // freezes the element before the activation that follows, covering the
  // gap :hover leaves for touch. Kept alongside the existing CSS pause,
  // not replacing it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    function pause() {
      track!.style.animationPlayState = "paused";
    }
    function resume() {
      track!.style.animationPlayState = "";
    }
    track.addEventListener("pointerdown", pause);
    track.addEventListener("pointerup", resume);
    track.addEventListener("pointercancel", resume);
    return () => {
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("pointerup", resume);
      track.removeEventListener("pointercancel", resume);
    };
  }, []);

  const emphasisIndex = headingEmphasisWord ? heading.indexOf(headingEmphasisWord) : -1;
  const headingNode =
    headingEmphasisWord && emphasisIndex !== -1 ? (
      <>
        {heading.slice(0, emphasisIndex)}
        <em className={styles.headingAccent}>{headingEmphasisWord}</em>
        {heading.slice(emphasisIndex + headingEmphasisWord.length)}
      </>
    ) : (
      heading
    );

  return (
    <>
      <div className={styles.headingZone}>
        <p className={styles.headingKicker}>
          <span className={styles.headingKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2
          id="spazi-block-heading"
          className={styles.headingH2}
          style={{ fontWeight: 400, fontSynthesis: "none" }}
        >
          {headingNode}
        </h2>
        {allPhotosReal && introLine ? <p className={styles.headingIntro}>{introLine}</p> : null}
      </div>
      <div className={styles.wrap}>
        <div ref={trackRef} className={styles.track}>
          <div className={styles.trackHalf}>
            <Row items={items} />
          </div>
          <div className={`${styles.trackHalf} ${styles.trackHalfDuplicate}`} aria-hidden="true">
            <Row items={items} decorative />
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ items, decorative }: { items: LocationsMarqueeItem[]; decorative?: boolean }) {
  const { selectLocation } = useSediMapContext();

  return (
    <>
      {items.map((item) =>
        decorative ? (
          <figure key={`dup-${item.id}`} className={styles.item} aria-hidden="true">
            <div className={styles.photoFrame}>
              <NextImage
                src={item.photoUrl}
                alt=""
                fill
                sizes="(min-width: 64rem) 28vw, (min-width: 48rem) 38vw, 78vw"
                className={styles.photoImg}
              />
            </div>
            <figcaption className={styles.caption}>{item.name}</figcaption>
          </figure>
        ) : (
          <figure key={item.id} className={styles.item}>
            <button
              type="button"
              className={styles.itemButton}
              aria-label={item.name}
              onClick={() => selectLocation(item.id)}
            >
              <div className={styles.photoFrame}>
                <NextImage
                  src={item.photoUrl}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 64rem) 28vw, (min-width: 48rem) 38vw, 78vw"
                  className={styles.photoImg}
                />
              </div>
              <span className={styles.caption}>{item.name}</span>
            </button>
          </figure>
        ),
      )}
    </>
  );
}
