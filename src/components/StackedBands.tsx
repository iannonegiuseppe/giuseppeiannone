import styles from "./StackedBands.module.scss";

interface StackedBandLink {
  label: string;
  href: string;
}

interface StackedBand {
  heading: string;
  p1: string;
  p2?: string;
  links?: StackedBandLink[];
}

// Generalized from /metodo's own section 6 ("fit and ending") — that
// section is hardcoded to exactly two bands with no links. This version
// takes an array (any count) and an optional link list per band, needed
// by the city/online pages' area lists (Monza's four, the online page's
// four and its separate three-band "how it works" section) as well as
// metodo's own original two. `tone` reproduces the same conditional
// --color-bg local override metodo's .fitEndingSection uses for its
// "surface" resting tone — pass "bg" for the near-black ground (matches
// SplitBlock's left half) or "surface" for the lighter step (matches
// SplitBlock's right half); the sheen's far-edge gradient stop only
// reads correctly when this matches the section's own painted background.
//
// The caller owns the "themeDark" ancestor wrapper (same rule as
// SplitBlock/EpigraphBand).
//
// stacked — opt-in only (default: unset, side-by-side, unchanged for every
// existing caller). Added for Metodo's own Fit-and-Ending section once a
// photo was placed beside it: the side-by-side 1fr/2.5fr split gives the
// heading a very narrow column once the whole component is confined to a
// 49%-wide wrapper, and stacking heading above prose (this component's own
// existing mobile arrangement, just also applied at md+ now) was the fix —
// see that pass's own report. Deliberately a prop, not a change to the
// shared default: Monza/Milano/online pages' own area lists and "how it
// works" bands reuse this same component and must render exactly as
// before.
// sheen — opt-in-to-disable (default: true, unchanged for every existing
// caller). Added for Metodo's own Fit-and-Ending section: once the text
// column carries its own left inset (page.module.scss's own
// .fitEndingTextCol), this component's own <section> is no longer the same
// box as the whole visual section (MetodoFitEndingPhoto's photo column
// sits outside it) — the sheen must anchor to that whole box instead, not
// this narrower one. sheen={false} only omits the data-sheen attribute
// (the mixin's own [data-sheen="upper-left"]::before selector then simply
// never matches) — .section still gets the mixin's unconditional
// position:relative/z-index:0, which is harmless on its own.
//
// panel — opt-in-to-disable (default: true, unchanged for every existing
// caller). Added for Metodo's own Fit-and-Ending section: .fitEndingOuter
// (page.module.scss) already paints the same --color-surface fill behind
// this whole section now, so this component's own background paint is a
// redundant second layer — harmless when the two boxes are the same size,
// but this component's own <section> is narrower/shorter than
// .fitEndingOuter (the photo column and the text's own inset both sit
// outside it), so the redundant paint shows as a visibly distinct panel
// around the text. panel={false} keeps the --color-bg reassignment (still
// needed so any descendant reading that token gets the right value) but
// drops the actual background declaration, via a "Transparent" tone
// variant instead of a boolean flag on .toneSurface/.toneBg directly — so
// the two tone classes' own meaning never depends on a second prop.
export function StackedBands({
  tone,
  bands,
  stacked,
  sheen = true,
  panel = true,
}: {
  tone: "bg" | "surface";
  bands: StackedBand[];
  stacked?: boolean;
  sheen?: boolean;
  panel?: boolean;
}) {
  const toneClass =
    tone === "surface" ? (panel ? styles.toneSurface : styles.toneSurfaceTransparent) : panel ? styles.toneBg : styles.toneBgTransparent;

  return (
    <section
      className={`${styles.section} ${toneClass}`}
      {...(sheen ? { "data-sheen": "upper-left" } : {})}
    >
      <div className={styles.inner}>
        {bands.map((band, i) => (
          <div
            key={i}
            className={[
              styles.band,
              stacked ? styles.bandStacked : "",
              i < bands.length - 1 ? styles.hasDividerAfter : "",
              i > 0 ? styles.hasSpaceBefore : "",
            ].join(" ")}
          >

            <h2 className={styles.heading}>{band.heading}</h2>
            <div className={styles.prose}>
              <p className={styles.bodyP}>{band.p1}</p>
              {band.p2 ? <p className={styles.bodyP}>{band.p2}</p> : null}
              {band.links && band.links.length > 0 ? (
                <p className={styles.links}>
                  {band.links.map((link, j) => (
                    <a key={j} href={link.href} className={styles.link}>
                      {link.label}
                      <span className={styles.linkGlyph} aria-hidden="true">
                        ⟶
                      </span>
                    </a>
                  ))}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
