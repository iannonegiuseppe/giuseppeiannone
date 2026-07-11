import type { Image as SanityImage } from "sanity";
import { urlFor } from "@/sanity/image";
import { MediaBand, type MediaBandMedia } from "./MediaBand";
import styles from "./MethodsOverlap.module.scss";

// Single-block refinement pass: replaces the pine-panel overlap
// composition with a full-bleed greige band. Desktop/tablet split the band
// into a container-governed text zone (left) and a media zone that bleeds
// past the container to the viewport edge (right); mobile turns the media
// into the whole block's background with a pine overlay and ivory text on
// top. See sectionsShared.module.scss's .methodsBandSection comment for the
// column-math this relies on.
//
// No video asset exists in the repo/public folder (checked: only the
// numbered .webp stills under public/design-lab/) — media is wired in
// image mode with the existing session photo (12.webp). Video mode is
// fully implemented in MediaBand.tsx (intersection-gated play/pause,
// prefers-reduced-motion guard, preload="none") but not demoed here, per
// the honesty rule's explicit instruction not to substitute a mismatched
// asset.
export function MethodsOverlap({
  kicker,
  heading,
  body,
  media: mediaImage,
}: {
  kicker: string;
  heading: string;
  body: string;
  media?: SanityImage;
}) {
  // Image-quality diagnostic pass: dropped the urlFor(1200) cap — capped
  // below next/image's own retina candidate (1200 vs ~1620 needed at 2x
  // DPR for this band's ~810px display width). Source (1920px) covers it
  // once next/image resizes from the raw asset directly.
  const media: MediaBandMedia = {
    type: "image",
    src: mediaImage ? urlFor(mediaImage).url() : "/design-lab/12.webp",
  };

  return (
    <section className={styles.methodsBandSection} data-lab-section="methods">
      <div className={styles.methodsBand}>
        <span className={styles.methodsBandNumeral} aria-hidden="true">
          02
        </span>
        <div className={styles.methodsBandInner}>
          <div className={styles.methodsBandTextColumn}>
            <p className={styles.methodsBandKicker}>
              <span className={styles.methodsBandKickerRule} aria-hidden="true" />
              {kicker}
            </p>
            <h2 className={styles.methodsBandHeading}>{heading}</h2>
            <p className={styles.methodsBandBody}>{body}</p>
          </div>
        </div>
        <div className={styles.methodsBandMediaZone}>
          <MediaBand media={media} />
        </div>
        <div className={styles.methodsBandOverlay} aria-hidden="true" />
      </div>
    </section>
  );
}
