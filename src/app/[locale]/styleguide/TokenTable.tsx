"use client";

import { useEffect, useRef, useState } from "react";
import { resolveTokenColor } from "./colorUtils";
import styles from "./styleguide.module.scss";

// Global restyle pass: this page is now the single-source design
// reference for the ONE live palette — no more --sg-* proxy layer to
// keep in sync. Reads the LIVE computed value straight off :root (real
// --color-* custom properties, defined once in src/styles/_tokens.scss)
// rather than a second, hand-maintained mirror — can never silently
// drift from the real CSS source of truth the way the old --sg-* file
// did (that's exactly how Footer's hover color broke unnoticed once,
// see this pass's own report).
const TOKEN_NAMES = [
  "--color-text",
  "--color-text-muted",
  "--color-bg",
  "--color-surface",
  "--color-surface-tint",
  "--color-sand",
  "--color-sand-deep",
  "--color-greige",
  "--color-line",
  "--color-hairline",
  "--color-accent",
  "--color-accent-hover",
  "--color-accent-soft",
  "--color-accent-contrast",
  "--color-amber",
  "--color-focus",
] as const;

export function TokenTable() {
  const probeRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const probe = probeRef.current;
    if (!probe) return;
    const next: Record<string, string> = {};
    for (const name of TOKEN_NAMES) {
      next[name] = resolveTokenColor(probe, name);
    }
    setValues(next);
  }, []);

  return (
    <div className={styles.tokenTable}>
      <div ref={probeRef} aria-hidden="true" className={styles.tokenProbe} />
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
