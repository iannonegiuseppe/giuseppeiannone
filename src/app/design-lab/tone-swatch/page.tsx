import { resolveRobots } from "@/sanity/metadata";
import styles from "./swatch.module.scss";

// TEMPORARY — Phase 1 proof artifact only, for the tonal-scale review.
// Not part of the site structure, not linked from anywhere, noindex.
// Delete this route once Phase 1 is approved (or right after, if this
// pass's own report is enough on its own).
export const metadata = { robots: resolveRobots(true) };

const TONES = ["base", "mid", "deep"] as const;

function ToneCard({ tone, variant }: { tone: (typeof TONES)[number]; variant: "light" | "dark" }) {
  return (
    <div className={styles.card} data-tone={tone}>
      <p className={styles.label}>
        tone-{tone} · {variant}
      </p>
      <p className={styles.text}>Testo primario su questo tono.</p>
      <p className={styles.muted}>Testo secondario (muted) su questo tono.</p>
      <div className={styles.hairline} />
      <p className={styles.accent}>Accent — un percorso</p>
      <p className={styles.accentSmall}>EYEBROW / SMALL-ACCENT</p>
    </div>
  );
}

export default function ToneSwatchPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Tonal scale — Phase 1 proof</h1>
      <section>
        <h2 className={styles.sectionHeading}>Light theme</h2>
        <div className={styles.row}>
          {TONES.map((t) => (
            <ToneCard key={t} tone={t} variant="light" />
          ))}
        </div>
      </section>
      {/* .themeDark is a plain global class (design-lab-globals.scss to
          _tokens.scss), the same mechanism DesignLabHomepage.tsx uses for
          /design-lab (dark is the primary variant there since Phase 2) —
          applying it to this wrapper re-scopes every tone and color
          custom property underneath to the dark theme's values, no script
          needed here (unlike the real page, this swatch doesn't need to
          theme the html/body elements itself). */}
      <section className="themeDark">
        <h2 className={styles.sectionHeading}>Dark theme</h2>
        <div className={styles.row}>
          {TONES.map((t) => (
            <ToneCard key={t} tone={t} variant="dark" />
          ))}
        </div>

        {/* Cyprus reconciliation pass (Phase 1) — proof of the new
            foundation tokens, dark-only. */}
        <h2 className={styles.sectionHeading}>
          Cyprus foundation — depth steps (bg / surface / surface-raised)
        </h2>
        <div className={styles.depthRow}>
          <div className={`${styles.depthCard} ${styles.depthCardBg}`}>
            <p className={styles.foundationHeading}>--color-bg #081512</p>
            <p className={styles.swatchIvory}>Ivory — 15.40:1</p>
            <p className={styles.swatchSoft}>Text-soft (72%) — 8.31:1</p>
            <p className={styles.swatchFaint}>Text-faint (45%) — 3.93:1</p>
            <p className={styles.swatchChampagne}>Champagne accent — 7.17:1</p>
          </div>
          <div className={`${styles.depthCard} ${styles.depthCardSurface}`}>
            <p className={styles.foundationHeading}>--color-surface #102826</p>
            <p className={styles.swatchIvory}>Ivory — 12.82:1</p>
            <p className={styles.swatchSoft}>Text-soft (72%) — 7.29:1</p>
            <p className={styles.swatchFaint}>Text-faint (45%) — 3.73:1</p>
            <p className={styles.swatchChampagne}>Champagne accent — 5.97:1</p>
          </div>
          <div className={`${styles.depthCard} ${styles.depthCardRaised}`}>
            <p className={styles.foundationHeading}>--color-surface-raised (film over surface)</p>
            <p className={styles.swatchIvory}>Ivory — 11.43:1</p>
            <p className={styles.swatchSoft}>Text-soft (72%) — 6.69:1</p>
            <p className={styles.swatchFaint}>Text-faint (45%) — 3.56:1</p>
            <p className={styles.swatchChampagne}>Champagne accent — 5.32:1</p>
          </div>
        </div>

        <h2 className={styles.sectionHeading}>Gold steps</h2>
        <div className={styles.goldRow}>
          <div className={`${styles.goldSwatch} ${styles.goldBronze}`}>bronze #8e6b3d — decorative only, not text</div>
          <div className={`${styles.goldSwatch} ${styles.goldChampagne}`}>champagne #c29a5e — primary accent</div>
          <div className={`${styles.goldSwatch} ${styles.goldLight}`}>gold-light #e0c8a7 — hover / small-accent</div>
        </div>

        <h2 className={styles.sectionHeading}>Glow &amp; glass</h2>
        <div className={styles.glowGlassRow}>
          <div className={styles.glowCard}>Glow — box-shadow: 0 0 var(--color-glow) / var(--color-glow-strong)</div>
          <div className={styles.glassCard}>Glass — background: var(--color-glass-bg), border: var(--color-glass-border)</div>
        </div>
      </section>
    </div>
  );
}
