import type { Image as SanityImage } from "sanity";
import type { DiplomiLabItem } from "@/components/DiplomiSlider";
import { imageDimensions, urlFor } from "./image";

// One item of homePage.diplomi.items — same shape wherever it's fetched
// from (currently the homepage; the Chi sono page reads the identical
// array). _key, not _id: this is a Sanity array item, not its own
// document.
export interface QualificationItemData {
  _key: string;
  year: string;
  title: string;
  institution: string;
  tier: "titolo" | "formazione_continua";
  document?: SanityImage;
  documentLqip?: string;
  // Privacy-gate pair — see homePage.ts's own comment on these two
  // fields. `interactive` below reads exclusively from these, never from
  // `document` above (the older, separate field this item type also
  // carries).
  scan?: SanityImage;
  scanRedacted?: boolean;
  scanLqip?: string;
}

// Extracted from src/app/[locale]/page.tsx (the homepage), where this
// lived inline until a second caller (the Chi sono page) needed the same
// gate — a duplicated copy would have been free to silently diverge from
// the original the next time either one changed. Single source of truth
// for "is this qualification's scan safe/allowed to show in the
// lightbox": scan present AND scanRedacted explicitly true. Never left to
// the client to infer.
export function resolveDiplomiLabItems(
  items: QualificationItemData[] | undefined,
): DiplomiLabItem[] {
  return (items ?? []).map((item) => {
    const interactive = Boolean(item.scan) && item.scanRedacted === true;
    const dims = item.scan ? imageDimensions(item.scan) : null;
    return {
      id: item._key,
      year: item.year,
      title: item.title,
      institution: item.institution,
      interactive,
      scanLqip: interactive ? item.scanLqip : undefined,
      lightboxUrl:
        interactive && item.scan
          ? urlFor(item.scan).width(2000).quality(82).format("webp").url()
          : undefined,
      width: dims?.width ?? 1400,
      height: dims?.height ?? 1980,
    };
  });
}
