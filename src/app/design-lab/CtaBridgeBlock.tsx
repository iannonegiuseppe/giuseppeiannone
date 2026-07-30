import densityStyles from "./density/density.module.scss";
import styles from "./ctaBridgeBlock.module.scss";

// Item 7: standalone reproduction of the real CtaBridgeSection — same
// reasoning as every other "real component needs a different register on
// this page" case (Metodo, Chi sono, Video). The real component's own
// quiet, centered typographic pause read as weak between the zigzag, the
// credentials band, and the marquee. Same copy, same real data, same
// #contatto anchor target — register changed: full container width,
// left-aligned, display-scale headline, the link as one oversized
// underlined element instead of a small arrow-link.
function renderEmphasis(text: string, emphasisWord: string | undefined, emphasisClassName: string) {
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={emphasisClassName}>{emphasisWord}</em>
      {after}
    </>
  );
}

export function CtaBridgeBlock({
  title,
  titleEmphasis,
  body,
  linkLabel,
}: {
  title: string;
  titleEmphasis?: string;
  body: string;
  linkLabel: string;
}) {
  if (!title || !linkLabel) return null;

  // Tonal-scale pass: moved to tone-deep. Checked the existing hierarchy
  // first (per that pass's own explicit instruction) — heading is
  // --fs-display (a huge display size) against body's --fs-body-lg, a
  // dramatic size gap already carrying the hierarchy on its own; the
  // color difference (text vs. text-muted) was never load-bearing here.
  // Both collapse to the same ivory on deep (per Phase 1's own finding
  // that tone-deep can't support a distinct muted step) and the block
  // still reads as heading-then-body at a glance — no rebuild needed.
  // .emphasis/.link still read as distinct via italic and
  // underline+size respectively, not color, same reasoning.
  return (
    <section className={densityStyles.toneDeepSection} aria-labelledby="cta-bridge-block-title">
      <div className={densityStyles.toneDeepGrain} aria-hidden="true" />
      <div className={`${densityStyles.section} ${densityStyles.toneDeepContent}`}>
        <h2 id="cta-bridge-block-title" className={styles.heading}>
          {renderEmphasis(title, titleEmphasis, styles.emphasis!)}
        </h2>
        {body ? <p className={styles.body}>{body}</p> : null}
        <a href="#contatto" className={styles.link}>
          {linkLabel}
          <span aria-hidden="true" className={styles.linkGlyph}>
            →
          </span>
        </a>
      </div>
    </section>
  );
}
