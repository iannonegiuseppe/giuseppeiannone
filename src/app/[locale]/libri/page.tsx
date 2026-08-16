import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { LibriBookPromo } from "@/components/LibriBookPromo";
import { LibriForm } from "@/components/LibriForm";
import { LibriHero } from "@/components/LibriHero";
import { LibriIndexSection } from "@/components/LibriIndexSection";
import { imageDimensions, urlFor } from "@/sanity/image";
import { sanityFetch } from "@/sanity/client";
import { libriPath, type Locale } from "@/sanity/paths";
import { libriPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

export interface LibriChapter {
  title: string;
  description: string;
}

interface LibriFormCopy {
  kicker: string;
  heading: string;
  lead: string;
  consentLabel: string;
  marketingLabel: string;
  submitLabel: string;
}

// Sanity's own image type doesn't know about the "alt" field this
// schema adds under it — extended locally rather than widened in the
// shared Image import.
type CoverImageField = SanityImage & { alt?: string };

interface LibriBookCopy {
  kicker: string;
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  amazonUrl?: string;
  coverImage?: CoverImageField;
}

interface LibriPageData {
  kicker: string;
  title: string;
  titleEmphasisWord?: string;
  lead: string;
  indexKicker: string;
  indexTitle: string;
  indexTitleEmphasisWord?: string;
  indexLead: string;
  chapter1: LibriChapter;
  chapter2: LibriChapter;
  chapter3: LibriChapter;
  chapter4: LibriChapter;
  chapter5: LibriChapter;
  chapter6: LibriChapter;
  coverTitle: string;
  metaLine: string;
  guideCoverImage?: CoverImageField;
  guidePdfUrl?: string | null;
  form: LibriFormCopy;
  book: LibriBookCopy;
  seo?: SeoFields;
}

function getLibriPage(locale: string) {
  return sanityFetch<LibriPageData | null>(libriPageQuery, { locale }, ["libriPage"]);
}

// Resolves a Sanity image field into what BookCover actually needs: a
// URL (native resolution, webp — Next's own optimizer handles
// responsive resizing/reformatting from there, same pattern
// HeroOverlap.tsx already uses for its own real photo), the alt text,
// and the asset's REAL pixel dimensions (read from the asset ref itself,
// no extra GROQ dereference — see image.ts's own imageDimensions
// comment) so the cover's container can be sized to the image's true
// aspect ratio instead of a guessed one.
export interface ResolvedCoverImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

function resolveCoverImage(image: CoverImageField | undefined): ResolvedCoverImage | null {
  if (!image?.asset) return null;
  const dims = imageDimensions(image);
  if (!dims) return null;
  return {
    url: urlFor(image).format("webp").url(),
    alt: image.alt ?? "",
    width: dims.width,
    height: dims.height,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [data, siteSettings] = await Promise.all([getLibriPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    // Singleton page routes convention (CLAUDE.md) — built directly from
    // the path function, never from an alternates/translation.metadata
    // projection: the URL is already known in code for a fixed page like
    // this one, same as every other singleton route (aboutPath, pricePath,
    // ...). Confirmed live before writing this: pricePage itself has no
    // translation.metadata pairing either (checked directly against the
    // dataset) — this pattern is what actually makes those pages' hreflang
    // correct today, not an oversight this page would be repeating.
    localizedPaths: {
      it: libriPath("it"),
      en: libriPath("en"),
    },
  });
}

export default async function LibriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [data, siteSettings] = await Promise.all([getLibriPage(locale), getSiteSettings(locale)]);
  if (!data) notFound();

  const chapters: LibriChapter[] = [
    data.chapter1,
    data.chapter2,
    data.chapter3,
    data.chapter4,
    data.chapter5,
    data.chapter6,
  ];

  // Same "Dr. {name}" byline pattern layout.tsx's own JSON-LD and
  // ContactBlock already use — not a separate free-text field, so the
  // name only ever needs updating in one place (siteSettings.author).
  const byline = siteSettings?.author?.name ? `Dr. ${siteSettings.author.name}` : "";

  const guideCover = resolveCoverImage(data.guideCoverImage);
  const bookCover = resolveCoverImage(data.book.coverImage);

  return (
    <main className={styles.page}>
      <LibriHero
        locale={typedLocale}
        kicker={data.kicker}
        title={data.title}
        titleEmphasisWord={data.titleEmphasisWord}
        lead={data.lead}
      />

      <LibriIndexSection
        kicker={data.indexKicker}
        title={data.indexTitle}
        titleEmphasisWord={data.indexTitleEmphasisWord}
        lead={data.indexLead}
        chapters={chapters}
        coverTitle={data.coverTitle}
        coverKicker={data.indexKicker}
        byline={byline}
        metaLine={data.metaLine}
        coverImage={guideCover}
      />

      {/* Tonal-separation pass (item 3) — the form and the published book
          used to share one dark section and read as one continuous block,
          as if the form belonged to buying the book rather than
          downloading the free guide. Split into two sections with
          genuinely different grounds: the form sits on a light island
          (tone.light-island-surface, the same "surface step" the index
          section above and the sitewide ContactForm already use), the
          book stays on the page's own plain ambient dark ("base ground").
          This also fixes item 2's placeholder-contrast bug as a side
          effect — ContactForm.module.scss's field colors are computed for
          exactly this light-island context (see this pass's own report);
          rendered on the prior ambient-dark ground, --color-text-muted
          resolved to the DARK theme's ivory-on-white near-invisible value
          instead. AnimatedDivider (item 6) sits at the top of the light
          section, right at the seam with the index section above — two
          adjacent light-island sections need a seam marker or they'd read
          as one continuous light block, which is exactly what a plain
          section boundary would NOT provide here. No second divider
          between form and book: the tone change itself (light vs. dark)
          is already the most distinct boundary this page has. */}
      <section className={styles.formSection}>
        <div className={styles.formInner}>
          <AnimatedDivider className={styles.sectionDivider} />
          <LibriForm copy={data.form} locale={typedLocale} pdfUrl={data.guidePdfUrl ?? null} />
        </div>
      </section>

      <section className={styles.bookSection} data-sheen="upper-left">
        <div className={styles.bookInner}>
          <LibriBookPromo copy={data.book} byline={byline} coverImage={bookCover} />
        </div>
      </section>
    </main>
  );
}
