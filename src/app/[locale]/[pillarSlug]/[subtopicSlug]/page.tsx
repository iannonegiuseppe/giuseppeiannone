import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { client } from "@/sanity/client";
import { resolveRobots } from "@/sanity/metadata";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { allSubtopicSlugsQuery, subtopicPageQuery } from "@/sanity/queries";

interface SubtopicPageData {
  title: string;
  body: unknown;
  seo?: { metaTitle?: string; metaDescription?: string; noIndex?: boolean };
}

function getSubtopicPage(locale: string, pillarSlug: string, slug: string) {
  return client.fetch<SubtopicPageData | null>(
    subtopicPageQuery,
    { locale, pillarSlug, slug },
    { next: { tags: ["subtopicPage", `subtopicPage:${slug}`] } },
  );
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
  const data = await getSubtopicPage(locale, pillarSlug, subtopicSlug);

  return {
    title: data?.seo?.metaTitle ?? data?.title,
    description: data?.seo?.metaDescription,
    robots: resolveRobots(data?.seo?.noIndex),
  };
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
