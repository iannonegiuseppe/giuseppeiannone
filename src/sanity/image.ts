import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "sanity";

// Built from {projectId, dataset} directly, not the full Sanity client
// (client.ts) — image CDN URLs are public and deterministic from those two
// values alone, no auth/token needed to construct one. Keeping this file
// free of client.ts's own import (next/headers, server-only) is what lets
// BlogFilterableSection.tsx, a client component, import urlFor/
// imageDimensions for the filtered-view cards it renders from the
// route-handler response — a full client.ts import there breaks the
// client bundle (next/headers is Server-Component-only).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: Image) {
  return builder.image(source);
}

// Sanity asset refs encode their original pixel dimensions in the id
// itself (e.g. "image-<hash>-800x450-svg") — reading them here avoids a
// second GROQ dereference just to get width/height for next/image's
// required (CLS-safety) props.
const ASSET_REF_DIMENSIONS = /^image-\w+-(\d+)x(\d+)-\w+$/;

export function imageDimensions(
  source: Image,
): { width: number; height: number } | null {
  const ref = source.asset?._ref;
  if (!ref) return null;

  const match = ASSET_REF_DIMENSIONS.exec(ref);
  if (!match) return null;

  const [, widthStr, heightStr] = match;
  if (!widthStr || !heightStr) return null;

  return { width: Number(widthStr), height: Number(heightStr) };
}

// Ceiling for an article-cover source request. 1920 is deviceSizes' own
// maximum (next.config.ts) — the optimizer will never ask for more than
// that, so a wider source is bytes Sanity renders and nothing consumes.
const ARTICLE_COVER_MAX_WIDTH = 1920;

/**
 * The ONE Sanity source URL for an article cover, shared by every surface
 * that renders one: the blog index grid card and featured slot, the
 * article hero, the related-articles grid, and the homepage slider.
 *
 * Image-transformation quota pass. Each surface previously built its own
 * URL — `.width(800)`, `.width(1200)`, `.width(2400).height(1029)`, and a
 * `.width(800).format("webp").quality(80)` variant on the homepage — so a
 * single cover existed as up to four distinct source images, each with its
 * own full set of billed per-width transformations. They are one URL now,
 * because the browser is served the OPTIMIZER's output, never this source:
 * one sufficiently large source downscales correctly for a 342px card and
 * a 1440px hero alike, so there was never a quality argument for more
 * than one.
 *
 * `Math.min(natural, 1920)` — the same never-upscale pattern PillarHero
 * and articlePortableText already use. Sanity's image API DOES upscale on
 * request (a 530x474 asset at `?w=1200` returns a fabricated 1200x1073),
 * and the measured cover corpus has a median natural width of 1080 with
 * 97% under 2400 — so the old `.width(2400)` was inventing pixels for
 * almost every cover.
 *
 * No `.height()` — and this one DOES change rendering, deliberately.
 * `@sanity/image-url` auto-computes a `rect` crop whenever both width and
 * height are set, so the hero's old `.width(2400).height(1029)` emitted
 * `?rect=0,124,530,227&w=2400&h=1029`: a centred 2.33:1 slice keeping 227
 * of the source's 474 rows, then upscaled ~4.5x to 2400 wide. Cropping is
 * now left entirely to CSS (`.coverImage { object-fit: cover }`), which
 * has to run anyway because `.coverBand`'s own aspect is NOT fixed — it is
 * 2.33:1 at 1440 but 0.80:1 at 390.
 *
 * Measured consequence (localhost, before/after screenshots): at 1440 the
 * two are near-identical (mean pixel difference 1.5/255) because the band
 * is 2.33:1 there, so CSS reproduces almost exactly the slice the server
 * used to cut. At 390 the framing genuinely changes (mean 17.9/255): the
 * old pipeline forced that 2.33:1 strip into a portrait box and zoomed
 * hard into a hard-upscaled sliver; the full-frame source now cover-crops
 * to the band instead, showing more of the image at native resolution.
 *
 * The mobile change was reviewed and kept deliberately — owner's own
 * reasoning, recorded here so nobody "restores" it later as a regression:
 * the old pipeline cropped server-side to 2.33:1, upscaled that 227-row
 * sliver 4.5x, and THEN the CSS cropped it again to 0.80:1 on mobile —
 * two crops, the first of which only discarded real pixels and invented
 * fake ones. The new behaviour crops once, in CSS, from the full frame at
 * native resolution. The mobile change is a fix, not a regression.
 *
 * No `.format()`/`.quality()` either: next/image re-encodes to WebP at
 * q75 regardless, so asking Sanity for webp/q80 first only double-
 * compressed the homepage slider's copy.
 */
export function articleCoverUrl(cover: Image): string | null {
  const dims = imageDimensions(cover);
  if (!dims) return null;
  return urlFor(cover)
    .width(Math.min(dims.width, ARTICLE_COVER_MAX_WIDTH))
    .url();
}
