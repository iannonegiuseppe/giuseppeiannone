import type { Image as SanityImage } from "sanity";
import Image from "next/image";
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
export function HeroOverlap({
  treatment,
  label,
  authorName,
  authorCredentials,
  positioningStatement,
  ctaLabel,
  registrationNumber,
  photo,
}: {
  treatment: "raw" | "treated";
  // Internal review annotation only (e.g. "Hero — approved") — omitted
  // entirely once the route reads as a clean client-facing preview.
  label?: string;
  authorName: string;
  authorCredentials?: string;
  positioningStatement: string;
  ctaLabel: string;
  registrationNumber?: string;
  photo?: SanityImage;
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

  return (
    <section className={styles.heroOverlapSection} data-lab-section={`hero-${treatment}`}>
      {label ? <p className={styles.heroOverlapLabel}>{label}</p> : null}
      <div className={styles.heroOverlap}>
        <div className={styles.heroOverlapPhotoWrap}>
          <Image
            src={photoSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 64rem) 100vw, 100vw"
            className={photoClassName}
          />
        </div>
        <div className={styles.heroOverlapContent}>
          <div className={styles.heroOverlapTextInner}>
            <p className={styles.heroOverlapEyebrow}>{authorCredentials ?? "Psicologo Psicoterapeuta"}</p>
            <h1 className={styles.heroOverlapName}>{authorName}</h1>
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
