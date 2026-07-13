"use client";

import { useEffect, useRef, useState } from "react";
import { usePalette } from "./PaletteContext";
import styles from "./styleguide.module.scss";

// Color tokens only (the type-scale --sg-fs-*/--sg-lh-* custom properties
// aren't colors — a swatch+hex row wouldn't mean anything for them, so
// they're out of scope for a "swatch + name + hex" token table).
const TOKEN_NAMES = [
  "--sg-text",
  "--sg-text-muted",
  "--sg-card",
  "--sg-placeholder",
  "--sg-bg-page",
  "--sg-bg-hero",
  "--sg-bg-alt-1",
  "--sg-bg-alt-2",
  "--sg-bg-alt-3",
  "--sg-bg-alt-4",
  "--sg-accent",
  "--sg-accent-text",
  "--sg-accent-on-dark",
  "--sg-on-accent",
  "--sg-dark",
  "--sg-dark-2",
  "--sg-border",
  "--sg-border-input",
  "--sg-numeral-1",
  "--sg-numeral-2",
  "--sg-numeral-3",
  "--sg-numeral-4",
  "--sg-photo",
  "--sg-shine-base",
  "--sg-shine-mid",
  "--sg-shine-light",
] as const;

// Reads the LIVE computed value straight off the DOM rather than keeping
// a second, hand-maintained JS mirror of styleguide-palettes.scss's own
// hex values — genuinely "auto-rendered" (per this task's own wording)
// and can never silently drift from the real CSS source of truth.
// Re-reads whenever the active palette changes (the effect's own
// dependency), since the same custom property resolves to a different
// value once [data-palette] changes on an ancestor.
export function TokenTable() {
  const { palette } = usePalette();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const computed = getComputedStyle(el);
    const next: Record<string, string> = {};
    for (const name of TOKEN_NAMES) {
      next[name] = computed.getPropertyValue(name).trim().toUpperCase();
    }
    setValues(next);
  }, [palette]);

  return (
    <div ref={anchorRef} className={styles.tokenTable}>
      {TOKEN_NAMES.map((name) => (
        <div key={name} className={styles.tokenRow}>
          <span
            className={styles.tokenSwatch}
            style={{ background: `var(${name})` }}
            aria-hidden="true"
          />
          <code className={styles.tokenName}>{name}</code>
          <span className={styles.tokenHex}>{values[name] || "…"}</span>
        </div>
      ))}
    </div>
  );
}
