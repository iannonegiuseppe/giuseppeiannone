import type { Image as SanityImage } from "sanity";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { IndexedListItem } from "./IndexedListItem";
import styles from "./ConcernsSection.module.scss";
import sharedStyles from "./sharedSections.module.scss";

interface ConcernArea {
  title: string;
  subItems?: string[];
}

// Single-block refinement pass: replaces the old sand-band 2x2 GroupBCard
// grid entirely (that markup is gone, not hidden — see the file-level
// comment on .concernsSection in sectionsShared.module.scss). Photo bleeds to
// the LEFT viewport edge, mirroring Come funziona's media zone. The "03"
// watermark is this section's slot in the site-wide numbered-section
// sequence (Chi sono=01, Come funziona=02, this=03) — unrelated to the
// areas' own 01-04 indexing below it, which is a separate, local list.
//
// CMS-wiring pass: areas come from homePage.diCosa.areas — each item's own
// numeral (01-04) is computed from its array position (1-indexed, padded),
// not stored data, since it's purely positional.
export function ConcernsSection({
  kicker,
  heading,
  linkLabel,
  areas,
  photo,
}: {
  kicker: string;
  heading: string;
  linkLabel: string;
  areas?: ConcernArea[];
  photo?: SanityImage;
}) {
  // Image-quality diagnostic pass: dropped the urlFor(1200) cap — capped
  // just below next/image's own retina candidate (1200 vs ~1260 needed
  // at 2x DPR). Source (1800px) covers it once next/image resizes from
  // the raw asset directly.
  const photoSrc = photo ? urlFor(photo).url() : "/design-lab/03.webp";

  return (
    <section
      id="di-cosa"
      className={styles.concernsSection}
      data-lab-section="concerns"
      // Anchor target for RecognitionSection.tsx's "Ti riconosci?" rows —
      // id added this pass, purely an anchor point (no visual/behavioral
      // change to this section itself, verified byte-identical via
      // screenshot diff in that pass's final report).
    >
      <div className={styles.concernsLayout}>
        <div className={styles.concernsPhotoZone}>
          <Image
            src={photoSrc}
            alt=""
            fill
            // Image-quality diagnostic pass: was 40vw, under-claiming the
            // photo zone's true rendered width (measured 631px at a
            // 1440px viewport, ~44vw — the zone's real width comes from
            // a CSS custom property, not a clean vw fraction). Since the
            // browser picks its srcset candidate from this HINT rather
            // than the true layout size, the under-claim meant even a
            // fully uncapped source served a smaller-than-needed
            // candidate at retina. 45vw covers the measured width with a
            // small safety margin.
            sizes="(min-width: 48rem) 45vw, 100vw"
            className={`${styles.concernsPhotoImg} ${sharedStyles.heroOverlapPhotoTreated}`}
          />
        </div>
        <div className={styles.concernsGridWrap}>
          <div className={styles.concernsContentZone}>
            <span className={styles.concernsNumeral} aria-hidden="true">
              03
            </span>
            <div className={styles.concernsContentInner}>
              <p className={styles.concernsKicker}>
                <span className={styles.concernsKickerRule} aria-hidden="true" />
                {kicker}
              </p>
              <h2 className={styles.concernsHeading}>{heading}</h2>
              <a href="#" className={styles.concernsArrowLink}>
                {linkLabel}
                <span className={styles.concernsArrowLinkGlyph} aria-hidden="true">
                  ⟶
                </span>
              </a>
              <ul className={styles.concernsList}>
                {(areas ?? []).map((area, index) => (
                  <li key={area.title}>
                    <IndexedListItem
                      numeral={String(index + 1).padStart(2, "0")}
                      title={area.title}
                      subItems={area.subItems ?? []}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
