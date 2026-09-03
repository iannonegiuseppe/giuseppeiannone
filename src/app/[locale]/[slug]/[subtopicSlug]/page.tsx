import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { ContactBlock } from "@/components/ContactBlock";
import { PillarFaq, type PillarFaqItem } from "@/components/PillarFaq";
import { PillarHero } from "@/components/PillarHero";
import { ReadingArea } from "@/components/ReadingArea";
import { SubtopicEpigraph } from "@/components/SubtopicEpigraph";
import { getSubtopicTrail } from "@/sanity/breadcrumbs";
import { sanityFetch, sanityFetchPublished } from "@/sanity/client";
import { CONTACT_PHOTO_URL as contactPhotoUrl, CONTACT_PHOTO_ALT as contactPhotoAlt } from "@/sanity/contactPhoto";
import { extractHeadings, headingIdsByKey } from "@/sanity/headings";
import {
  buildBreadcrumbListJsonLd,
  buildMedicalWebPageJsonLd,
  type MedicalEntityType,
} from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import type { AlternateEntry } from "@/sanity/paths";
import {
  pillarPath as buildPillarPath,
  subtopicLocalizedPaths,
  subtopicPath,
} from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { allSubtopicSlugsQuery, contactSectionQuery, subtopicPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale. Applies per
// generated slug, same as any other ISR route with generateStaticParams
// — each subtopic page gets its own independent revalidation window.
export const revalidate = 86400;

interface SubtopicPageData {
  _id: string;
  title: string;
  parentPillarTitle?: string;
  heroImage?: (SanityImage & { alt?: string }) | undefined;
  heroKicker?: string;
  standfirst?: string;
  titleEmphasisWord?: string;
  epigraph?: string;
  faqItems?: PillarFaqItem[];
  body: unknown;
  seo?: SeoFields;
  medicalEntityType?: MedicalEntityType;
  alternates?: AlternateEntry[];
  parentPillarAlternates?: AlternateEntry[];
}

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

function getSubtopicPage(locale: string, pillarSlug: string, slug: string) {
  return sanityFetch<SubtopicPageData | null>(
    subtopicPageQuery,
    { locale, pillarSlug, slug },
    ["subtopicPage", `subtopicPage:${slug}`],
  );
}

function currentParentSlug(
  alternates: AlternateEntry[] | undefined,
  locale: string,
) {
  return alternates?.find((alt) => alt.language === locale)?.parentSlug;
}

// Fallback-target pass — used only when THIS subtopic has no own
// counterpart in otherLocale (17 of 21 today): falls back to the parent
// pillar's page in otherLocale instead of the homepage, since that's the
// nearest section that's actually still about the same topic. Returns
// undefined when the parent pillar itself has no otherLocale counterpart
// either — buildMetadata then leaves fallbackPath unset, and
// LocaleSwitcher keeps its own plain home fallback, same as a pillar page
// gets by deliberately never passing fallbackPath at all.
function parentPillarFallbackPath(
  parentPillarAlternates: AlternateEntry[] | undefined,
  otherLocale: "it" | "en",
): string | undefined {
  const otherSlug = parentPillarAlternates?.find(
    (alt) => alt.language === otherLocale,
  )?.slug;
  return otherSlug ? buildPillarPath(otherLocale, otherSlug) : undefined;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const subtopics = await sanityFetchPublished<
    { pillarSlug: string; subtopicSlug: string }[]
  >(allSubtopicSlugsQuery, { locale: params.locale }, ["subtopicPage"]);

  // Route-param key is `slug` (the parent segment's folder is now
  // [locale]/[slug]/[subtopicSlug], renamed from [pillarSlug] — root-
  // namespace pass, see [locale]/[slug]/page.tsx's own comment). The
  // GROQ result field stays `pillarSlug`; only the returned param key
  // changes to match the folder rename.
  return subtopics.map((subtopic) => ({
    slug: subtopic.pillarSlug,
    subtopicSlug: subtopic.subtopicSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; subtopicSlug: string }>;
}): Promise<Metadata> {
  const { locale, slug: pillarSlug, subtopicSlug } = await params;
  const typedLocale = locale as "it" | "en";
  const otherLocale: "it" | "en" = typedLocale === "it" ? "en" : "it";
  const [data, siteSettings] = await Promise.all([
    getSubtopicPage(locale, pillarSlug, subtopicSlug),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: subtopicLocalizedPaths(data?.alternates),
    fallbackPath: parentPillarFallbackPath(data?.parentPillarAlternates, otherLocale),
  });
}

export default async function SubtopicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; subtopicSlug: string }>;
}) {
  const { locale, slug: pillarSlug, subtopicSlug } = await params;
  setRequestLocale(locale);

  const data = await getSubtopicPage(locale, pillarSlug, subtopicSlug);
  if (!data) notFound();

  const typedLocale = locale as "it" | "en";
  const siteUrl = getSiteUrl();
  const path =
    subtopicLocalizedPaths(data.alternates)[typedLocale] ??
    subtopicPath(typedLocale, pillarSlug, subtopicSlug);
  const pageUrl = `${siteUrl}${path}`;
  const parentSlug = currentParentSlug(data.alternates, locale) ?? pillarSlug;
  const parentPillarPath = buildPillarPath(typedLocale, parentSlug);

  const trail = await getSubtopicTrail(
    typedLocale,
    data.parentPillarTitle ?? "",
    parentPillarPath,
    data.title,
    path,
  );
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);
  const medicalWebPageJsonLd = buildMedicalWebPageJsonLd({
    url: pageUrl,
    name: data.title,
    description: data.seo?.metaDescription,
    medicalEntityType: data.medicalEntityType,
  });

  const headings = extractHeadings(data.body);
  const headingIds = headingIdsByKey(headings);
  const components = await getPortableTextComponents(locale, headingIds);

  const [siteSettings, contactCopy] = await Promise.all([
    getSiteSettings(locale),
    getContactSectionCopy(locale),
  ]);
  const contactSection = contactCopy?.contactSection;
  // contactPhotoUrl/contactPhotoAlt: single-sourced (src/sanity/contactPhoto.ts).

  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={medicalWebPageJsonLd} />

      {/* Sections 1-2: Hero, Epigraph — same dark-band/heroViewport
          mechanism as the pillar route, minus PillarFactsStrip/
          PillarRecognition (deliberately not part of this template, see
          this pass's own report). */}
      <div className={styles.darkBand}>
        <div className={styles.heroViewport}>
          <PillarHero
            trail={trail}
            heroKicker={data.heroKicker ?? ""}
            title={data.title}
            titleEmphasisWord={data.titleEmphasisWord}
            standfirst={data.standfirst ?? ""}
            heroImage={data.heroImage}
          />
        </div>
        <SubtopicEpigraph quote={data.epigraph} />
      </div>

      {/* Sections 3-5: Body, FAQ, Contact — same light-island mechanism
          as the pillar route. No RelatedArticlesGrid: not part of this
          template. */}
      <div className={styles.lightIsland}>
        <ReadingArea headings={headings}>
          <PortableText value={data.body as never} components={components} />
        </ReadingArea>

        <PillarFaq locale={locale} items={data.faqItems} />

        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale={typedLocale}
          photoUrl={contactPhotoUrl}
          photoAlt={contactPhotoAlt}
        />
      </div>
    </main>
  );
}
