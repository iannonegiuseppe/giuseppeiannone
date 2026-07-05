import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { client } from "@/sanity/client";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { allSubtopicSlugsQuery, subtopicPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";

interface AlternateEntry {
  language: string;
  slug?: string;
  parentSlug?: string | null;
}

interface SubtopicPageData {
  _id: string;
  title: string;
  body: unknown;
  seo?: SeoFields;
  alternates?: AlternateEntry[];
}

function getSubtopicPage(locale: string, pillarSlug: string, slug: string) {
  return client.fetch<SubtopicPageData | null>(
    subtopicPageQuery,
    { locale, pillarSlug, slug },
    { next: { tags: ["subtopicPage", `subtopicPage:${slug}`] } },
  );
}

function buildLocalizedPaths(alternates: AlternateEntry[] | undefined) {
  const paths: Partial<Record<"it" | "en", string>> = {};

  for (const alt of alternates ?? []) {
    if (!alt.slug || !alt.parentSlug) continue;
    if (alt.language !== "it" && alt.language !== "en") continue;
    paths[alt.language] =
      alt.language === "it"
        ? `/${alt.parentSlug}/${alt.slug}`
        : `/en/${alt.parentSlug}/${alt.slug}`;
  }

  return paths;
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
    localizedPaths: buildLocalizedPaths(data?.alternates),
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

  return (
    <main>
      <h1>{data.title}</h1>
      <PortableText
        value={data.body as never}
        components={getPortableTextComponents(locale)}
      />
    </main>
  );
}
