// Random (client-only, generated post-mount — never during SSR/hydration,
// so there's nothing to mismatch) placement for the single floating word
// shown above the hero photograph at any moment.
//
// Correction pass: positions used to be percentages of .stage (the
// book's own tight box), which structurally can't express "use the space
// beyond the container, to the right and above, as long as it stays
// within the viewport" — the book's box and the viewport are two
// different, breakpoint-varying things; a fixed percentage of one can't
// describe a boundary defined by the other. Placement is now computed
// against REAL, MEASURED geometry each time a word is placed: the book's
// own bounding box (to keep excluding it precisely) and the hero
// section's bounding box (which spans the full viewport width, since
// .hero is a full-bleed section) as the outer bound that guarantees no
// viewport-edge clipping by construction. Returned coordinates are
// percentages of the HERO box (matching LibriHero.module.scss's own
// .wordsLayer, which LibriHeroVisual.tsx portals the word into), not the
// book's box.

export interface WordPlacement {
  xPercent: number;
  yPercent: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// The book's own boundary, traced against the real alpha channel of
// contents/book-image.png (unchanged from the prior pass — see that
// pass's own report for how these were derived: column-by-column scan
// for the first opaque pixel, ~2.5-3pt safety margin folded in). These
// are percentages of the BOOK's own box (.stage) — converted to
// hero-percent at placement time via the book's real, current rect,
// which is what makes this correct at every breakpoint without needing
// a separate hardcoded polygon per breakpoint.
const BOOK_BOUNDARY_STAGE_PCT: WordPlacement[] = [
  { xPercent: 96, yPercent: 64 },
  { xPercent: 94, yPercent: 64 },
  { xPercent: 90, yPercent: 64.5 },
  { xPercent: 86, yPercent: 65.5 },
  { xPercent: 82, yPercent: 66.5 },
  { xPercent: 78, yPercent: 68 },
  { xPercent: 74, yPercent: 69.5 },
  { xPercent: 70, yPercent: 71.5 },
  { xPercent: 66, yPercent: 74 },
  { xPercent: 64, yPercent: 75.5 },
  { xPercent: 62, yPercent: 76.5 },
  { xPercent: 60, yPercent: 72.5 },
  { xPercent: 58, yPercent: 62.5 },
  { xPercent: 56, yPercent: 53.5 },
  { xPercent: 54, yPercent: 45.5 },
  { xPercent: 52, yPercent: 37.5 },
  { xPercent: 50, yPercent: 30 },
  { xPercent: 48, yPercent: 22 },
  { xPercent: 46, yPercent: 19 },
  { xPercent: 44, yPercent: 15 },
];

// How far right the opened-up region reaches toward .hero's own true
// edge — never all the way to 100%, so a word's own rendered box
// (checked separately below, not just its center point) can never be
// clipped by .hero's own overflow: hidden at the exact viewport edge.
const HERO_RIGHT_MARGIN_PCT = 1.5;

// Extra breathing room below the fixed header's own real bottom edge —
// caught live: a flat 2%-of-hero top margin was nowhere near enough
// clearance at mobile, where the fixed header (measured: 100px tall at
// 390px viewport) covers a much larger FRACTION of the much-shorter
// mobile hero (520px) than at desktop. A word landed directly behind the
// header/CTA button. Fixed by measuring the header's actual rendered
// height at placement time (see placeSingleWord's own headerRect param)
// instead of assuming a fixed percentage of hero's own box.
//
// Correction pass: raised 12 -> 32 (+20px, "roughly 20px" per the
// brief) — at 1440 a word could land only 12px below the header, close
// enough to read as part of the nav/CTA row rather than the hero's own
// content. No spacing token is a close fit for 20px specifically (the
// adjacent steps are --space-4/16px and --space-5/24px, both 4px off —
// see this pass's own report), so this stays the literal requested
// pixel value rather than a token. Applies to every breakpoint (this
// file has no media-query branching), but only 1440 was measured tight
// beforehand — 1024 and 390 already had 99px/195px of clearance, so the
// extra 20px there is inert headroom, not a fix for a problem that
// existed.
const HEADER_BREATHING_PX = 32;

// Estimated single-word footprint in PIXELS (the font-size this measures
// against is a fixed px value per breakpoint — see LibriHeroVisual.
// module.scss's own .word — so the estimate is done in px and converted
// to hero-percent at placement time using the hero's actual current
// width/height, rather than being a fixed percentage that would be
// wrong at every viewport width except the one it was tuned against).
const WORD_WIDTH_PX_PER_CHAR = 21; // ~0.7 * 30px font-size, generous
const WORD_HALF_HEIGHT_PX = 24;

function stageToHeroPercent(stagePt: WordPlacement, stageRect: Rect, heroRect: Rect): WordPlacement {
  const pxX = stageRect.left + (stagePt.xPercent / 100) * stageRect.width;
  const pxY = stageRect.top + (stagePt.yPercent / 100) * stageRect.height;
  return {
    xPercent: ((pxX - heroRect.left) / heroRect.width) * 100,
    yPercent: ((pxY - heroRect.top) / heroRect.height) * 100,
  };
}

// Builds the full safe polygon in hero-percent space: the book's real
// boundary (converted precisely from its own current rect) plus an
// opened-up run along the top and right that reaches toward the hero's
// true edges instead of stopping at the book's own former box edge —
// this is the literal "space beyond the container" the book's box used
// to withhold. The top bound clears the REAL fixed header (see
// HEADER_BREATHING_PX's own comment), not a flat fraction of hero's box.
function buildSafePolygon(stageRect: Rect, heroRect: Rect, headerRect: Rect | null): WordPlacement[] {
  const boundary = BOOK_BOUNDARY_STAGE_PCT.map((p) => stageToHeroPercent(p, stageRect, heroRect));
  const first = boundary[0];
  const last = boundary[boundary.length - 1];
  if (!first || !last) return boundary;

  const headerBottomPx = headerRect ? headerRect.top + headerRect.height : heroRect.top;
  const topPx = Math.max(headerBottomPx + HEADER_BREATHING_PX, heroRect.top + 2);
  const topPct = Math.min(90, ((topPx - heroRect.top) / heroRect.height) * 100);

  return [
    { xPercent: last.xPercent, yPercent: topPct },
    { xPercent: 100 - HERO_RIGHT_MARGIN_PCT, yPercent: topPct },
    { xPercent: 100 - HERO_RIGHT_MARGIN_PCT, yPercent: first.yPercent },
    ...boundary,
  ];
}

function pointInPolygon(x: number, y: number, polygon: WordPlacement[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    if (!pi || !pj) continue;
    const intersects =
      pi.yPercent > y !== pj.yPercent > y &&
      x < ((pj.xPercent - pi.xPercent) * (y - pi.yPercent)) / (pj.yPercent - pi.yPercent) + pi.xPercent;
    if (intersects) inside = !inside;
  }
  return inside;
}

function boxFitsInPolygon(cx: number, cy: number, halfWidth: number, halfHeight: number, polygon: WordPlacement[]): boolean {
  const points: Array<[number, number]> = [
    [cx, cy],
    [cx - halfWidth, cy - halfHeight],
    [cx + halfWidth, cy - halfHeight],
    [cx - halfWidth, cy + halfHeight],
    [cx + halfWidth, cy + halfHeight],
    [cx - halfWidth, cy],
    [cx + halfWidth, cy],
    [cx, cy - halfHeight],
    [cx, cy + halfHeight],
  ];
  // A word must also never be clipped by the viewport edge: the polygon
  // itself already stays HERO_TOP_MARGIN_PCT/HERO_RIGHT_MARGIN_PCT clear
  // of .hero's own true edges, and .hero spans the full viewport width,
  // so staying inside the polygon is sufficient — no separate viewport
  // check needed here.
  return points.every(([x, y]) => pointInPolygon(x, y, polygon));
}

export function placeSingleWord(word: string, stageRect: Rect, heroRect: Rect, headerRect: Rect | null): WordPlacement {
  const polygon = buildSafePolygon(stageRect, heroRect, headerRect);
  const xs = polygon.map((p) => p.xPercent);
  const ys = polygon.map((p) => p.yPercent);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const halfWidthPx = (word.length * WORD_WIDTH_PX_PER_CHAR) / 2;
  const halfWidth = (halfWidthPx / heroRect.width) * 100;
  const halfHeight = (WORD_HALF_HEIGHT_PX / heroRect.height) * 100;

  for (let attempt = 0; attempt < 80; attempt++) {
    const x = xMin + Math.random() * (xMax - xMin);
    const y = yMin + Math.random() * (yMax - yMin);
    if (boxFitsInPolygon(x, y, halfWidth, halfHeight, polygon)) {
      return { xPercent: x, yPercent: y };
    }
  }

  // Fallback (shouldn't trigger in practice): the polygon's own
  // top-right corner, its widest, most open point.
  const fallbackTop = polygon[0]?.yPercent ?? 10;
  return { xPercent: 100 - HERO_RIGHT_MARGIN_PCT - halfWidth, yPercent: fallbackTop + halfHeight };
}
