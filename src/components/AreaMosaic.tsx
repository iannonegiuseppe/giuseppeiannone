import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Image as SanityImage } from "sanity";
import { imageDimensions, urlFor } from "@/sanity/image";
import { pillarPath, type Locale } from "@/sanity/paths";
import styles from "./AreaMosaic.module.scss";

export interface AreaMosaicItem {
  _id: string;
  title: string;
  slug: string;
  heroImage?: (SanityImage & { alt?: string }) | undefined;
  subtopicCount: number;
}

// Chi sono opening pass — "Di cosa mi occupo"'s full-bleed area grid.
// Order is deliberate (anxiety first, the anxiety/panic cluster leading,
// trauma closing), not alphabetical and not query order — same
// "hardcode it, don't add a field" call already made for the Studio desk
// tree. Keyed by the STABLE middle segment of each pillarPage _id
// (pillarPage-{key}-{locale}), not by slug — slugs differ per locale,
// the key doesn't, so one order array covers both languages.
const AREA_ORDER = ["anxiety", "panic", "stress", "relazioni", "coppia", "sessuali", "trauma"];
const DOUBLE_KEY = "anxiety";

// Uneven-mosaic pass — desktop tile positions, named to match
// AreaMosaic.module.scss's own grid-template-areas (3 explicit rows,
// anxiety a true 2-col×2-row dominant tile top-left; the other six in
// two distinct sizes — four 1×1, two 2×1 — arranged so no two rows read
// the same). Assigned via a CSS custom property rather than one class
// per area: seven fixed positions on a shared template is exactly what
// grid-area/var() is for, and it keeps this file from growing seven
// near-identical SCSS classes. Mobile ignores this entirely — see
// .tile's own breakpoint-gated rule.
const AREA_GRID_SLOT: Record<string, string> = {
  anxiety: "anx",
  panic: "pan",
  stress: "str",
  relazioni: "rel",
  coppia: "cop",
  sessuali: "ses",
  trauma: "tra",
};

function keyFromId(id: string): string {
  return id.replace(/^pillarPage-/, "").replace(/-(it|en)$/, "");
}

export function AreaMosaic({
  items,
  locale,
  subtopicCountLabel,
}: {
  items: AreaMosaicItem[];
  locale: Locale;
  // e.g. "3 sottotemi" / "3 subtopics" — built by the caller (already
  // has the translated noun), this component just decides WHICH tile
  // gets it.
  subtopicCountLabel?: (count: number) => string;
}) {
  const ordered = [...items].sort((a, b) => {
    const ai = AREA_ORDER.indexOf(keyFromId(a._id));
    const bi = AREA_ORDER.indexOf(keyFromId(b._id));
    return (ai === -1 ? AREA_ORDER.length : ai) - (bi === -1 ? AREA_ORDER.length : bi);
  });

  return (
    <div className={styles.mosaic}>
      {ordered.map((item) => {
        const key = keyFromId(item._id);
        const isDouble = key === DOUBLE_KEY;
        const dims = item.heroImage ? imageDimensions(item.heroImage) : null;
        const requestWidth = dims ? Math.min(dims.width, 1600) : undefined;
        const href = pillarPath(locale, item.slug);

        return (
          <Link
            key={item._id}
            href={href}
            className={`${styles.tile} ${isDouble ? styles.tileDouble : ""}`}
            style={{ "--tile-area": AREA_GRID_SLOT[key] } as CSSProperties}
          >
            {item.heroImage && requestWidth ? (
              <Image
                src={urlFor(item.heroImage).width(requestWidth).url()}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={styles.tileImage}
              />
            ) : null}
            <span className={styles.tileScrim} aria-hidden="true" />
            <span className={styles.tileLabel}>
              {item.title}
              {isDouble && subtopicCountLabel ? (
                <span className={styles.tileSubcount}>{subtopicCountLabel(item.subtopicCount)}</span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
