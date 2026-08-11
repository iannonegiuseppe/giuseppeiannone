"use client";

import { useEffect, useRef } from "react";
import styles from "./ChiSonoHowIWorkVariants.module.scss";

// Cross-row equal height for the 2x2 "Come lavoro" blocks grid. CSS
// Grid's own align-items:stretch only equalizes tiles within the SAME
// row (card 1 already matched card 2, card 3 already matched card 4) —
// it can't make row 2 match row 1, since each row's track is sized
// independently from the other. Forcing that requires knowing the
// tallest of all four ahead of layout, which content-driven i18n copy
// (it/en bodies are different lengths) makes a JS measurement, not a
// CSS-only fix.
//
// Observes .blocksContent (the title+body wrapper) rather than the
// tiles themselves or the grid: this effect sets min-height on the
// TILE, so observing the tile (or the grid, whose own height changes
// with it) would self-trigger the observer in a feedback loop.
// .blocksContent is never touched here, so it's safe to observe.
//
// Only active at the md breakpoint and up (mixins.breakpoint-up(md),
// 48rem) — below that the grid is a single column and every tile is
// already its own row; forcing equal height there would just add dead
// padding under the shorter cards for no alignment benefit.
export function BlocksEqualHeight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const mq = window.matchMedia("(min-width: 48rem)");

    const measure = () => {
      const tiles = Array.from(grid.querySelectorAll<HTMLElement>(`.${styles.blocksTile}`));
      tiles.forEach((tile) => {
        tile.style.minHeight = "";
      });
      if (!mq.matches) return;
      const max = Math.max(...tiles.map((tile) => tile.getBoundingClientRect().height));
      tiles.forEach((tile) => {
        tile.style.minHeight = `${max}px`;
      });
    };

    measure();
    const contents = Array.from(grid.querySelectorAll<HTMLElement>(`.${styles.blocksContent}`));
    const ro = new ResizeObserver(measure);
    contents.forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
    };
  }, []);

  return (
    <ul ref={ref} className={styles.blocksGrid}>
      {children}
    </ul>
  );
}
