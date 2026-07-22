import type { Image as SanityImage } from "sanity";
import { getTranslations } from "next-intl/server";
import { VideoPlayer } from "./VideoPlayer";
import { urlFor } from "@/sanity/image";
import type { Locale } from "@/sanity/paths";
import styles from "./VideoSection.module.scss";

// Video-section pass: "La prima seduta" — the last anxiety-reducer before
// the final CTA band. Renders NOTHING (not a placeholder block) until a
// video file is actually published, same "zero content -> zero DOM"
// philosophy ResourcesSection already uses for its zero-articles case —
// see this component's own early return below.
//
// Click-to-toggle pass: the player wrapper's aria-label ("Video: {title}")
// is UI chrome, not page content, so it comes from messages/{it,en}.json's
// "Video" namespace, resolved here (getTranslations, server-side) and
// passed down as a plain prop — same established pattern as
// DiplomiSection.tsx's own chrome strings (see that file's own comment on
// why no component here calls next-intl's client-side useTranslations()).
export async function VideoSection({
  kicker,
  heading,
  lead,
  videoUrl,
  poster,
  captionsUrl,
  locale,
}: {
  kicker?: string;
  heading?: string;
  lead?: string;
  videoUrl?: string;
  poster?: SanityImage;
  captionsUrl?: string;
  locale: Locale;
}) {
  if (!videoUrl) return null;

  const t = await getTranslations({ locale, namespace: "Video" });
  const wrapperAriaLabel = t("wrapperAriaLabel", { title: heading ?? "" });

  // Image-quality pass convention carried over here: no .width() cap on
  // urlFor — next/image resizes from the raw asset itself, so retina
  // candidates aren't silently capped below what next/image would
  // otherwise serve (see HeroOverlap.tsx's own comment on this exact
  // lesson).
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
        <VideoPlayer
          src={videoUrl}
          poster={posterSrc}
          posterAlt=""
          captionsSrc={captionsUrl}
          wrapperAriaLabel={wrapperAriaLabel}
        />
      </div>
    </section>
  );
}
