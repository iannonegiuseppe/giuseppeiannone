"use client";

import { useLayoutEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { observeVisibility } from "@/components/sharedViewportObserver";
import styles from "./MetodoFitEndingPhoto.module.scss";

// Metodo section 6's photo, added beside (not inside) StackedBands — see
// MetodoFitEndingPhoto.module.scss's own top comment for the structural
// reasoning. Reveal mechanism copied from ChiSonoBlock.tsx's own
// useLayoutEffect/observeVisibility/data-revealed pattern (not imported —
// that component stays untouched), same 0.3 threshold, one-shot callback.
export function MetodoFitEndingPhoto({ photoUrl, photoAlt }: { photoUrl: string; photoAlt: string }) {
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
      {/* Sibling of .root, not nested inside it — .root is now a centered
          square shorter than the section, but the seam is a section
          boundary and must run the section's own full height regardless.
          See MetodoFitEndingPhoto.module.scss's own comment on .seamRule. */}
      <div className={styles.seamRule} aria-hidden="true" />
      <div ref={rootRef} className={styles.root} data-revealed={revealed}>
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.photoLayer}>
          <NextImage src={photoUrl} alt={photoAlt} fill sizes="(min-width: 768px) 51vw, 100vw" className={styles.photoImg} />
        </div>
      </div>
    </>
  );
}
