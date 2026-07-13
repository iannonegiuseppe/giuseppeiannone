import { Cormorant, Source_Sans_3 } from "next/font/google";

// Stage 3.5 groundwork — scoped to /styleguide only via these two
// `.variable` classes applied on the page's own root wrapper div (see
// page.tsx), never on <html>/<body> — the rest of the site keeps Lato/
// Marcellus (layout.tsx) untouched. Latin + Latin Extended-A covers
// Italian diacritics (à, è, ì, ò, ù, etc.) that plain "latin" alone
// doesn't guarantee full coverage for in every Google Fonts subset.
//
// Weights loaded are exactly what this page's own type scale and
// emphasis technique use — no unused cuts:
// - 400 + 400 italic: body/UI text and the italic emphasis technique.
// - 600: eyebrow labels and the button label.
export const sourceSans3 = Source_Sans_3({
  variable: "--sg-font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Companion italic serif for heading-emphasis Variant B (shine) and
// Variant C (single-family candidate). 500 normal is only needed for
// Variant C's upright heading; 500 italic drives both B and C's
// emphasized word.
export const cormorant = Cormorant({
  variable: "--sg-font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
  style: ["normal", "italic"],
  display: "swap",
});
