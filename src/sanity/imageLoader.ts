"use client";

// Custom next/image loader — the fix for a real, visitor-facing outage:
// Vercel's Image Optimization quota (5,000 transformations/month on the
// free plan) ran out mid-September and /_next/image stopped answering, so
// most blog covers rendered as empty boxes. The files in Sanity were
// fine; only the optimizer in the middle was.
//
// Setting images.loader to "custom" (next.config.ts) means next/image
// still generates srcset/sizes/lazy-loading/CLS-safe layout exactly as
// before, but the URLs it emits point at Sanity's own image CDN with that
// CDN's query parameters, instead of at /_next/image. Sanity does the
// resize and the format negotiation — the same work, one hop upstream, at
// the origin these files already come from — and Vercel's transformation
// counter stops moving for them entirely.
//
// This runs on the server AND in the client bundle, so it stays a plain
// module: no next/headers, no server-only, no Sanity client import.

// Sanity encodes an asset's natural pixel size in its own filename
// (".../<hash>-1080x1440.webp"), the same fact src/sanity/image.ts reads
// out of the asset _ref. Matching it here is what preserves the
// never-upscale guarantee: Vercel's built-in optimizer refuses to render
// wider than the source, but Sanity's API happily fabricates pixels (a
// 530x474 asset at ?w=1200 returns a real 1200x1073 file). Without this
// clamp, moving to the CDN would have silently reintroduced upscaling on
// every asset narrower than deviceSizes' 1920 ceiling — the exact defect
// articleCoverUrl's own Math.min() was written to kill.
//
// Clamping also collapses the srcset: every width above the natural one
// resolves to the same URL, so the browser and the CDN cache it once
// instead of fetching near-identical copies.
const SANITY_FILENAME_DIMENSIONS = /-(\d+)x(\d+)\.[a-z0-9]+$/i;

function naturalWidthOf(pathname: string): number | null {
  const match = SANITY_FILENAME_DIMENSIONS.exec(pathname);
  if (!match) return null;
  const width = Number(match[1]);
  return Number.isFinite(width) && width > 0 ? width : null;
}

export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Anything not on Sanity's CDN passes through untouched: the four
  // literal-path public/ images (see next.config.ts's own note on them)
  // and statically imported ones like public/libri/book-hero.png. They
  // are served as authored, unresized — a loaderFile is global, so there
  // is no way to keep the built-in optimizer for a subset. Their source
  // files are what has to be right instead.
  if (!src.startsWith("https://cdn.sanity.io/")) return src;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  const natural = naturalWidthOf(url.pathname);
  const requested = natural ? Math.min(width, natural) : width;

  url.searchParams.set("w", String(requested));
  // 75 is next/image's own default quality, kept so the switch changes
  // no rendered output beyond who does the encoding.
  url.searchParams.set("q", String(quality ?? 75));
  // Serve WebP/AVIF by the request's own Accept header — this replaces
  // the re-encode the Vercel optimizer used to do unconditionally.
  url.searchParams.set("auto", "format");
  // Belt and braces behind the clamp above, for any asset whose filename
  // does not carry its dimensions: fit=max never returns more pixels than
  // the source has.
  url.searchParams.set("fit", "max");

  return url.toString();
}
