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

  // Light-island pass: was tone-deep, now ivory via .videoLightWrap
  // (density.module.scss, tone.light-island-surface — same mechanism
  // Hope/Metodo/CTA-bridge/Diplomi already use). .toneDeepSection/-Grain/
  // -Content are shared with Contact and stay untouched; this is a new,
  // separately-named wrapper, same "shared device, one consumer diverges
  // -> split, don't mutate" call made repeatedly on this page. No grain
  // layer: light-island sections are flat by design (see tone.light-
  // island-surface's own comment) — Diplomi doesn't have one either.
  //
  // Heading: no italic accent word. This pass's brief describes one
  // ("the italic accent word at heading size"), but unlike Metodo/CTA-
  // bridge/Welcome, homePage.video has no headingEmphasisWord CMS field —
  // adding one would mean touching the schema, explicitly off-limits this
  // pass. Rendering the whole heading in roman rather than guessing which
  // word to italicize on live, client-approved, §9-reviewed copy. font-
  // synthesis: none set anyway for consistency with Diplomi's own h2,
  // even though nothing here is italic.
  //
  // Plate: .videoPlateFrame (density.module.scss) wraps the player with a
  // low-alpha accent hairline, radius-matched to the player's own
  // --radius-l — see this pass's own proposal for why (light photo on
  // light ground needs a defined edge; no drop shadow).
  return (
    <section className={densityStyles.videoLightWrap} aria-labelledby="video-block-heading">
      <div className={`${densityStyles.section} ${densityStyles.videoLightContent}`}>
        <div className={densityStyles.videoBlockGrid}>
          <div className={densityStyles.videoBlockPlayerCol}>
            <div className={densityStyles.videoPlateFrame}>
              <VideoPlayer
                src={videoUrl}
                poster={posterSrc}
                posterAlt=""
                captionsSrc={captionsUrl}
                wrapperAriaLabel={wrapperAriaLabel}
              />
            </div>
          </div>
          <div className={densityStyles.videoBlockTextCol}>
            <p className={videoStyles.videoKicker}>
              <span className={videoStyles.videoKickerRule} aria-hidden="true" />
              {kicker}
              <span className={videoStyles.videoKickerRule} aria-hidden="true" />
            </p>
            <h2
              id="video-block-heading"
              className={densityStyles.videoBlockHeading}
              style={{ fontWeight: 400, fontSynthesis: "none" }}
            >
              {heading}
            </h2>
            {lead ? <p className={videoStyles.videoLead}>{lead}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
