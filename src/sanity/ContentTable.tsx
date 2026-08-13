"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./portableTextComponents.module.scss";

// Privacy/cookie policy pass — scroll-fade affordance for the horizontally-
// scrolling table (see .tableScroll's own comment in the stylesheet for why
// scroll, not reflow/stacking). A plain overflow-x:auto container gives no
// visual hint there's more to the right until a visitor happens to swipe it
// — this fixes that: a right-edge fade that's only present while there's
// still unscrolled content, and disappears once you reach the end. Needs
// real scroll-position tracking (not a CSS-only trick), so this one piece
// of an otherwise server-rendered page is a client component — the table
// markup itself stays plain, static HTML either way.
export function ContentTable({
  headerRow,
  rows,
}: {
  headerRow: string[];
  rows: { _key: string; cells: string[] }[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      // 1px slack for sub-pixel rounding — without it, some zoom levels/
      // browsers leave a fade visibly stuck on a table that's already
      // fully scrolled (or never overflowed at all).
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setShowFade(hasOverflow && !atEnd);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={styles.tableScrollWrap} data-fade={showFade ? "true" : undefined}>
      <div className={styles.tableScroll} ref={scrollRef}>
        <table className={styles.table}>
          <thead>
            <tr>
              {headerRow.map((cell, i) => (
                <th key={i} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._key}>
                {row.cells.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
