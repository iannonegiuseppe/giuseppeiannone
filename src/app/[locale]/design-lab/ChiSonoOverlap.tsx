import Image from "next/image";
import { ChiSonoWatermark } from "./ChiSonoWatermark";
import styles from "./design-lab.module.scss";

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
// entirely — see design-lab.module.scss's file-level comment on
// .chiSonoSection for what changed and why.
export function ChiSonoOverlap({
  introHeading,
  introLinkLabel,
  kicker,
  heading,
  bio,
  storyLinkLabel,
}: {
  introHeading: string;
  introLinkLabel: string;
  kicker: string;
  heading: string;
  bio: string;
  storyLinkLabel: string;
}) {
  return (
    <section className={styles.chiSonoSection} data-lab-section="chi-sono">
      <div className={styles.chiSonoIntro}>
        <div className={styles.chiSonoIntroHeadingWrap}>
          <ChiSonoWatermark text="Benvenuto" />
          <h2 className={styles.chiSonoIntroHeading}>{introHeading}</h2>
        </div>
        <ArrowLink href="#" label={introLinkLabel} className={styles.chiSonoIntroLink} />
      </div>

      <div className={styles.chiSonoBody}>
        <div className={styles.chiSonoPhotoStack}>
          <div className={styles.chiSonoPhotoShadow} aria-hidden="true" />
          <div className={styles.chiSonoPhotoWrap}>
            <Image
              src="/design-lab/04.webp"
              alt=""
              fill
              sizes="(min-width: 48rem) 50vw, 100vw"
              className={`${styles.chiSonoPhotoImg} ${styles.chiSonoPhotoDuotone}`}
            />
          </div>
        </div>
        <div className={styles.chiSonoTextColumn}>
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
            <ArrowLink href="#" label={storyLinkLabel} className={styles.chiSonoStoryLink} />
          </div>
        </div>
      </div>
    </section>
  );
}
