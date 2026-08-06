import Image from "next/image";
import type { Image as SanityImage } from "sanity";
import { TimelineRail } from "@/components/TimelineRail";
import { imageDimensions, urlFor } from "@/sanity/image";
import styles from "./TimelineSection.module.scss";

export interface TimelineEntryData {
  place?: string;
  year?: string;
  kicker?: string;
  title?: string;
  body?: string[];
  pullQuote?: string;
  image?: (SanityImage & { alt?: string }) | undefined;
}

const ID_PREFIX = "chi-sono-timeline";

// Chi sono timeline pass (pass 2 of 4) — the page's one dark section:
// sits OUTSIDE the light-island wrapper (see chi-sono/page.tsx, now two
// separate .lightIsland instances either side of this), on the page's
// own native dark theme — no tone mixin needed, this section just never
// opts into the light override the rest of the new top-of-page content
// uses. Contained, not full-bleed (unlike the mosaic — no content reason
// to bleed here).
//
// Image is optional per entry and none are supplied yet in this
// rollout — the conditional render below (no wrapper element at all
// when absent) means a missing image costs zero layout space, not an
// empty frame.
export function TimelineSection({
  kicker,
  heading,
  entries,
}: {
  kicker?: string;
  heading?: string;
  entries: TimelineEntryData[];
}) {
  if (entries.length === 0) return null;

  const railEntries = entries.map((entry, index) => ({
    id: `${ID_PREFIX}-${index}`,
    place: entry.place ?? "",
    year: entry.year,
  }));

  return (
    <section className={styles.timeline} aria-label={heading ?? "Timeline"}>
      <div className={styles.header}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      </div>

      <div className={styles.grid}>
        <div className={styles.railColumn}>
          <TimelineRail entries={railEntries} topOffset="calc(var(--header-height-collapsed) + var(--space-6))" />
        </div>

        <ol className={styles.entries}>
          {entries.map((entry, index) => {
            const dims = entry.image ? imageDimensions(entry.image) : null;
            const requestWidth = dims ? Math.min(dims.width, 1200) : undefined;

            return (
              <li key={index} id={`${ID_PREFIX}-${index}`} className={styles.entry}>
                {/* Mobile/tablet only (rail collapses below lg) — the
                    year/place the sticky rail shows on desktop, inline
                    here instead so it's never lost, just relocated. */}
                <p className={styles.entryMeta}>
                  {entry.year ? <span className={styles.entryYear}>{entry.year}</span> : null}
                  <span className={styles.entryPlace}>{entry.place}</span>
                </p>
                {entry.kicker ? <p className={styles.entryKicker}>{entry.kicker}</p> : null}
                {entry.title ? <h3 className={styles.entryTitle}>{entry.title}</h3> : null}
                {entry.image && dims && requestWidth ? (
                  <div className={styles.entryImageFrame}>
                    <Image
                      src={urlFor(entry.image).width(requestWidth).url()}
                      alt={entry.image.alt ?? ""}
                      width={dims.width}
                      height={dims.height}
                      className={styles.entryImage}
                    />
                  </div>
                ) : null}
                {(entry.body ?? []).map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className={styles.entryBody}>
                    {paragraph}
                  </p>
                ))}
                {entry.pullQuote ? <p className={styles.entryQuote}>{entry.pullQuote}</p> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
