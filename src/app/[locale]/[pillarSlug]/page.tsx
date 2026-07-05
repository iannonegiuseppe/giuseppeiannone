import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { client } from "@/sanity/client";
import { resolveRobots } from "@/sanity/metadata";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { pillarPageQuery, pillarSlugsQuery } from "@/sanity/queries";

interface PillarPageData {
  title: string;
  body: unknown;
  seo?: { metaTitle?: string; metaDescription?: string; noIndex?: boolean };
}

function getPillarPage(locale: string, slug: string) {
  return client.fetch<PillarPageData | null>(
    pillarPageQuery,
    { locale, slug },
    { next: { tags: ["pillarPage", `pillarPage:${slug}`] } },
  );
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
  const data = await getPillarPage(locale, pillarSlug);

  return {
    title: data?.seo?.metaTitle ?? data?.title,
    description: data?.seo?.metaDescription,
    robots: resolveRobots(data?.seo?.noIndex),
  };
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
