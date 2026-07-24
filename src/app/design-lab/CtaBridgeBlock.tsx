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

  return (
    <section className={densityStyles.section} aria-labelledby="cta-bridge-block-title">
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
    </section>
  );
}
