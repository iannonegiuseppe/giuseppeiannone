import { RecognitionStage } from "./RecognitionStage";
import type { Vignette } from "./RecognitionHighlightList";
import styles from "./RecognitionSection.module.scss";

// [frasi da rivedere in co-autorialità con il cliente] — first person,
// present tense, everyday language, no clinical terms, no alarmism, no
// self-judgment verdicts, per docs/design-direction.md §9. Anti-testimonial
// rule (carried over from v2): no quotation marks around vignette text, no
// attribution of any kind (not even a placeholder name/age/profession) — a
// vignette is an inner voice, not a quoted person. `slug` is a FUTURE
// route slug, not a real href yet — the area label is non-interactive in
// v3 (see RecognitionHighlightList.tsx's own comment on why the old
// #di-cosa anchor was dropped, not just left unwired).
// `visual`: revision round 1, item 6 — placeholder abstract line-art SVGs
// (public/design-lab/recognition-visual-*.svg), one per VIGNETTE (5, not
// 4 — the spec says "one per area" but "Ansia" covers two vignettes here;
// generating 5 distinguishable visuals, one per vignette, satisfies both
// the literal "5... placeholders" count and "active vignette -> its
// visual" 1:1 requirement without collapsing the two Ansia vignettes onto
// one shared image). Final PNGs replace these paths later — see
// RecognitionBackgroundVisuals.tsx's own comment on the next/image `fill`
// + `cover` mechanism already being the real, final rendering path.
const vignettes: Vignette[] = [
  {
    id: "stress",
    vignette:
      "Mi sveglio già stanco, e la giornata non è ancora iniziata. Il caffè non aiuta; la lista delle cose da fare, invece, cresce da sola.",
    area: "Stress",
    slug: "stress",
    visual: "/design-lab/recognition-visual-stress.svg",
  },
  {
    id: "ansia-1",
    vignette:
      "Il cuore accelera senza un motivo apparente. Controllo che sia tutto a posto — ed è tutto a posto. Ma il corpo non ci crede.",
    area: "Ansia",
    slug: "ansia",
    visual: "/design-lab/recognition-visual-ansia-1.svg",
  },
  {
    id: "ansia-2",
    vignette:
      "La testa non si ferma mai, nemmeno la notte. Ripasso conversazioni, anticipo problemi che forse non arriveranno.",
    area: "Ansia",
    slug: "ansia",
    visual: "/design-lab/recognition-visual-ansia-2.svg",
  },
  {
    id: "depressione",
    vignette:
      "Rimando tutto, e poi mi sento in colpa. Le cose che prima mi davano piacere adesso chiedono solo energia.",
    area: "Depressione",
    slug: "depressione",
    visual: "/design-lab/recognition-visual-depressione.svg",
  },
  {
    id: "cambiamenti-di-vita",
    vignette:
      "Evito situazioni che prima non mi pesavano. Qualcosa è cambiato, ma non saprei dire esattamente quando.",
    area: "Cambiamenti di vita",
    slug: "cambiamenti-di-vita",
    visual: "/design-lab/recognition-visual-cambiamenti-di-vita.svg",
  },
];

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
export function RecognitionSection({
  kicker,
  heading,
  bridgeLine,
}: {
  kicker: string;
  heading: string;
  bridgeLine: string;
}) {
  return (
    <section className={styles.recognitionSection} data-lab-section="recognition">
      <RecognitionStage kicker={kicker} heading={heading} bridgeLine={bridgeLine} vignettes={vignettes} />
    </section>
  );
}
