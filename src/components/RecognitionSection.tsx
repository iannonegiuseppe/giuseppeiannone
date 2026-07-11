import type { Image as SanityImage } from "sanity";
import { urlFor } from "@/sanity/image";
import { RecognitionStage } from "./RecognitionStage";
import type { Vignette } from "./RecognitionHighlightList";
import styles from "./RecognitionSection.module.scss";

interface RecognitionVignetteDoc {
  id: string;
  vignette: string;
  area: string;
  slug: string;
  visualImage?: SanityImage;
}

// Placeholder abstract line-art SVGs (public/design-lab/recognition-visual-
// *.svg), one per vignette id — stays in code per homePage.recognition's
// own schema note (Stage A.4): the CMS field only OVERRIDES a given
// vignette's visual when an editor uploads a real photo, it doesn't own
// the fallback. Final PNGs replace a given id's entry here once supplied.
const FALLBACK_VISUALS: Record<string, string> = {
  stress: "/design-lab/recognition-visual-stress.svg",
  "ansia-1": "/design-lab/recognition-visual-ansia-1.svg",
  "ansia-2": "/design-lab/recognition-visual-ansia-2.svg",
  depressione: "/design-lab/recognition-visual-depressione.svg",
  "cambiamenti-di-vita": "/design-lab/recognition-visual-cambiamenti-di-vita.svg",
};

// v3 rebuild: the v2 autoplay crossfade slider is REMOVED entirely —
// timer, dots, the grid-stack fixed-height stage, hover/focus/offscreen
// pause matrix, all gone (see RecognitionHighlightList.tsx, a much
// smaller client island than RecognitionSlider.tsx was). The sr-only
// canonical list is also gone: v3's five vignettes are always-visible
// real content now, not hidden behind slider state, so a separate
// screen-reader-only copy would just be duplicate content. Still the
// ninth block of the page after the Part A reorder (see page.tsx).
//
// Revision round 2, item 4: RecognitionStage.tsx now owns the
// pinned-vs-non-pinned decision and both render branches — this
// component just supplies the section shell + copy + data.
//
// CMS-wiring pass: vignettes come from homePage.recognition.vignettes.
export function RecognitionSection({
  kicker,
  heading,
  bridgeLine,
  vignettes: rawVignettes,
}: {
  kicker: string;
  heading: string;
  bridgeLine: string;
  vignettes?: RecognitionVignetteDoc[];
}) {
  const vignettes: Vignette[] = (rawVignettes ?? []).map((v) => ({
    id: v.id,
    vignette: v.vignette,
    area: v.area,
    slug: v.slug,
    visual: v.visualImage ? urlFor(v.visualImage).url() : (FALLBACK_VISUALS[v.id] ?? ""),
  }));

  return (
    <section className={styles.recognitionSection} data-lab-section="recognition">
      <RecognitionStage kicker={kicker} heading={heading} bridgeLine={bridgeLine} vignettes={vignettes} />
    </section>
  );
}
