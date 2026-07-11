import type { Image as SanityImage } from "sanity";
import { urlFor } from "@/sanity/image";
import { DiplomiSlider, type ResolvedDiploma } from "./DiplomiSlider";
import styles from "./DiplomiSection.module.scss";

interface DiplomaDoc {
  _id: string;
  image: SanityImage;
  title: string;
  institution: string;
  year: number;
}

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
//
// CMS-wiring pass: diplomas come from the new `diploma` document type
// (replaces diplomiData.ts) — resolved to plain image URLs here (server
// component) so DiplomiSlider/DiplomiViewerModal (client components) keep
// their existing `fill`-mode <Image> usage unchanged.
export function DiplomiSection({
  kicker,
  heading,
  diplomas,
}: {
  kicker: string;
  heading: string;
  diplomas?: DiplomaDoc[];
}) {
  const resolved: ResolvedDiploma[] = (diplomas ?? []).map((d) => ({
    id: d._id,
    image: urlFor(d.image).width(800).url(),
    title: d.title,
    institution: d.institution,
    year: d.year,
  }));

  return (
    <section className={styles.diplomiSection} data-lab-section="diplomi">
      <DiplomiSlider kicker={kicker} heading={heading} diplomas={resolved} />
    </section>
  );
}
