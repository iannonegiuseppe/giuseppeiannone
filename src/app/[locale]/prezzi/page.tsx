import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { ContactBlock } from "@/components/ContactBlock";
import { ReadingArea } from "@/components/ReadingArea";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { sanityFetch } from "@/sanity/client";
import { extractHeadings, headingIdsByKey } from "@/sanity/headings";
import { buildBreadcrumbListJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import { pricePath } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { contactSectionQuery, pricePageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface PricePageData {
  title?: string;
  body: unknown;
  seo?: SeoFields;
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

function getPricePage(locale: string) {
  return sanityFetch<PricePageData | null>(pricePageQuery, { locale }, ["pricePage"]);
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// Prezzi build pass — canonical/hreflang built the Chi sono way: fixed,
// hardcoded from pricePath() directly, never derived from an `alternates`
// GROQ projection. That's a deliberate choice, not an oversight — see
// CLAUDE.md's own "Singleton page routes" section for the full reasoning
// (the alternates-projection pattern is what caused chi-sono's own
// canonical-resolves-to-"/" bug, and it buys nothing here: pricePath()
// already knows both locales' URLs at code time, there's no document
// lookup that could come back empty).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as "it" | "en";
  const [data, siteSettings] = await Promise.all([
    getPricePage(locale),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: pricePath("it"),
      en: pricePath("en"),
    },
  });
}

export default async function PricePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const [data, contactCopy, siteSettings] = await Promise.all([
    getPricePage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const siteUrl = getSiteUrl();
  const path = pricePath(typedLocale);

  const trail = await getPillarTrail(typedLocale, data?.title ?? "", path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const headings = extractHeadings(data?.body);
  const headingIds = headingIdsByKey(headings);
  const components = await getPortableTextComponents(locale, headingIds);

  const contactSection = contactCopy?.contactSection;
  // Same hardcoded design-lab asset every other ContactBlock caller uses
  // — see [locale]/[slug]/page.tsx's own comment for the full reasoning.
  const contactPhotoUrl = "/design-lab/photos/09.webp";
  const contactPhotoAlt = "Giuseppe Iannone, ritratto.";

  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />
      <div className={styles.lightIsland}>
        <div className={styles.header}>
          <Breadcrumbs trail={trail} />
          <h1 className={styles.title}>{data?.title}</h1>
        </div>
        <ReadingArea headings={headings}>
          <PortableText value={data?.body as never} components={components} />
        </ReadingArea>
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
