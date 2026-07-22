import type { Image as SanityImage } from "sanity";
import { getTranslations } from "next-intl/server";
import { DiplomiCardRow, type ResolvedQualification } from "./DiplomiCardRow";
import { imageDimensions, urlFor } from "@/sanity/image";
import type { Locale } from "@/sanity/paths";
import styles from "./DiplomiSection.module.scss";

// homePage-array migration pass: this shape is now an array item on
// homePage.diplomi.items (see homePage.ts's own comment), not a separate
// `qualification` document — _key replaces _id as the stable identifier
// (array items don't have _id).
interface QualificationItemData {
  _key: string;
  year: string;
  title: string;
  institution: string;
  tier: "titolo" | "formazione_continua";
  document?: SanityImage;
  documentLqip?: string;
}

// Diplomi rebuild — card row + lightbox, replacing the old Swiper-
// branded slider (which, checked directly: never actually depended on
// the `swiper` package at all — no entry in package.json, package-
// lock.json, or node_modules; it was a hand-rolled scroll-snap track.
// Nothing to remove there, see this pass's own report). Server
// component: resolves every qualification's document image into a
// thumbnail URL, a lightbox URL, its real intrinsic dimensions (from
// the asset ref, via imageDimensions — needed for the lightbox's
// non-fill <Image>, so portrait and landscape scans both size correctly
// without distortion), and its LQIP blur placeholder, so
// DiplomiCardRow/QualificationDialog (client) never touch urlFor or
// Sanity image objects directly.
//
// UI-chrome strings (arrow/close aria-labels, the card button's "view
// document" suffix) come from messages/{it,en}.json's new "Diplomi"
// namespace, resolved here (getTranslations, server-side) and passed
// down as plain props — no component in this codebase currently calls
// next-intl's client-side useTranslations(), so this matches the
// established pattern (Footer.tsx does the same server-side resolve +
// prop-pass for its own chrome strings) rather than introducing a new
// one for just this section.
//
// Section stays wherever the gate currently has it in page.tsx's own
// JSX order (after Journey/"How therapy helps", before Chi sono) — this
// pass only rebuilds the component itself, it does not touch the gate.
export async function DiplomiSection({
  kicker,
  heading,
  alboLine,
  qualifications,
  locale,
}: {
  kicker: string;
  heading: string;
  alboLine?: string;
  qualifications?: QualificationItemData[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "Diplomi" });

  const resolved: ResolvedQualification[] = (qualifications ?? []).map((q) => {
    const dims = q.document ? imageDimensions(q.document) : null;
    return {
      id: q._key,
      year: q.year,
      title: q.title,
      institution: q.institution,
      thumbnailUrl: q.document ? urlFor(q.document).width(440).format("webp").url() : undefined,
      lightboxUrl: q.document ? urlFor(q.document).width(1400).format("webp").url() : undefined,
      lightboxLqip: q.documentLqip,
      width: dims?.width ?? 1400,
      height: dims?.height ?? 1980,
    };
  });

  return (
    <section className={styles.diplomiSection} data-lab-section="diplomi">
      <DiplomiCardRow
        kicker={kicker}
        heading={heading}
        alboLine={alboLine}
        qualifications={resolved}
        prevLabel={t("prevLabel")}
        nextLabel={t("nextLabel")}
        closeLabel={t("closeLabel")}
        viewDocumentSuffix={t("viewDocumentSuffix")}
      />
    </section>
  );
}
