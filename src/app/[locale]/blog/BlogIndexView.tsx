import { PortableText } from "next-sanity";
import type { Image as SanityImage } from "sanity";
import { ContactBlock } from "@/components/ContactBlock";
import { LightPortraitHero } from "@/components/LightPortraitHero";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { sanityFetch } from "@/sanity/client";
import { getArticlesPage, getBlogIndex } from "@/sanity/articles";
import { CONTACT_PHOTO_URL, CONTACT_PHOTO_ALT } from "@/sanity/contactPhoto";
import { getAreaChipCounts, getBlogCategoryChipCounts } from "@/sanity/areaTaxonomy";
import { type Locale } from "@/sanity/paths";
import { contactSectionQuery } from "@/sanity/queries";
import { getSiteSettings } from "@/sanity/seo";
import { BLOG_LIST_SECTION_ID, BlogPaginationScrollReset } from "./BlogPaginationScrollReset";
import { BlogFilterableSection } from "./BlogFilterableSection";
import {
  blogEditorialPortableTextComponents,
  splitEditorialIntoColumns,
  type EditorialBlock,
} from "./blogEditorialPortableText";
import styles from "./blogIndex.module.scss";

interface ContactSectionCopy {
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
  };
  googleProfileLabel?: string;
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// CONTACT_PHOTO_URL/ALT: single-sourced (src/sanity/contactPhoto.ts) — the
// same photo the homepage's own ContactBlock invocation and the article
// page's end-of-article ContactBlock both use.

// Blog index hero photo — was heroPortrait?.photo (getHeroPortrait(),
// reusing homePage.hero.photo via heroPortraitQuery). Replaced with the
// same manually-constructed-reference pattern as welcomePhotoUrl/
// portraitUrl/contactPhotoUrl (page.tsx) and metodo's own
// FIT_ENDING_PHOTO_URL: a background-free cutout, uploaded directly, not
// wired into any schema field. getHeroPortrait's own fetch and export are
// now unused by this file but left in src/sanity/articles.ts — orphan, not
// delete, matching this codebase's own established precedent (see this
// file's own LightPortraitHero.tsx import comment for another instance of
// the same rule).
const HERO_PHOTO: SanityImage & { alt?: string } = {
  _type: "image",
  asset: { _type: "reference", _ref: "image-2201b21dfe4c64eed850f140faf6f66ffae76293-1448x1040-png" },
};

// Item 2 (round 4) — full-width, two reading columns at lg (one below).
// splitEditorialIntoColumns (blogEditorialPortableText.tsx) does the
// actual grouping/splitting so a heading can never be orphaned from its
// own paragraphs at the column break — see that function's own comment.
// The .container global class is applied on the SAME element as the
// column grid (styles.editorialColumns), not a separate wrapper.
function EditorialSection({ editorial }: { editorial: EditorialBlock[] }) {
  const { columnOne, columnTwo } = splitEditorialIntoColumns(editorial);

  return (
    <section className={styles.editorial}>
      <RevealOnScroll className={`container ${styles.editorialColumns}`}>
        <div className={styles.editorialColumn}>
          <PortableText value={columnOne as never} components={blogEditorialPortableTextComponents} />
        </div>
        <div className={styles.editorialColumn}>
          <PortableText value={columnTwo as never} components={blogEditorialPortableTextComponents} />
        </div>
      </RevealOnScroll>
    </section>
  );
}

export async function BlogIndexView({
  locale,
  pageNumber,
}: {
  locale: string;
  pageNumber: number;
}) {
  const typedLocale = locale as Locale;

  const [{ articles, totalPages }, blogIndex, contactCopy, siteSettings, areaCounts, blogCategoryChips] =
    await Promise.all([
      getArticlesPage(locale, pageNumber),
      getBlogIndex(locale),
      getContactSectionCopy(locale),
      getSiteSettings(locale),
      getAreaChipCounts(typedLocale),
      getBlogCategoryChipCounts(typedLocale),
    ]);

  // Category-chip pass — only pillars with at least one article in this
  // locale get a chip (see getAreaChipCounts's own comment); "other" never
  // gets one at all, it only ever shows under "Tutti"/"All". Blog category-
  // chip pass (round 2): the five blog-only categories render as
  // ADDITIONAL chips after the seven pillars, never interleaved with them
  // — pillars first (their own fixed PILLAR_ORDER), then blog categories
  // (their own `order` field) — see getBlogCategoryChipCounts's own
  // comment for why each list sorts itself independently.
  const chips = [
    ...areaCounts.areas.map((area) => ({ id: area.id, title: area.title })),
    ...blogCategoryChips.map((category) => ({ id: category.id, title: category.title })),
  ];

  // Item — featured article is the single most recent article, page 1
  // only (order is already publishedAt desc, so articles[0] IS the most
  // recent on page 1; on later pages there is no "most recent" article to
  // feature, so the dark section goes straight into the grid). Sliced
  // once here so the featured article can never also render in the grid.
  const featured = pageNumber === 1 ? articles[0] : undefined;
  const gridArticles = pageNumber === 1 ? articles.slice(1) : articles;

  const contactSection = contactCopy?.contactSection;

  return (
    <>
      <BlogPaginationScrollReset />
      <main className={styles.page}>
        {/* 1. HERO — light ivory. Extracted to LightPortraitHero.tsx
            (/faq build pass, shared with that page) — see that file's own
            top comment for exactly what did and didn't change. */}
        <LightPortraitHero
          kicker={blogIndex?.kicker ?? "Blog"}
          heading={blogIndex?.heading ?? "Blog"}
          headingEmphasisWord={blogIndex?.headingEmphasisWord}
          intro={blogIndex?.intro}
          photo={HERO_PHOTO}
          priority
          cutoutGrounded
        />

        {/* 2. DARK SECTION — chips + featured/filtered + grid + pagination */}
        <section id={BLOG_LIST_SECTION_ID} className={styles.listSection}>
          <div className="container">
            <BlogFilterableSection
              locale={typedLocale}
              pageNumber={pageNumber}
              totalPages={totalPages}
              featured={featured}
              gridArticles={gridArticles}
              chips={chips}
            />
          </div>
        </section>

        {/* 3. CONTACT FORM — full width, the real shared ContactBlock */}
        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale={typedLocale}
          photoUrl={CONTACT_PHOTO_URL}
          photoAlt={CONTACT_PHOTO_ALT}
        />

        {/* 4. EDITORIAL BLOCK — light ivory, full container width, two columns at lg */}
        {blogIndex?.editorial ? (
          <EditorialSection editorial={blogIndex.editorial as EditorialBlock[]} />
        ) : null}
      </main>
    </>
  );
}
