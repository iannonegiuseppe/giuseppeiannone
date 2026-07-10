import Image from "next/image";
import styles from "./design-lab.module.scss";

// Williamson-style overlap hero: the photo bleeds full-width behind the
// section, the text column sits on top of the photo's own empty
// background space (not on the subject) rather than beside it in a
// split layout. Mobile drops the overlap entirely (see the breakpoint
// rules in design-lab.module.scss) — stacked photo-then-text, since
// there's no safe empty space to lay text over at narrow widths.
//
// Group B refinement pass: text column now snaps to the shared 12-col
// grid (columns 7-12), vertically centered against the photo. Order per
// spec 2.1: eyebrow -> name -> subtitle -> CTA -> registration line
// (previously credentials sat BELOW the name; the "credentials" line IS
// the eyebrow, just reordered and restyled, not a new field).
export function HeroOverlap({
  treatment,
  label,
}: {
  treatment: "raw" | "treated";
  // Internal review annotation only (e.g. "Hero — approved") — omitted
  // entirely once the route reads as a clean client-facing preview.
  label?: string;
}) {
  const photoClassName =
    treatment === "treated"
      ? `${styles.heroOverlapPhotoImg} ${styles.heroOverlapPhotoTreated}`
      : styles.heroOverlapPhotoImg;

  return (
    <section className={styles.heroOverlapSection} data-lab-section={`hero-${treatment}`}>
      {label ? <p className={styles.heroOverlapLabel}>{label}</p> : null}
      <div className={styles.heroOverlap}>
        <div className={styles.heroOverlapPhotoWrap}>
          <Image
            src="/design-lab/01.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 64rem) 100vw, 100vw"
            className={photoClassName}
          />
        </div>
        <div className={styles.heroOverlapContent}>
          <div className={styles.heroOverlapTextInner}>
            <p className={styles.heroOverlapEyebrow}>Psicologo Psicoterapeuta</p>
            <h1 className={styles.heroOverlapName}>Giuseppe Iannone</h1>
            <p className={styles.heroOverlapSubtitle}>
              Uno spazio calmo per affrontare ciò che pesa, con metodo e senza
              fretta.
            </p>
            <a href="#" className={`${styles.btnPrimary} ${styles.heroOverlapCta}`}>
              Prenota un primo colloquio
            </a>
            <p className={styles.heroOverlapRegistration}>
              Iscrizione all&apos;Albo degli Psicologi n. [segnaposto]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
