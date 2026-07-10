import Image from "next/image";
import { IndexedListItem } from "./IndexedListItem";
import styles from "./ConcernsSection.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// Facts/states, never outcomes, per docs/design-direction.md §9 — no
// "superare"/"guarire"/"risolvere"/"eliminare"/"sconfiggere"/"liberarti"/
// "garantito"/"%" anywhere in this section. Sub-items name states and
// situations a person may be experiencing, not what will be achieved.
const areas = [
  {
    numeral: "01",
    title: "Ansia",
    subItems: ["Attacchi di panico", "Preoccupazione costante", "Ansia sociale"],
  },
  {
    numeral: "02",
    title: "Depressione",
    subItems: ["Stanchezza e demotivazione", "Calo dell'umore", "Isolamento"],
  },
  {
    numeral: "03",
    title: "Stress",
    subItems: ["Carico lavorativo", "Tensione fisica", "Difficoltà a staccare"],
  },
  {
    numeral: "04",
    title: "Cambiamenti di vita",
    subItems: ["Separazioni", "Transizioni lavorative", "Nuove fasi di vita"],
  },
];

// Single-block refinement pass: replaces the old sand-band 2x2 GroupBCard
// grid entirely (that markup is gone, not hidden — see the file-level
// comment on .concernsSection in sectionsShared.module.scss). Photo bleeds to
// the LEFT viewport edge, mirroring Come funziona's media zone. The "03"
// watermark is this section's slot in the site-wide numbered-section
// sequence (Chi sono=01, Come funziona=02, this=03) — unrelated to the
// areas' own 01-04 indexing below it, which is a separate, local list.
export function ConcernsSection({
  kicker,
  heading,
  linkLabel,
}: {
  kicker: string;
  heading: string;
  linkLabel: string;
}) {
  return (
    <section
      id="di-cosa"
      className={styles.concernsSection}
      data-lab-section="concerns"
      // Anchor target for RecognitionSection.tsx's "Ti riconosci?" rows —
      // id added this pass, purely an anchor point (no visual/behavioral
      // change to this section itself, verified byte-identical via
      // screenshot diff in that pass's final report).
    >
      <div className={styles.concernsLayout}>
        <div className={styles.concernsPhotoZone}>
          <Image
            src="/design-lab/03.webp"
            alt=""
            fill
            sizes="(min-width: 48rem) 40vw, 100vw"
            className={`${styles.concernsPhotoImg} ${sharedStyles.heroOverlapPhotoTreated}`}
          />
        </div>
        <div className={styles.concernsGridWrap}>
          <div className={styles.concernsContentZone}>
            <span className={styles.concernsNumeral} aria-hidden="true">
              03
            </span>
            <div className={styles.concernsContentInner}>
              <p className={styles.concernsKicker}>
                <span className={styles.concernsKickerRule} aria-hidden="true" />
                {kicker}
              </p>
              <h2 className={styles.concernsHeading}>{heading}</h2>
              <a href="#" className={styles.concernsArrowLink}>
                {linkLabel}
                <span className={styles.concernsArrowLinkGlyph} aria-hidden="true">
                  ⟶
                </span>
              </a>
              <ul className={styles.concernsList}>
                {areas.map((area) => (
                  <li key={area.title}>
                    <IndexedListItem
                      numeral={area.numeral}
                      title={area.title}
                      subItems={area.subItems}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
