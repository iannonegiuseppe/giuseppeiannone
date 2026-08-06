import styles from "./SubtopicEpigraph.module.scss";

// Subtopic template pass — the one-quote equivalent of PillarRecognition's
// six-item constellation, deliberately not built on top of it: a subtopic
// is already the specific thing, so there's exactly one quote, no label,
// no subtopic cross-link, no reveal-on-scroll stagger to coordinate across
// items. Renders null on an empty quote so a subtopic without one (none
// today, but the field isn't required at the document level the same way
// heroKicker is) doesn't leave an empty band.
export function SubtopicEpigraph({ quote }: { quote?: string }) {
  if (!quote) return null;

  return (
    <div className={styles.epigraph}>
      <p className={styles.quote}>{quote}</p>
    </div>
  );
}
