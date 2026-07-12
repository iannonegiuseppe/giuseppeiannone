import type { Image as SanityImage } from "sanity";
import { VideoPlayer } from "./VideoPlayer";
import { urlFor } from "@/sanity/image";
import styles from "./VideoSection.module.scss";

// Video-section pass: "La prima seduta" — the last anxiety-reducer before
// the final CTA band. Renders NOTHING (not a placeholder block) until a
// video file is actually published, same "zero content -> zero DOM"
// philosophy ResourcesSection already uses for its zero-articles case —
// see this component's own early return below.
export function VideoSection({
  kicker,
  heading,
  lead,
  videoUrl,
  poster,
  captionsUrl,
}: {
  kicker?: string;
  heading?: string;
  lead?: string;
  videoUrl?: string;
  poster?: SanityImage;
  captionsUrl?: string;
}) {
  if (!videoUrl) return null;

  // Image-quality pass convention carried over here: no .width() cap on
  // urlFor — next/image resizes from the raw asset itself, so retina
  // candidates aren't silently capped below what next/image would
  // otherwise serve (see HeroOverlap.tsx/ChiSonoOverlap.tsx's own
  // comments on this exact lesson).
  const posterSrc = poster ? urlFor(poster).url() : undefined;
  if (!posterSrc) return null; // schema requires a poster whenever a file is set; defensive fallback if data is ever inconsistent

  return (
    <section className={styles.videoSection} data-lab-section="video">
      <div className={styles.videoHeader}>
        <p className={styles.videoKicker}>
          <span className={styles.videoKickerRule} aria-hidden="true" />
          {kicker}
          <span className={styles.videoKickerRule} aria-hidden="true" />
        </p>
        <h2 className={styles.videoHeading}>{heading}</h2>
        {lead ? <p className={styles.videoLead}>{lead}</p> : null}
      </div>
      <div className={styles.videoPlayerWrap}>
        <VideoPlayer src={videoUrl} poster={posterSrc} posterAlt="" captionsSrc={captionsUrl} />
      </div>
    </section>
  );
}
