import type { Image as SanityImage } from "sanity";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { ChiSonoWatermark } from "./ChiSonoWatermark";
import styles from "./ChiSonoOverlap.module.scss";

function ArrowLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a href={href} className={`${styles.chiSonoArrowLink} ${className ?? ""}`}>
      {label}
      <span className={styles.chiSonoArrowLinkGlyph} aria-hidden="true">
        ⟶
      </span>
    </a>
  );
}

// Single-block refinement pass: a centered intro statement (Part 1) over a
// faint "Benvenuto" watermark, followed by a photo-with-offset-shadow
// composition beside a text column (Part 2) carrying its own "01"
// watermark numeral. Replaces the earlier pine-slab overlap composition
// entirely — see sectionsShared.module.scss's file-level comment on
// .chiSonoSection for what changed and why.
export function ChiSonoOverlap({
  introHeading,
  introLinkLabel,
  kicker,
  heading,
  bio,
  // Global restyle pass: MethodsOverlap ("Come funziona") was retired as
  // its own section — its approach/philosophy paragraph moves here as a
  // second paragraph rather than being dropped, since JourneySection now
  // owns the "How therapy helps" slot.
  methodsBody,
  storyLinkLabel,
  watermarkText,
  photo,
}: {
  introHeading: string;
  introLinkLabel: string;
  kicker: string;
  heading: string;
  bio: string;
  methodsBody?: string;
  storyLinkLabel: string;
  watermarkText?: string;
  photo?: SanityImage;
}) {
  // Image-quality diagnostic pass: dropped the urlFor(1200) cap — it was
  // capping below next/image's own retina candidate (1200 vs ~1400
  // needed at 2x DPR for this card's ~700px display width). Source
  // (1800px) comfortably covers it once next/image resizes from the raw
  // asset directly.
  const photoSrc = photo ? urlFor(photo).url() : "/design-lab/04.webp";

  return (
    <section className={styles.chiSonoSection} data-lab-section="chi-sono">
      <div className={styles.chiSonoIntro}>
        <div className={styles.chiSonoIntroHeadingWrap}>
          <ChiSonoWatermark text={watermarkText ?? "Benvenuto"} />
          <h2 className={styles.chiSonoIntroHeading}>{introHeading}</h2>
        </div>
        <ArrowLink
          href="#"
          label={introLinkLabel}
          className={styles.chiSonoIntroLink}
        />
      </div>

      <div className={styles.chiSonoBody}>
        <div className={styles.chiSonoPhotoStack}>
          {/* Correction pass: the corner-bracket experiment is gone —
              back to the established solid offset shadow-plate (same
              brand device as the final-CTA/Sedi panels) as the
              foundation, with the two thick accent bars framing the
              composition diagonally on top of it. */}
          <div className={styles.chiSonoPhotoShadow} aria-hidden="true" />
          {/* <div className={styles.chiSonoAccentTop} aria-hidden="true" /> */}
          {/* <div className={styles.chiSonoAccentBottom} aria-hidden="true" /> */}
          <div className={styles.chiSonoPhotoWrap}>
            <Image
              src={photoSrc}
              alt=""
              fill
              sizes="(min-width: 48rem) 50vw, 100vw"
              className={`${styles.chiSonoPhotoImg} ${styles.chiSonoPhotoDuotone}`}
            />
          </div>
        </div>
        <div className={styles.chiSonoTextCard}>
          <span className={styles.chiSonoTextNumeral} aria-hidden="true">
            01
          </span>
          <div className={styles.chiSonoTextContent}>
            <p className={styles.chiSonoKicker}>
              <span className={styles.chiSonoKickerRule} aria-hidden="true" />
              {kicker}
            </p>
            <h2 className={styles.chiSonoHeading}>{heading}</h2>
            <p className={styles.chiSonoBio}>{bio}</p>
            {methodsBody ? <p className={styles.chiSonoMethodsBody}>{methodsBody}</p> : null}
            <ArrowLink
              href="#"
              label={storyLinkLabel}
              className={styles.chiSonoStoryLink}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
