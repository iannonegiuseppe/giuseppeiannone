import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { getSubtopicTrail } from "@/sanity/breadcrumbs";
import { client } from "@/sanity/client";
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
import { allSubtopicSlugsQuery, subtopicPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";

interface SubtopicPageData {
  _id: string;
  title: string;
  parentPillarTitle?: string;
  body: unknown;
  seo?: SeoFields;
  medicalEntityType?: MedicalEntityType;
  alternates?: AlternateEntry[];
}

function getSubtopicPage(locale: string, pillarSlug: string, slug: string) {
  return client.fetch<SubtopicPageData | null>(
    subtopicPageQuery,
    { locale, pillarSlug, slug },
    { next: { tags: ["subtopicPage", `subtopicPage:${slug}`] } },
  );
}

function currentParentSlug(
  alternates: AlternateEntry[] | undefined,
  locale: string,
) {
  return alternates?.find((alt) => alt.language === locale)?.parentSlug;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const subtopics = await client.fetch<
    { pillarSlug: string; subtopicSlug: string }[]
  >(allSubtopicSlugsQuery, { locale: params.locale });

  return subtopics.map((subtopic) => ({
    pillarSlug: subtopic.pillarSlug,
    subtopicSlug: subtopic.subtopicSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; pillarSlug: string; subtopicSlug: string }>;
}): Promise<Metadata> {
  const { locale, pillarSlug, subtopicSlug } = await params;
  const [data, siteSettings] = await Promise.all([
    getSubtopicPage(locale, pillarSlug, subtopicSlug),
    getSiteSettings(locale),
  ]);

  return buildMetadata({
    locale: locale as "it" | "en",
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: subtopicLocalizedPaths(data?.alternates),
  });
}

export default async function SubtopicPage({
  params,
}: {
  params: Promise<{ locale: string; pillarSlug: string; subtopicSlug: string }>;
}) {
  const { locale, pillarSlug, subtopicSlug } = await params;
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

  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={medicalWebPageJsonLd} />
      <h1>{data.title}</h1>
      <PortableText
        value={data.body as never}
        components={getPortableTextComponents(locale)}
      />
    </main>
  );
}
