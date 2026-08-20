import { PortableText } from "next-sanity";
import { ContactBlock } from "@/components/ContactBlock";
import { LightPortraitHero } from "@/components/LightPortraitHero";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { sanityFetch } from "@/sanity/client";
import { getArticlesPage, getBlogIndex, getHeroPortrait } from "@/sanity/articles";
import { getAreaChipCounts } from "@/sanity/areaTaxonomy";
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

// Same photo the homepage's own ContactBlock invocation and the article
// page's end-of-article ContactBlock both use — see article page.tsx's
// own comment for why this hardcoded design-lab path (not a Sanity image)
// is the honest, non-forked choice here too.
const CONTACT_PHOTO_URL = "/design-lab/photos/09.webp";
const CONTACT_PHOTO_ALT = "Giuseppe Iannone, ritratto.";

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

  const [{ articles, totalPages }, blogIndex, heroPortrait, contactCopy, siteSettings, areaCounts] =
    await Promise.all([
      getArticlesPage(locale, pageNumber),
      getBlogIndex(locale),
      getHeroPortrait(locale),
      getContactSectionCopy(locale),
      getSiteSettings(locale),
      getAreaChipCounts(typedLocale),
    ]);

  // Category-chip pass — only pillars with at least one article in this
  // locale get a chip (see getAreaChipCounts's own comment); "other" never
  // gets one at all, it only ever shows under "Tutti"/"All".
  const chips = areaCounts.areas.map((area) => ({ id: area.id, title: area.title }));

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
          photo={heroPortrait?.photo}
          priority
          mobileCutoutAnchor
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
