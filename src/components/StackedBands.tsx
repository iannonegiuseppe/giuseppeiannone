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
export function StackedBands({
  tone,
  bands,
}: {
  tone: "bg" | "surface";
  bands: StackedBand[];
}) {
  const toneClass = tone === "surface" ? styles.toneSurface : styles.toneBg;

  return (
    <section className={`${styles.section} ${toneClass}`} data-sheen="upper-left">
      <div className={styles.inner}>
        {bands.map((band, i) => (
          <div
            key={i}
            className={[
              styles.band,
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
