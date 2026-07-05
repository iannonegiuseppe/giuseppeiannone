import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { client, sanityFetch } from "@/sanity/client";
import { extractHeadings, headingIdsByKey } from "@/sanity/headings";
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildMedicalWebPageJsonLd,
  extractFaqEntries,
  type MedicalEntityType,
} from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import type { AlternateEntry } from "@/sanity/paths";
import { pillarLocalizedPaths, pillarPath } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { pillarPageQuery, pillarSlugsQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import { TableOfContents } from "@/sanity/TableOfContents";

interface PillarPageData {
  _id: string;
  title: string;
  body: unknown;
  seo?: SeoFields;
  medicalEntityType?: MedicalEntityType;
  alternates?: AlternateEntry[];
}

function getPillarPage(locale: string, slug: string) {
  return sanityFetch<PillarPageData | null>(pillarPageQuery, { locale, slug }, [
    "pillarPage",
    `pillarPage:${slug}`,
  ]);
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const pillars = await client.fetch<{ slug: string }[]>(pillarSlugsQuery, {
    locale: params.locale,
  });

  return pillars.map((pillar) => ({ pillarSlug: pillar.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; pillarSlug: string }>;
}): Promise<Metadata> {
  const { locale, pillarSlug } = await params;
  const [data, siteSettings] = await Promise.all([
    getPillarPage(locale, pillarSlug),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: locale as "it" | "en",
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: pillarLocalizedPaths(data?.alternates),
  });
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ locale: string; pillarSlug: string }>;
}) {
  const { locale, pillarSlug } = await params;
  setRequestLocale(locale);

  const data = await getPillarPage(locale, pillarSlug);
  if (!data) notFound();

  const typedLocale = locale as "it" | "en";
  const siteUrl = getSiteUrl();
  const path =
    pillarLocalizedPaths(data.alternates)[typedLocale] ??
    pillarPath(typedLocale, pillarSlug);
  const pageUrl = `${siteUrl}${path}`;

  const trail = await getPillarTrail(typedLocale, data.title, path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);
  const medicalWebPageJsonLd = buildMedicalWebPageJsonLd({
    url: pageUrl,
    name: data.title,
    description: data.seo?.metaDescription,
    medicalEntityType: data.medicalEntityType,
  });
  const faqEntries = extractFaqEntries(data.body);
  const faqPageJsonLd =
    faqEntries.length > 0 ? buildFaqPageJsonLd(faqEntries) : undefined;

  const headings = extractHeadings(data.body);
  const headingIds = headingIdsByKey(headings);

  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={medicalWebPageJsonLd} />
      {faqPageJsonLd ? <JsonLdScript data={faqPageJsonLd} /> : null}
      <Breadcrumbs trail={trail} />
      <h1>{data.title}</h1>
      <TableOfContents locale={locale} headings={headings} />
      <PortableText
        value={data.body as never}
        components={getPortableTextComponents(locale, headingIds)}
      />
    </main>
  );
}
