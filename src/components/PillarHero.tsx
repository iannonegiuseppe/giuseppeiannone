import Image from "next/image";
import type { CSSProperties } from "react";
import type { Image as SanityImage } from "sanity";
import type { BreadcrumbItem } from "@/sanity/breadcrumbs";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { ShimmerText } from "@/components/ShimmerText";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { imageDimensions, urlFor } from "@/sanity/image";
import styles from "./PillarHero.module.scss";

// Substring-match emphasis technique, same as HeroOverlap.tsx's own
// renderHeadline / RecognitionSection.tsx's own renderEmphasis — duplicated
// per this codebase's established convention for small single-purpose
// helpers rather than shared, see those two files' own comments.
//
// shimmer is opt-in (chi sono pass 3) — every other pillar/subtopic
// caller omits it and keeps the plain, static <em> unchanged. Not
// defaulted to true for all of them: that's a real, unreviewed visual
// change to seven other pages this pass never looked at or
// screenshotted, out of scope for what was actually asked.
function renderEmphasis(text: string, emphasisWord: string | undefined, shimmer: boolean | undefined) {
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  const emphasis = shimmer ? (
    <ShimmerText className={styles.titleEmphasis}>{emphasisWord}</ShimmerText>
  ) : (
    <em className={styles.titleEmphasis}>{emphasisWord}</em>
  );
  return (
    <>
      {before}
      {emphasis}
      {after}
    </>
  );
}

export function PillarHero({
  trail,
  heroKicker,
  title,
  titleEmphasisWord,
  standfirst,
  heroImage,
  imageObjectPosition,
  imageZoom,
  imageShiftX,
  imageShiftY,
  contentAlign,
  titleEmphasisShimmer,
  kickerRule,
}: {
  trail: BreadcrumbItem[];
  heroKicker: string;
  title: string;
  titleEmphasisWord?: string;
  // Chi sono pass — optional now: that route has no field equivalent to
  // a pillar's own standfirst (chiSonoSection's closest candidate, the
  // pull quote, is explicitly placed in the body instead — see that
  // route's own page.tsx comment), so this renders kicker + title only
  // rather than inventing a lead line. Every existing pillar page still
  // passes a real standfirst and is unaffected.
  standfirst?: string;
  heroImage?: (SanityImage & { alt?: string }) | undefined;
  // Chi sono fix — optional, lg+ only (see PillarHero.module.scss's own
  // .heroImage rule): every other pillar/subtopic caller omits this and
  // keeps the existing 50% 50% center crop byte-for-byte. chi-sono's
  // portrait is close to square, cropped into a much wider landscape
  // band — centering there crops into the top of the head. A free-form
  // string (not a token/enum) because the right value is specific to
  // this one photo's own composition, not a reusable design choice.
  imageObjectPosition?: string;
  // Chi sono pass 5 — optional, lg+ only, same scoping as
  // imageObjectPosition. Moving ChiSonoGlassCard to the hero's left side
  // (freeing the right for the portrait's face) put the subject's own
  // gesturing hand behind the card instead — object-position alone can't
  // fix this, since this photo's aspect ratio already matches the hero
  // band's own width exactly (verified live: 0%/50%/100%
  // object-position-x render pixel-identical, zero horizontal crop
  // margin to redistribute). Enlarging the image beyond object-fit:cover's
  // own minimum (imageZoom) creates that margin; imageShiftX/Y then
  // redistribute it, carrying the whole photo — subject included — right
  // and down within the frame. Every other caller omits all three and
  // gets the previous scale(1)/no-shift behavior unchanged (see
  // PillarHero.module.scss's own var(...,1)/var(...,0%) fallbacks).
  imageZoom?: number;
  imageShiftX?: string;
  imageShiftY?: string;
  // Chi sono pass 4 — optional, lg+ only, same scoping as
  // imageObjectPosition above. Left-aligns .heroContent to the same left
  // edge mixins.container gives every other section on the page
  // (max(var(--space-7), calc((100vw - var(--container-max-width))/2 +
  // var(--space-7))) — the exact formula, not a guess, since
  // .heroContent doesn't use the container mixin itself), instead of
  // centered in the full band width. Vertical position is untouched —
  // stays the base rule's own align-items:center. An earlier version of
  // this prop also bottom-anchored the text (to dodge ChiSonoGlassCard);
  // reverted per direct instruction — left-alignment already keeps clear
  // of the card horizontally (see .heroBand's own lg/xl max-width tier
  // below for the narrower-viewport case), so the vertical move was
  // never actually necessary. Every other caller omits this and keeps
  // the existing centered layout unchanged.
  contentAlign?: "left";
  // Chi sono pass 3 — see renderEmphasis's own comment above for why
  // this is opt-in rather than the new default for every caller.
  titleEmphasisShimmer?: boolean;
  // Chi sono pass 4 — optional. Every other pillar/subtopic caller
  // renders heroKicker as plain text and keeps that unchanged; chi-sono
  // wraps it in the same shared SectionKicker (rule + --color-accent)
  // every other kicker on the site already uses.
  kickerRule?: boolean;
}) {
  const dims = heroImage ? imageDimensions(heroImage) : null;
  // Capped at the source's own natural width — never upscale (same
  // reasoning as the article route's own requestWidth, portableTextComponents.tsx's
  // image renderer). No .height() alongside it: this is `fill` +
  // object-fit:cover, so the browser does all the actual cropping
  // responsively — asking Sanity to ALSO crop server-side to a fixed
  // height was a real bug (forced an unrelated 16:9 ratio onto whatever
  // aspect the source actually is, on top of the upscale).
  const requestWidth = dims ? Math.min(dims.width, 2400) : undefined;

  return (
    <div className={styles.heroBand} data-content-align={contentAlign}>
      {heroImage && dims ? (
        <Image
          src={urlFor(heroImage).width(requestWidth!).url()}
          alt={heroImage.alt ?? ""}
          fill
          sizes="100vw"
          className={styles.heroImage}
          priority
          style={
            {
              ...(imageObjectPosition ? { "--hero-image-object-position-lg": imageObjectPosition } : {}),
              ...(imageZoom !== undefined ? { "--hero-image-zoom-lg": imageZoom } : {}),
              ...(imageShiftX ? { "--hero-image-shift-x-lg": imageShiftX } : {}),
              ...(imageShiftY ? { "--hero-image-shift-y-lg": imageShiftY } : {}),
            } as CSSProperties
          }
        />
      ) : null}
      {/* Scrim only when there's a photo underneath — with no heroImage the
          section's own flat --color-accent fill (page.module.scss) already
          holds the same measured contrast, so an extra scrim layer over a
          flat color would just be a redundant tint. See PillarHero.module.scss
          for the arithmetic, reused verbatim from the blog article route's
          own cover header. */}
      {heroImage && dims ? <div className={styles.heroScrim} aria-hidden="true" /> : null}
      {heroImage && dims ? <div className={styles.heroFade} aria-hidden="true" /> : null}
      <div className={styles.heroContent} data-photo-hero={heroImage && dims ? true : undefined}>
        <div className={styles.breadcrumbs}>
          <Breadcrumbs trail={trail} />
        </div>
        <p className={styles.kicker}>
          {kickerRule ? <SectionKicker>{heroKicker}</SectionKicker> : heroKicker}
        </p>
        <h1 className={styles.title}>{renderEmphasis(title, titleEmphasisWord, titleEmphasisShimmer)}</h1>
        {standfirst ? <p className={styles.standfirst}>{standfirst}</p> : null}
      </div>
    </div>
  );
}
