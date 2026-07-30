import { getTranslations } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { VideoPlayer } from "@/components/VideoPlayer";
import videoStyles from "@/components/VideoSection.module.scss";
import { urlFor } from "@/sanity/image";
import type { Locale } from "@/sanity/paths";
import densityStyles from "./density/density.module.scss";

// Differentiation pass, item 3: the real VideoSection (centered header
// stacked above a centered player) reads as "a media box with text
// beside it" — the same device Lo spazio's Frame B also used, a few
// sections apart. Rebuilt as an asymmetric two-column block instead:
// player left (larger share), text right, tops aligned.
//
// Player mechanics stay completely untouched — <VideoPlayer> (facade,
// controls, click-to-toggle, keyboard, reduced-motion, all of it) is
// reused verbatim, unmodified, exactly as VideoSection.tsx itself uses
// it. Only the SURROUNDING layout is new; the real VideoSection.tsx
// (kicker/heading/lead classes reused from its module.scss, same
// text — nothing invented) can't be edited to change its own layout
// without touching the real homepage, same reasoning as every other
// "real component needs different layout on this page" case this
// session.
export async function VideoBlock({
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

  const posterSrc = poster ? urlFor(poster).url() : undefined;
  if (!posterSrc) return null;

  // Tonal-scale pass: moved to tone-deep. Hierarchy check (per that
  // pass's own instruction): kicker is already small/uppercase/bold
  // (typographically distinct regardless of color) and the heading is
  // display-scale against the kicker's 12px and the lead's 17px — both
  // gaps are carried by size, not color; nothing here depended on a
  // color difference to read as hierarchy. Three real-component classes
  // (videoKicker/videoKickerRule/videoLead, from the shared, un-editable
  // VideoSection.module.scss) needed scoped overrides — see
  // density.module.scss's own [class*="video..."] rules under
  // .toneDeepContent for why and what.
  return (
    <section className={densityStyles.toneDeepSection} aria-labelledby="video-block-heading">
      <div className={densityStyles.toneDeepGrain} aria-hidden="true" />
      <div className={`${densityStyles.section} ${densityStyles.toneDeepContent}`}>
        <div className={densityStyles.videoBlockGrid}>
          <div className={densityStyles.videoBlockPlayerCol}>
            <VideoPlayer
              src={videoUrl}
              poster={posterSrc}
              posterAlt=""
              captionsSrc={captionsUrl}
              wrapperAriaLabel={wrapperAriaLabel}
            />
          </div>
          <div className={densityStyles.videoBlockTextCol}>
            <p className={videoStyles.videoKicker}>
              <span className={videoStyles.videoKickerRule} aria-hidden="true" />
              {kicker}
              <span className={videoStyles.videoKickerRule} aria-hidden="true" />
            </p>
            <h2 id="video-block-heading" className={densityStyles.videoBlockHeading}>
              {heading}
            </h2>
            {lead ? <p className={videoStyles.videoLead}>{lead}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
