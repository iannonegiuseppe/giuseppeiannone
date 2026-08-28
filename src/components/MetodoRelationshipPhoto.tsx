"use client";

import { useLayoutEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { observeVisibility } from "@/components/sharedViewportObserver";
import styles from "./MetodoRelationshipPhoto.module.scss";

// Metodo section 4 ("La relazione")'s photo — moved here from section 6
// ("Fit and Ending"), renamed from MetodoFitEndingPhoto to match. Reveal
// mechanism unchanged from that file (useLayoutEffect/observeVisibility/
// data-revealed, 0.3 threshold, one-shot).
//
// Deliberately KEEPS aspect-ratio: 1/1 unconditionally (MetodoFitEndingPhoto
// dropped it at md+ in favor of align-self: stretch, because that section's
// text column was always the row's height driver there). Here the
// paragraph column's height isn't guaranteed to be taller than a square at
// every width — so this box stays a true, uncropped square at every
// breakpoint, and EpigraphBand.module.scss's .relationshipRow uses
// align-items: center (not stretch) so whichever of the two items is
// taller drives the row's own auto height, and the shorter one centers
// within it. That's what keeps this photo from ever escaping the row: the
// row can never be shorter than this box, by construction.
export function MetodoRelationshipPhoto({ photoUrl, photoAlt }: { photoUrl: string; photoAlt: string }) {
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = rootRef.current;
    if (!el) return;
    const unregister = observeVisibility(
      el,
      (inView) => {
        if (!inView) return;
        setRevealed(true);
        unregister();
      },
      0.3,
    );
    return unregister;
  }, []);

  return (
    <>
      {/* Sibling of .root, not nested inside it — the seam is the ROW's own
          boundary (EpigraphBand.module.scss's .relationshipRow), not a
          frame around the image, so it must run the row's full height
          regardless of the photo's own (shorter when paragraphs are
          taller). See MetodoRelationshipPhoto.module.scss's own comment
          on .seamRule. */}
      <div className={styles.seamRule} aria-hidden="true" />
      <div ref={rootRef} className={styles.root} data-revealed={revealed}>
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.photoLayer}>
          <NextImage src={photoUrl} alt={photoAlt} fill sizes="(min-width: 768px) 38vw, 100vw" className={styles.photoImg} />
        </div>
      </div>
    </>
  );
}
