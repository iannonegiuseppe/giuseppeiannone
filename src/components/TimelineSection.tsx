import type { Image as SanityImage } from "sanity";
import { TimelineCaseFile } from "@/components/TimelineCaseFile";
import { TimelineEntry } from "@/components/TimelineEntry";
import { TimelinePulse } from "@/components/TimelinePulse";
import { TimelineRail } from "@/components/TimelineRail";
import { TimelineRoute } from "@/components/TimelineRoute";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ShimmerText } from "@/components/ShimmerText";
import { imageDimensions, urlFor } from "@/sanity/image";
import styles from "./TimelineSection.module.scss";

// Substring-match emphasis, same technique as PillarHero.tsx's own
// renderEmphasis — duplicated per this codebase's established convention.
// Hardcoded to "percorso" rather than a new emphasisWord prop: this pass
// is scoped to exactly this one heading, not a general mechanism, and
// TimelineSection's own journey data (page.tsx's ChiSonoData.journey)
// has no emphasisWord field to wire one to without a schema change.
function renderHeadingWithShimmer(text: string) {
  const emphasisWord = "percorso";
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <ShimmerText className={styles.headingEmphasis}>{emphasisWord}</ShimmerText>
      {after}
    </>
  );
}

// Was a preview-only, query-param-driven switch (?timeline=case-file|
// route|pulse) letting three proposed layouts be checked in the real
// page before one replaced the shipped default. Route won — page.tsx
// now always passes variant="route", no query param involved. The other
// two branches (TimelineCaseFile/TimelinePulse) and the original
// TimelineEntry/TimelineRail default (the `undefined` branch below)
// stay wired up but are unreachable from that one real call site —
// orphaned, not deleted, same precedent as other superseded content in
// this codebase (see chiSonoSection.ts's own comment).
export type TimelineVariant = "case-file" | "route" | "pulse";

export interface TimelineEntryData {
  place?: string;
  year?: string;
  kicker?: string;
  title?: string;
  body?: string[];
  pullQuote?: string;
  image?: (SanityImage & { alt?: string }) | undefined;
}

// Timeline rebuild — pinning, crossfade and the progress counter are gone
// (see TimelineEntry.tsx/TimelineRail.tsx/TimelineSection.module.scss's
// own comments; TimelinePinned.tsx itself is deleted). Two attempts at a
// viewport-pinned crossfade both hit the same wall: entries are genuinely
// different lengths, so pinning every entry into one 100vh box either
// clips the tallest or inflates the section to five scroll-heights.
// Normal document flow instead — each entry is exactly as tall as its own
// content — with a sticky rail (TimelineRail, reusing the same
// useActiveScrollId tracking ScrollTrackingToc already uses on the
// article/pillar routes, not a second scroll tracker) providing the
// "where am I" orientation a pin used to.
//
// `id`s are index-based (`timeline-entry-N`), assigned here rather than
// stored in Sanity — anchors are internal-only (rail highlight target),
// not permalinks anything external depends on, so a stable-per-render
// index is enough and avoids a schema change.
export function TimelineSection({
  kicker,
  heading,
  description,
  entries,
  variant,
  locale,
}: {
  kicker?: string;
  heading?: string;
  description?: string;
  entries: TimelineEntryData[];
  variant?: TimelineVariant;
  locale?: "it" | "en";
}) {
  if (entries.length === 0) return null;

  // Request width capped at 900px, not the fixed 420px display size: below
  // lg the image fills the full stacked column (up to mobile viewport
  // width), so the source needs headroom beyond the lg+ 420px column.
  // The 420x315 DISPLAY size (both breakpoints identical) comes from CSS
  // (.entryImage's fixed width + aspect-ratio, TimelineSection.module.scss)
  // via object-fit: cover, not from a server-side crop.
  const resolved = entries.map((entry, index) => {
    const dims = entry.image ? imageDimensions(entry.image) : null;
    const requestWidth = dims ? Math.min(dims.width, 900) : undefined;
    return {
      id: `timeline-entry-${index}`,
      place: entry.place ?? "",
      year: entry.year,
      kicker: entry.kicker,
      title: entry.title,
      body: entry.body ?? [],
      pullQuote: entry.pullQuote,
      image:
        entry.image && dims && requestWidth
          ? {
              src: urlFor(entry.image).width(requestWidth).url(),
              width: dims.width,
              height: dims.height,
              alt: entry.image.alt ?? "",
            }
          : null,
    };
  });

  return (
    <section className={styles.timeline} aria-label={heading ?? "Timeline"}>
      {/* Route pins the header into its own sticky unit (see
          TimelineRoutePinned.tsx) at lg+/motion-allowed — this shared
          header would otherwise show twice. headerHiddenForRoutePin
          hides it there ONLY (mirrors .routeFallback/.routePinWrap's own
          lg+ / reduced-motion toggle), leaving every other variant and
          the below-lg/reduced-motion route fallback untouched — both
          still read this exact header in normal flow. */}
      <div className={`${styles.header} ${variant === "route" ? styles.headerHiddenForRoutePin : ""}`}>
        {kicker ? (
          <p className={styles.kicker}>
            <SectionKicker>{kicker}</SectionKicker>
          </p>
        ) : null}
        {heading ? <h2 className={styles.heading}>{renderHeadingWithShimmer(heading)}</h2> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>

      {variant === "case-file" ? (
        <div className={styles.preview}>
          <TimelineCaseFile entries={resolved} locale={locale} />
        </div>
      ) : variant === "route" ? (
        <div className={styles.preview}>
          <TimelineRoute entries={resolved} kicker={kicker} heading={heading} description={description} />
        </div>
      ) : variant === "pulse" ? (
        <div className={styles.preview}>
          <TimelinePulse entries={resolved} />
        </div>
      ) : (
        <div className={styles.layout}>
          <TimelineRail entries={resolved} />
          <div className={styles.entries}>
            {resolved.map((entry, index) => (
              <TimelineEntry key={entry.id} {...entry} isFirst={index === 0} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
