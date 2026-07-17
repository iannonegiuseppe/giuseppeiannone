"use client";

import { useEffect, useRef, useState } from "react";
import { contrastRatio, resolveTokenColor } from "./colorUtils";
import styles from "./styleguide.module.scss";

// Live audit, not a hand-typed table — recomputes against whatever the
// real tokens currently resolve to, every time this page loads. This is
// exactly the kind of check that would have caught Footer's hover-color
// regression the moment --color-accent changed, instead of needing a
// separate manual sweep afterwards. Pairs below are the ones actually
// load-bearing in real components (see each label) — not an exhaustive
// combinatorial table.
const PAIRS: {
  label: string;
  fg: string;
  bg: string;
  floor: 4.5 | 3;
  note: string;
}[] = [
  {
    label: "Body text",
    fg: "--color-text",
    bg: "--color-bg",
    floor: 4.5,
    note: "Primary ink on page background",
  },
  {
    label: "Muted text (on page)",
    fg: "--color-text-muted",
    bg: "--color-bg",
    floor: 4.5,
    note: "Captions, secondary copy",
  },
  {
    label: "Muted text (on sand)",
    fg: "--color-text-muted",
    bg: "--color-sand",
    floor: 4.5,
    note: "Muted text over a warm-neutral band",
  },
  {
    label: "Accent as text",
    fg: "--color-accent",
    bg: "--color-bg",
    floor: 4.5,
    note: "Eyebrows, links — HeroOverlap, ChiSonoOverlap",
  },
  {
    label: "Button fill (rest)",
    fg: "--color-accent-contrast",
    bg: "--color-accent",
    floor: 4.5,
    note: "Solid CTA — Button.module.scss .solid",
  },
  {
    label: "Button fill (hover)",
    fg: "--color-accent-contrast",
    bg: "--color-accent-hover",
    floor: 4.5,
    note: "Solid CTA hover state",
  },
  {
    label: "Amber (non-text)",
    fg: "--color-amber",
    bg: "--color-bg",
    floor: 3,
    note: "ContactForm error tint, Footer hover — graphical/non-text floor",
  },
];

export function ContrastTable() {
  const probeRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<
    { label: string; fg: string; bg: string; ratio: number; floor: number; note: string }[]
  >([]);

  useEffect(() => {
    const probe = probeRef.current;
    if (!probe) return;
    setRows(
      PAIRS.map((pair) => {
        const fgHex = resolveTokenColor(probe, pair.fg);
        const bgHex = resolveTokenColor(probe, pair.bg);
        return {
          label: pair.label,
          fg: fgHex,
          bg: bgHex,
          ratio: contrastRatio(fgHex, bgHex),
          floor: pair.floor,
          note: pair.note,
        };
      }),
    );
  }, []);

  return (
    <div className={styles.contrastTable}>
      <div ref={probeRef} aria-hidden="true" className={styles.tokenProbe} />
      <div className={styles.contrastHeaderRow}>
        <span>Pair</span>
        <span>Ratio</span>
        <span>Floor</span>
        <span>Result</span>
      </div>
      {rows.map((row) => {
        const passes = row.ratio >= row.floor;
        return (
          <div key={row.label} className={styles.contrastRow}>
            <span className={styles.contrastLabel}>
              {row.label}
              <span className={styles.contrastNote}>{row.note}</span>
            </span>
            <span className={styles.contrastRatio}>{row.ratio.toFixed(2)}:1</span>
            <span className={styles.contrastFloor}>{row.floor}:1</span>
            <span
              className={
                passes
                  ? `${styles.contrastResult} ${styles.contrastPass}`
                  : `${styles.contrastResult} ${styles.contrastFail}`
              }
            >
              {passes ? "Pass" : "Fail"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
