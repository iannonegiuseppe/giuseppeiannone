"use client";

import { useLayoutEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Lightbox } from "./Lightbox";
import styles from "./sediCards.module.scss";

export type SediCardData = {
  id: string;
  name: string;
  addressLine?: string;
  photoUrl?: string;
  photoAlt?: string;
};

// Cyprus rebuild, item 10. Diplomi's own comment already earmarked its
// shared .iconButton/lightbox treatment for "once a real scan exists" —
// none do yet for Diplomi, so it stays non-interactive (see page.tsx's
// own comment on that decision). These cards DO have real photography for
// 2 of 5 (see page.tsx) — only those two get the lightbox + hover-lift;
// the other 3 render the plain static frame with no hover state at all,
// per this pass's own "no hover-lift on anything non-interactive"
// instruction.
export function SediCards({
  kicker,
  heading,
  headingId,
  items,
}: {
  kicker: string;
  heading: string;
  headingId: string;
  items: SediCardData[];
}) {
  const [revealed, setRevealed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.unobserve(root);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const openItem = items.find((item) => item.id === openId);

  return (
    <div ref={rootRef} className={styles.sediRoot} data-revealed={revealed}>
      <div className={styles.sediHeader}>
        <div>
          <p className={styles.sediKicker}>{kicker}</p>
          <h2 id={headingId} className={styles.sediHeading}>
            {heading}
          </h2>
        </div>
      </div>

      <div className={styles.sediTrackWrap}>
        <ul className={styles.sediTrack} role="list" aria-label={heading}>
          {items.map((item) => {
            const interactive = Boolean(item.photoUrl);
            const frame = (
              <div className={styles.sediCardFrame}>
                {item.photoUrl ? (
                  <NextImage
                    src={item.photoUrl}
                    alt={item.photoAlt ?? ""}
                    fill
                    sizes="(min-width: 64rem) 30vw, 78vw"
                    className={styles.sediCardImg}
                  />
                ) : (
                  <div className={styles.sediCardPlaceholder}>
                    <span>Foto da scattare</span>
                  </div>
                )}
              </div>
            );

            return (
              <li key={item.id} className={styles.sediCardItem} data-interactive={interactive}>
                <div className={styles.sediCard}>
                  {interactive ? (
                    <button
                      type="button"
                      className={styles.sediCardButton}
                      onClick={() => setOpenId(item.id)}
                      aria-label={`Ingrandisci foto — ${item.name}`}
                    >
                      {frame}
                    </button>
                  ) : (
                    frame
                  )}
                  <div className={styles.sediCardCaption}>
                    <p className={styles.sediCardName}>{item.name}</p>
                    {item.addressLine ? (
                      <p className={styles.sediCardAddress}>{item.addressLine}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {openItem?.photoUrl ? (
        <Lightbox
          imageUrl={openItem.photoUrl}
          imageAlt={openItem.photoAlt ?? ""}
          caption={openItem.name}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </div>
  );
}
