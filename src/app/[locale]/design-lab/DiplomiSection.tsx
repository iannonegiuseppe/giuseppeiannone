import { DiplomiSlider } from "./DiplomiSlider";
import { diplomiData } from "./diplomiData";
import styles from "./design-lab.module.scss";

// Single-block pass: new section between Statement and Percorso. Cards
// are plain, always-rendered <button>s (no lightbox dependency here) —
// the lightbox library itself only loads lazily, on first click, from
// DiplomiSlider.tsx/DiplomiLightboxModal.tsx. See those files for the
// code-splitting mechanism.
// Revision round 2, item 3a: the header row (kicker/heading + prev/next
// arrows) moved into DiplomiSlider.tsx — the arrows control the SAME
// scrollable track that component owns, and "top-right of the section
// header row" means they render inline with the kicker/heading, not as a
// separate row above the slider. DiplomiSection.tsx now just supplies
// copy and the outer <section>.
export function DiplomiSection({ kicker, heading }: { kicker: string; heading: string }) {
  return (
    <section className={styles.diplomiSection} data-lab-section="diplomi">
      <DiplomiSlider kicker={kicker} heading={heading} diplomas={diplomiData} />
    </section>
  );
}
