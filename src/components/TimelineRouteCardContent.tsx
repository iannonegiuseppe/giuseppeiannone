import { getImageProps } from "next/image";
import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import styles from "./TimelineVariants.module.scss";

// A 1x1 transparent GIF — the <picture> fallback <img> below, used only
// when no <source> matches (mobile, see RouteImage's own comment). Zero
// network cost: it's an inline data: URI, never a request.
const BLANK_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
// Same literal value as _tokens.scss's $breakpoints md (48rem) — a
// <source media> query is evaluated by the HTML parser itself, so it
// can't reach a Sass map at build time; this is the one manual copy of
// that number, kept as a named constant instead of inline so it reads
// as "the md breakpoint," not an arbitrary width.
const MD_BREAKPOINT_QUERY = "(min-width: 48rem)";

// Route card image — mobile pass — plain CSS (display: none below md on
// the .routeImage container) was tried first and measured live: it hid
// the image visually but next/image's underlying <img> still has a
// resolved src/srcset the moment it's in the DOM, and Chrome's preload
// scanner fetches it regardless of display — confirmed via a Playwright
// network trace at 390px, all four route images still downloaded. A
// <picture> with a single <source media> is the fix that actually
// changes what's fetched, not just what's shown: source selection runs
// in the HTML parser against the real current viewport, independent of
// CSS and of JS — a mobile browser never even considers the real
// srcset, using the inline blank-pixel <img> fallback instead, so
// there's nothing to request. This also means it works with JS
// disabled and produces no hydration flash (unlike a client-side
// matchMedia mount/unmount, which would still ship the image in the
// initial SSR HTML before JS could remove it).
function RouteImage({ src, alt }: { src: string; alt: string }) {
  const {
    props: { srcSet, sizes, ...rest },
  } = getImageProps({ src, alt, fill: true, sizes: "192px", className: styles.imagePhoto });

  return (
    <picture>
      <source media={MD_BREAKPOINT_QUERY} srcSet={srcSet} sizes={sizes} />
      <img {...rest} src={BLANK_PIXEL} alt={alt} />
    </picture>
  );
}

// The inner content of a Route card (place/kicker/title/body/quote,
// optionally an image) — shared between the normal-flow card
// (TimelineRouteEntry.tsx) and the pinned stage (TimelineRoutePinned.tsx),
// which wrap it in two different outer elements/transition mechanisms
// but render identical content either way.
//
// hideImage: the pinned stage's own card is position:absolute with a
// fixed box (no internal scroll, no overflow clipping) — the image row
// pushed real content past that fixed height and visibly spilled below
// the card's own rounded edge (caught from a live screenshot, not a
// report). Rather than re-fit an image into a box that was never
// designed to accommodate one, the pinned stage drops it entirely — the
// normal-flow card (which has real in-flow height, no such ceiling)
// keeps its image untouched (at md+ — see RouteImage above for below md).
export function TimelineRouteCardContent({ entry, hideImage }: { entry: TimelineEntryResolved; hideImage?: boolean }) {
  return (
    <>
      <p className={styles.routePlace}>{entry.place}</p>
      <div className={styles.routeMeta}>
        {entry.kicker ? <span className={styles.routeKicker}>{entry.kicker}</span> : null}
        {entry.title ? <span className={styles.routeTitle}>{entry.title}</span> : null}
      </div>
      <div className={styles.routeCols}>
        <div className={styles.routeColsText}>
          {entry.body.map((paragraph, i) => (
            <p key={i} className={styles.routeBody}>
              {paragraph}
            </p>
          ))}
          {entry.pullQuote ? <p className={styles.routeQuote}>{entry.pullQuote}</p> : null}
        </div>
        {entry.image && !hideImage ? (
          <div className={`${styles.routeImage} ${styles.imageFrame}`}>
            <RouteImage src={entry.image.src} alt={entry.image.alt} />
          </div>
        ) : null}
      </div>
    </>
  );
}
