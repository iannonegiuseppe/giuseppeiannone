import type { Image as SanityImage } from "sanity";
import { urlFor } from "./image";

// Code-level fallback for a sede address with no real photo — deliberately
// a drawn line-art illustration, not a stock photograph (that's what this
// replaces; see the removal of INTERIOR_STOCK_FALLBACK in page.tsx's own
// history), so it never reads as a claim about a real room. Single-sourced
// here rather than a per-document Sanity field, same reasoning as
// contactPhoto.ts: a location either has a real photo or it doesn't, and
// this must disappear automatically the moment a real one is set — a
// Sanity field would need unsetting again per location, and someone would
// forget. Every consumer that renders a sede/location photo (the homepage
// marquee, the map popups) falls back to this same constant, so an address
// with no real photo looks the same everywhere it appears.
//
// Exported as the raw image reference (not just a resolved URL) so a
// consumer that also needs pixel dimensions (SediPopupContent's
// imageDimensions() call, for next/image's required width/height) can
// read them off this same object — imageDimensions() only parses the
// asset _ref string, no network call, so this works exactly like a real
// Sanity-fetched image field would.
export const SEDE_PLACEHOLDER_IMAGE: SanityImage = {
  _type: "image",
  asset: { _ref: "image-63b5c62ab18725481ac327a89696f79106d93093-1800x1200-webp", _type: "reference" },
};
export const SEDE_PLACEHOLDER_URL = urlFor(SEDE_PLACEHOLDER_IMAGE).url();
export const SEDE_PLACEHOLDER_ALT = "Illustrazione di uno studio di consulenza — foto non ancora disponibile.";
