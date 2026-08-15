import NextImage from "next/image";
import styles from "./BookCover.module.scss";

// Real-cover pass — imageUrl is finally passed by both callers
// (LibriIndexSection for the guide, LibriBookPromo for the published
// book). ebook.png already has its own baked-in 3D mockup (spine,
// shadow, transparency) — nothing added on top. real-book.jpg is a flat
// scan — correction pass: an earlier version added CSS depth (rotateY,
// a striped page-block edge) here, removed again — kept only a soft
// drop shadow so the flat scan doesn't look like it's floating on the
// ground, nothing that implies it has physical thickness it doesn't
// have. Neither tone's CSS-drawn placeholder (gradient background,
// drawn title/byline) renders once an image is set — the whole point
// of the swap.
//
// sizes correction pass: both were still carrying vw-based mobile
// branches from an earlier, smaller layout. The actual rendered width
// doesn't change between 390 and 1440 at all — .cover/.coverSidebar's
// own max-width is the binding constraint at every tested breakpoint,
// there's no viewport width in between where the grid genuinely
// shrinks them — so a vw fraction was never the right shape for this
// value in the first place, and the stale numbers (45vw/55vw of the
// CURRENT viewport) undershot the true rendered width by nearly 2x at
// 390px. Fixed sizes here now match the CSS module's own literal
// max-width values directly (see BookCover.module.scss's own
// .coverImageOnly/.book comments for the current numbers).
// Guide needs the min() form specifically: at 432px it's now bigger
// than fits inside the page's own mobile padding at narrow viewports
// (measured: 342px available at 390px, not 432 — LibriIndexSection.
// module.scss's own .inner uses --space-5/24px padding-inline below
// lg) — a plain "432px" would overestimate there. Not a softness bug
// (overestimating means fetching slightly more than needed, never
// less), but no longer exactly true either, so expressed precisely
// instead of left as a known small inaccuracy. Book stays a plain
// fixed value — measured unchanged (320px) at both 1440 and 390, the
// grid's own max-width is always what binds for it.
const GUIDE_SIZES = "min(432px, calc(100vw - 3rem))";
const BOOK_SIZES = "320px";

export function BookCover({
  title,
  label,
  byline,
  tone = "guide",
  imageUrl,
  imageAlt,
  imageWidth,
  imageHeight,
  className,
}: {
  title: string;
  label: string;
  byline: string;
  /** "guide" = the free PDF's real cover (a pre-built 3D mockup, rendered
   * flat); "book" = the published book's flat scan (rendered flat too,
   * plus a soft drop shadow). Without an image, both fall back to their
   * own CSS-drawn gradient placeholder — matches the mockup's two cover
   * treatments. */
  tone?: "guide" | "book";
  imageUrl?: string;
  imageAlt?: string;
  /** Real asset pixel dimensions (from Sanity's own asset ref) — sets
   * the container's aspect-ratio to the image's true shape rather than
   * the placeholder's fixed 3:4, so object-fit:cover never crops it. */
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
}) {
  if (imageUrl) {
    const aspectRatio = imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : undefined;
    return (
      <div
        className={[styles.coverImageOnly, tone === "book" ? styles.coverImageShadow : null, className].filter(Boolean).join(" ")}
        style={{ aspectRatio }}
        data-has-image="true"
      >
        <NextImage
          src={imageUrl}
          alt={imageAlt ?? ""}
          fill
          sizes={tone === "book" ? BOOK_SIZES : GUIDE_SIZES}
          className={styles.coverImage}
        />
      </div>
    );
  }

  const placeholder = (
    <div className={[styles.cover, styles[tone], className].filter(Boolean).join(" ")} data-has-image="false">
      <p className={styles.coverLabel}>{label}</p>
      <div>
        <span className={styles.coverRule} aria-hidden="true" />
        <p className={styles.coverTitle}>{title}</p>
      </div>
      <p className={styles.coverByline}>{byline}</p>
    </div>
  );

  // "guide" (the dark green placeholder) must read as dark REGARDLESS of
  // context — see the module's own .guide comment for the full
  // token-scoping reasoning. Only needed for the placeholder path: once
  // a real image renders, nothing inside reads --color-text/--color-accent
  // anymore.
  return tone === "guide" ? <div className="themeDark">{placeholder}</div> : placeholder;
}
