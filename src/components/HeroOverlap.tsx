import type { Image as SanityImage } from "sanity";
import Image from "next/image";
import { HeroVideo } from "./HeroVideo";
import { urlFor } from "@/sanity/image";
import styles from "./HeroOverlap.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// Williamson-style overlap hero: the photo bleeds full-width behind the
// section, the text column sits on top of the photo's own empty
// background space (not on the subject) rather than beside it in a
// split layout. Mobile drops the overlap entirely (see the breakpoint
// rules in sectionsShared.module.scss) — stacked photo-then-text, since
// there's no safe empty space to lay text over at narrow widths.
//
// Group B refinement pass: text column now snaps to the shared 12-col
// grid (columns 7-12), vertically centered against the photo. Order per
// spec 2.1: eyebrow -> name -> subtitle -> CTA -> registration line
// (previously credentials sat BELOW the name; the "credentials" line IS
// the eyebrow, just reordered and restyled, not a new field).
//
// CMS-wiring pass: eyebrow/name/registration line come from
// siteSettings.author (already the single source of truth for that
// identity, per homePage.hero's own schema description) rather than being
// re-entered as homepage-local fields; positioningStatement/ctaLabel/photo
// come from homePage.hero. Falls back to the original placeholder photo
// path when no CMS photo is set yet.
//
// Mobile hero revision (<=767px only — see HeroOverlap.module.scss's own
// comments for the full breakpoint-by-breakpoint reasoning): the photo
// now fills the full viewport height (100dvh) and the text block sits
// absolutely-positioned at the bottom, over a gradient dissolving the
// photo into --color-bg. Desktop (>=1024px) and tablet (768-1023px) are
// UNCHANGED — every new rule is gated to the mobile tier, with an
// explicit breakpoint-up(md) reset back to the original tablet values
// wherever this pass touches a class tablet already used.
// Header/hero restyle pass: splits the headline on the ONE word an
// editor names in headlineEmphasisWord (Studio field), wrapping just
// that occurrence in the site's real italic-accent emphasis span (EB
// Garamond italic + --color-accent — the exact technique documented in
// /styleguide, applied here for the first time anywhere live). Matches
// only the first occurrence, case-sensitively, per the schema field's
// own description — a plain substring split, not a regex, so no special-
// character escaping concern for ordinary Italian copy.
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
  authorCredentials,
  headline,
  headlineEmphasisWord,
  positioningStatement,
  ctaLabel,
  registrationNumber,
  photo,
  youtubeId,
}: {
  treatment: "raw" | "treated";
  // Internal review annotation only (e.g. "Hero — approved") — omitted
  // entirely once the route reads as a clean client-facing preview.
  label?: string;
  authorCredentials?: string;
  headline: string;
  // Must match one word inside `headline` exactly — see homePage.ts's
  // own schema description. Optional: no match (or no value) renders the
  // headline as plain text, no emphasis applied.
  headlineEmphasisWord?: string;
  positioningStatement: string;
  ctaLabel: string;
  registrationNumber?: string;
  photo?: SanityImage;
  // When set, a click-to-play YouTube embed appears over the photo below
  // instead of the plain static image — see HeroVideo.tsx.
  youtubeId?: string;
}) {
  const photoClassName =
    treatment === "treated"
      ? `${styles.heroOverlapPhotoImg} ${sharedStyles.heroOverlapPhotoTreated}`
      : styles.heroOverlapPhotoImg;
  // Image-quality diagnostic pass: no .width() here — urlFor's own resize
  // was capping BELOW next/image's own responsive candidates (e.g. this
  // hero's srcset asks for up to 1920w at retina, but a urlFor(1600) cap
  // silently capped every candidate at 1600, serving a same-density image
  // into a slot that wanted more). next/image resizes from the raw asset
  // itself now, so it can serve up to the source's own true resolution
  // (1800px here — still short of the ~2880px a full-bleed 100vw hero
  // wants at 2x DPR; the source itself needs a larger owner re-upload,
  // no pipeline fix closes that gap, see this pass's own report).
  const photoSrc = photo ? urlFor(photo).url() : "/design-lab/01.webp";
  const photoSizes = "(min-width: 64rem) 100vw, 100vw";

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
          {/* Mobile-only revision: bottom-anchored gradient dissolving
              the photo into --color-bg so the text block below sits on
              solid ivory, not photo texture. display:none above mobile
              (see .heroOverlapMobileGradient) — tablet/desktop keep the
              plain photo, no scrim. */}
          <div className={styles.heroOverlapMobileGradient} aria-hidden="true" />
        </div>
        <div className={styles.heroOverlapContent}>
          <div className={styles.heroOverlapTextInner}>
            <p className={styles.heroOverlapEyebrow}>{authorCredentials ?? "Psicologo Psicoterapeuta"}</p>
            <h1 className={styles.heroOverlapName}>
              {renderHeadline(headline, headlineEmphasisWord, styles.heroOverlapEmphasis)}
            </h1>
            <p className={styles.heroOverlapSubtitle}>{positioningStatement}</p>
            <a href="#" className={`${styles.btnPrimary} ${styles.heroOverlapCta}`}>
              {ctaLabel}
            </a>
            <p className={styles.heroOverlapRegistration}>
              Iscrizione all&apos;Albo degli Psicologi n. {registrationNumber ?? "[segnaposto]"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
