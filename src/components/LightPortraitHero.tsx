import Image from "next/image";
import type { CSSProperties } from "react";
import type { Image as SanityImage } from "sanity";
import { imageDimensions, urlFor } from "@/sanity/image";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ShimmerText } from "@/components/ShimmerText";
import styles from "./LightPortraitHero.module.scss";

// Extracted verbatim from BlogIndexView.tsx's own inline hero section (the
// Cyprus VIP Estates blog-index reference: light ivory hero, cut-out
// portrait, radial glow) — /faq build pass, reused as-is, not restyled,
// per explicit instruction. Every class below is a byte-for-byte copy of
// blogIndex.module.scss's own .hero/.heroInner/.heroText/.heroTitle/
// .heroIntro/.heroVisual* rules (verified via a before/after rendered-HTML
// diff on /blog itself — see this pass's own report). blogIndex.module.scss
// is left untouched, including its now-unused hero classes — same
// orphan-not-delete precedent this codebase already uses elsewhere.
//
// One intentional, invisible-to-output change: the kicker rule now goes
// through the shared SectionKicker component instead of a hand-rolled
// <span>. SectionKicker exists specifically to be a drop-in for this exact
// geometry (width/height/background copied byte-for-byte from this same
// family of kickers, per its own module comment) — the only difference is
// pointer-events:none on the (aria-hidden, decorative) rule itself, which
// has no visible or layout effect. Confirmed via the same rendered-HTML
// diff.
//
// One additive, opt-in prop beyond what /blog ever passes: `metaLine`, an
// optional line rendered after the intro (used by /faq for its computed
// "N questions across N topics" count). Blog never passes it, so blog's
// own rendered output is provably unaffected by its existence.
export interface LightPortraitHeroProps {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  // /faq gold-shimmer pass — opt-in only, so /blog's existing static-italic
  // headingEmphasisWord callers (blogIndex.headingEmphasisWord,
  // contactSection.headingEmphasisWord) are byte-for-byte unaffected. Only
  // a caller that explicitly passes true gets the animated ShimmerText
  // treatment instead of the plain <em>.
  headingEmphasisAnimated?: boolean;
  intro?: string;
  metaLine?: string;
  photo?: (SanityImage & { alt?: string }) | undefined;
  priority?: boolean;
  // Opt-in only (see .heroVisualFrame's own comment) — unset renders the
  // same 22rem/34rem sizing blog has always had. 1 = full size, 0.85 = 15%
  // smaller, etc.
  photoScale?: number;
  // Mobile-hero-transplant pass (/libri precedent) — opt-in only, exactly
  // like photoScale/metaLine above: /blog never passes this, so its own
  // render is provably unaffected (the attribute is omitted from the DOM
  // entirely when unset, not just visually inert — see the section's own
  // data attribute below). /faq passes it: the photo it renders is a real
  // still-life photograph (not a transparent cut-out), which is what
  // makes a full-bleed cover crop safe here — see this pass's own report
  // for why /blog's own cut-out portrait was excluded instead.
  mobileFullBleed?: boolean;
  // Second, DIFFERENT mobile treatment — for a transparent cut-out figure
  // rather than a rectangular photograph (mobileFullBleed's object-fit:
  // cover assumes a photo that fills its own canvas edge-to-edge; a
  // cut-out cropped that way either crops through the subject or exposes
  // empty transparent canvas — see this pass's own report for why /blog
  // needed a different answer, not mobileFullBleed reused). The figure
  // anchors to the section's bottom edge at its own natural aspect ratio
  // instead of being cropped to fill the frame; copy is allowed to
  // overlap its lower half (shoulders/chest), never the face. Opt-in,
  // same "unset = today's behavior" convention as every other prop here.
  // No current caller passes this — /blog used it until the
  // cutoutGrounded pass below superseded it there; kept, not deleted (see
  // that prop's own comment), in case a future cutout wants THIS
  // treatment (overlap, not flush) instead.
  mobileCutoutAnchor?: boolean;
  // Grounded-cutout pass (/blog only) — direct instruction: the photo's
  // own bottom edge (a straight horizontal cut in the source) must sit
  // flush with the SECTION's own bottom edge at every width, with no
  // frame/glow/background around it. This supersedes mobileCutoutAnchor's
  // own bottom alignment at mobile (that treatment deliberately overlaps
  // text INTO the image from below via a negative margin, so the image's
  // own bottom never reaches the section's own bottom) without deleting
  // that block — same orphan-not-delete precedent this file's own top
  // comment already established, and /faq never used mobileCutoutAnchor to
  // begin with. See LightPortraitHero.module.scss's own comment on
  // [data-cutout-grounded] for the CSS.
  cutoutGrounded?: boolean;
}

function renderHeadingWithEmphasis(
  heading: string,
  emphasisWord: string | undefined,
  emphasisClassName: string,
  animated: boolean | undefined,
) {
  const index = emphasisWord ? heading.indexOf(emphasisWord) : -1;
  if (!emphasisWord || index === -1) return heading;
  return (
    <>
      {heading.slice(0, index)}
      {animated ? (
        <ShimmerText>{emphasisWord}</ShimmerText>
      ) : (
        <em className={emphasisClassName}>{emphasisWord}</em>
      )}
      {heading.slice(index + emphasisWord.length)}
    </>
  );
}

export function LightPortraitHero({
  kicker,
  heading,
  headingEmphasisWord,
  headingEmphasisAnimated,
  intro,
  metaLine,
  photo,
  priority,
  photoScale,
  mobileFullBleed,
  mobileCutoutAnchor,
  cutoutGrounded,
}: LightPortraitHeroProps) {
  const dims = photo ? imageDimensions(photo) : null;

  // Header-over-light-hero pass: this bare boolean attribute is the
  // hero's own declaration that it's light — HeaderInteractive.module.scss
  // reacts to it via `body:has([data-light-hero])`, applying the header's
  // collapsed appearance from first paint. No route list, no context, no
  // JS coordination: any future page rendering this component is correct
  // automatically, the same way any page NOT rendering it is unaffected.
  // See that file's own comment on the selector for what "reacts" means
  // precisely.
  return (
    <section
      className={styles.hero}
      data-light-hero
      data-mobile-full-bleed={mobileFullBleed || undefined}
      data-mobile-cutout-anchor={mobileCutoutAnchor || undefined}
      data-cutout-grounded={cutoutGrounded || undefined}
    >
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroText}>
          <p className={styles.kickerRow}>
            <SectionKicker>
              <span className={styles.kicker}>{kicker}</span>
            </SectionKicker>
          </p>
          <h1 className={styles.heroTitle}>
            {renderHeadingWithEmphasis(
              heading,
              headingEmphasisWord,
              styles.heroTitleEmphasis!,
              headingEmphasisAnimated,
            )}
          </h1>
          {intro ? <p className={styles.heroIntro}>{intro}</p> : null}
          {metaLine ? <p className={styles.heroMetaLine}>{metaLine}</p> : null}
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <div
            className={styles.heroVisualFrame}
            style={photoScale ? ({ "--hero-visual-scale": photoScale } as CSSProperties) : undefined}
          >
            <div className={styles.heroVisualGlow} />
            {photo && dims ? (
              <Image
                src={urlFor(photo).width(900).url()}
                alt=""
                width={dims.width}
                height={dims.height}
                sizes="(min-width: 64rem) 34rem, 60vw"
                className={styles.heroVisualImg}
                priority={priority}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
