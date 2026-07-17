import styles from "./HopeSection.module.scss";

// New — global restyle pass. A short, static transitional band between
// Recognition ("Ti riconosci?") and How therapy helps: reassurance, not
// a claim of outcome. Deliberately minimal — eyebrow + one heading line,
// no photo, no body paragraph.
export function HopeSection({ eyebrow, heading }: { eyebrow: string; heading: string }) {
  return (
    <section className={styles.hopeSection} data-lab-section="hope" aria-labelledby="hope-heading">
      <div className={styles.hopeInner}>
        <p className={styles.hopeEyebrow}>{eyebrow}</p>
        <h2 id="hope-heading" className={styles.hopeHeading}>
          {heading}
        </h2>
      </div>
    </section>
  );
}
