import type { Image as SanityImage } from "sanity";
import Image from "next/image";
import { HeroCta } from "./HeroCta";
import { HeroVideo } from "./HeroVideo";
import { urlFor } from "@/sanity/image";
import styles from "./HeroOverlap.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// Hero — full-height pass: the section is full-viewport again (both
// breakpoints), but unlike the old Williamson-style overlap this replaced
// two passes ago, the photo itself is a bounded, contained box (the
// background-free cutout), pinned to the bottom edge and capped so it
// never reaches the fixed header (see --header-height in _tokens.scss).
// At lg+ it's an ordinary grid item, side by side with the text column
// (photo bottom-aligned via align-self, text vertically centered).
// Below lg, the photo becomes a full-bleed absolute layer again and the
// text overlays it, bottom-anchored, sitting on the strong part of the
// ivory dissolve gradient below — the one thing carried over from the
// old mobile-only "overlap" treatment, now serving a different purpose
// (hiding the cutout's own hard crop edge, not laying text over a real
// photo's background).
//
// Only the ONE headline word an editor names in headlineEmphasisWord
// (Studio field) is wrapped in the site's real italic-accent emphasis span
// (EB Garamond italic + --color-accent — the exact technique documented in
// /styleguide). Matches only the first occurrence, case-sensitively, per
// the schema field's own description — a plain substring split, not a
// regex, so no special-character escaping concern for ordinary Italian copy.
function renderHeadline(headline: string, emphasisWord: string | undefined, emphasisClassName: string | undefined) {
  if (!emphasisWord) return headline;
  const index = headline.indexOf(emphasisWord);
  if (index === -1) return headline;
  const before = headline.slice(0, index);
  const after = headline.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={emphasisClassName}>{emphasisWord}</em>
      {after}
    </>
  );
}

export function HeroOverlap({
  treatment,
  label,
  headline,
  headlineEmphasisWord,
  positioningStatement,
  ctaLabel,
  photo,
  youtubeId,
}: {
  treatment: "raw" | "treated";
  // Internal review annotation only (e.g. "Hero — approved") — omitted
  // entirely once the route reads as a clean client-facing preview.
  label?: string;
  headline: string;
  // Must match one word inside `headline` exactly — see homePage.ts's
  // own schema description. Optional: no match (or no value) renders the
  // headline as plain text, no emphasis applied.
  headlineEmphasisWord?: string;
  positioningStatement: string;
  ctaLabel: string;
  photo?: SanityImage;
  // When set, a click-to-play YouTube embed appears over the photo below
  // instead of the plain static image — see HeroVideo.tsx.
  youtubeId?: string;
}) {
  const photoClassName =
    treatment === "treated"
      ? `${styles.heroOverlapPhotoImg} ${sharedStyles.heroOverlapPhotoTreated}`
      : styles.heroOverlapPhotoImg;
  // Hero — finish it pass: the real photo is now a background-free PNG
  // cutout, uploaded via Studio. Requesting it explicitly as WebP (rather
  // than a bare auto=format path) keeps the choice deterministic —
  // content-negotiated auto=format can fall back to JPEG when the
  // upstream fetch doesn't carry the visitor's own Accept header, which
  // would flatten the alpha channel to a solid background. WebP supports
  // alpha and is requested unconditionally here. No .width() cap, same
  // reasoning as the image-quality diagnostic pass this comment used to
  // describe: next/image resizes from the source's true resolution.
  const photoSrc = photo ? urlFor(photo).format("webp").url() : "/design-lab/01.webp";
  const photoSizes = "(min-width: 64rem) 40vw, 100vw";

  return (
    <section className={styles.heroOverlapSection} data-lab-section={`hero-${treatment}`}>
      {label ? <p className={styles.heroOverlapLabel}>{label}</p> : null}
      <div className={styles.heroOverlap}>
        <div className={styles.heroOverlapPhotoWrap}>
          {youtubeId ? (
            <HeroVideo
              youtubeId={youtubeId}
              photoSrc={photoSrc}
              photoClassName={photoClassName}
              sizes={photoSizes}
            />
          ) : (
            <Image
              src={photoSrc}
              alt=""
              fill
              priority
              sizes={photoSizes}
              className={photoClassName}
            />
          )}
        </div>
        {/* Full-height pass: fades the photo's bottom edge into the page
            background — both to melt the hero into the next section with
            no seam, and (the load-bearing reason) to dissolve the
            cutout's own hard horizontal crop across the chest, which
            would otherwise read as a plainly visible straight line now
            that the photo is pinned to the bottom edge. Sits above the
            photo, below the text, in stacking order (see the module's
            own z-index comments). */}
        <div className={styles.heroOverlapGradient} aria-hidden="true" />
        <div className={styles.heroOverlapTextInner}>
          <h1 className={styles.heroOverlapName}>
            {renderHeadline(headline, headlineEmphasisWord, styles.heroOverlapEmphasis)}
          </h1>
          <p className={styles.heroOverlapSubtitle}>{positioningStatement}</p>
          <HeroCta href="#contatto" className={`${styles.btnPrimary} ${styles.heroOverlapCta}`}>
            {ctaLabel}
          </HeroCta>
        </div>
      </div>
    </section>
  );
}
