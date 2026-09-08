import { describe, it } from "node:test";
import assert from "node:assert/strict";
import sanityImageLoader from "./imageLoader";

const CDN = "https://cdn.sanity.io/images/proj/dataset";

function params(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

describe("sanity image loader", () => {
  it("rewrites a Sanity URL to the CDN's own resize parameters", () => {
    const out = sanityImageLoader({ src: `${CDN}/abc-1600x900.webp`, width: 828 });
    const q = params(out);
    assert.equal(new URL(out).origin, "https://cdn.sanity.io");
    assert.equal(q.get("w"), "828");
    assert.equal(q.get("q"), "75");
    assert.equal(q.get("auto"), "format");
    assert.equal(q.get("fit"), "max");
  });

  it("honours an explicit quality", () => {
    const out = sanityImageLoader({ src: `${CDN}/abc-1600x900.webp`, width: 640, quality: 90 });
    assert.equal(params(out).get("q"), "90");
  });

  // The regression this clamp exists for: Vercel's built-in optimizer
  // never rendered wider than the source, Sanity's API happily does.
  // Without the clamp, every asset narrower than deviceSizes' 1920
  // ceiling would start being upscaled the moment this loader shipped.
  it("never requests more pixels than the source has", () => {
    const out = sanityImageLoader({ src: `${CDN}/abc-530x474.png`, width: 1920 });
    assert.equal(params(out).get("w"), "530");
  });

  it("collapses every oversized srcset entry onto one URL", () => {
    const src = `${CDN}/abc-530x474.png`;
    const wide = [640, 828, 1080, 1920].map((width) => sanityImageLoader({ src, width }));
    assert.equal(new Set(wide).size, 1, "oversized widths should all resolve to the same URL");
  });

  it("still serves smaller widths at their own size", () => {
    const out = sanityImageLoader({ src: `${CDN}/abc-1600x900.webp`, width: 384 });
    assert.equal(params(out).get("w"), "384");
  });

  it("overwrites a width the source URL already carries", () => {
    // articleCoverUrl builds its URL with .width(), so ?w= is already
    // present before the loader ever sees it — each srcset entry must win
    // over that base value, not append a second one.
    const out = sanityImageLoader({ src: `${CDN}/abc-1600x900.webp?w=1600`, width: 640 });
    assert.equal(params(out).getAll("w").length, 1);
    assert.equal(params(out).get("w"), "640");
  });

  it("passes non-Sanity sources through untouched", () => {
    for (const src of [
      "/design-lab/photos/04.webp",
      "/_next/static/media/book-hero.abc123.png",
      "https://example.com/photo.jpg",
    ]) {
      assert.equal(sanityImageLoader({ src, width: 828 }), src);
    }
  });

  it("falls back to the requested width when the filename carries no dimensions", () => {
    const out = sanityImageLoader({ src: `${CDN}/abc.webp`, width: 1080 });
    assert.equal(params(out).get("w"), "1080");
    // fit=max is the server-side backstop for exactly this case.
    assert.equal(params(out).get("fit"), "max");
  });
});
