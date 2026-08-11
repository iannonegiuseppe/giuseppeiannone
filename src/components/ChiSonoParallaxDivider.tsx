import { ParallaxFrameStatic } from "@/components/ParallaxFrameStatic";
import styles from "./ChiSonoParallaxDivider.module.scss";

// Substring-match emphasis, same technique as PillarHero.tsx's own
// renderEmphasis — duplicated per this codebase's established convention
// for small single-purpose helpers (see that file's own comment).
function renderEmphasis(text: string | undefined, emphasisWord: string | undefined) {
  if (!text) return null;
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={styles.emphasis}>{emphasisWord}</em>
      {after}
    </>
  );
}

// Chi sono full rebuild — block 4, the parallax divider between "Di cosa
// mi occupo" and "Come lavoro". Wraps ParallaxFrameStatic (the site's
// existing CSS-only fixed-background reveal — no scroll listener, no
// Lenis subscription, see that component's own file for the mechanism)
// with a centred scrim + text overlay, same layered structure as
// PillarHero's own heroScrim/heroContent.
//
// imageUrl is a plain public/ path, not a Sanity field: this is an
// explicitly placeholder image (see page.tsx's own comment on which file
// and why), and the brief calls for "an image already in the repo or in
// Sanity — not one of the seven pillar hero images", not necessarily an
// editorial field.
//
// short: a second use of this same component, between Diplomi and
// Publications (page.tsx's lightIslandMiddle) — same scrim/frame
// treatment, capped much shorter (max 450px desktop) since it's a
// breather between two light sections, not a standalone full passage
// like the original (block 5, between credentials and timeline, still
// its default un-capped height — unaffected, short defaults to false).
// Caps ParallaxFrameStatic's own height directly via its className prop
// rather than relying on its default aspect-ratio: 10/4, which alone
// would render 576px tall at a 1440px viewport.
export function ChiSonoParallaxDivider({
  line1,
  emphasisWord,
  line2,
  markerLabel,
  imageUrl,
  short,
}: {
  line1?: string;
  emphasisWord?: string;
  line2?: string;
  markerLabel?: string;
  imageUrl: string;
  short?: boolean;
}) {
  return (
    <div className={styles.divider}>
      <ParallaxFrameStatic imageUrl={imageUrl} imageAlt="" className={short ? styles.shortFrame : undefined} />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.content}>
        {line1 ? <p className={styles.line1}>{renderEmphasis(line1, emphasisWord)}</p> : null}
        {line2 ? <p className={styles.line2}>{line2}</p> : null}
        {markerLabel ? (
          <p className={styles.marker}>
            <span aria-hidden="true">↓ </span>
            {markerLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
