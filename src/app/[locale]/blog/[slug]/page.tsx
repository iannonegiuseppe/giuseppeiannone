import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { getArticleBySlug, getArticleSlugs } from "@/sanity/articles";
import { imageDimensions, urlFor } from "@/sanity/image";
import { articlePath, articlesPath } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  cover?: (SanityImage & { alt?: string }) | undefined;
  excerpt?: string;
  tags?: string[];
  body: unknown;
  seo?: SeoFields;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const slugs = await getArticleSlugs(params.locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale as "it" | "en";
  const [data, siteSettings] = await Promise.all([
    getArticleBySlug(locale, slug) as Promise<ArticleData | null>,
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: { [typedLocale]: articlePath(typedLocale, slug) },
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = (await getArticleBySlug(locale, slug)) as ArticleData | null;
  if (!data) notFound();

  const coverDimensions = data.cover ? imageDimensions(data.cover) : null;
  const components = await getPortableTextComponents(locale);

  return (
    <main>
      <a href={articlesPath(locale as "it" | "en")}>Blog</a>
      <h1>{data.title}</h1>
      {data.publishedAt ? (
        <time dateTime={data.publishedAt}>{data.publishedAt}</time>
      ) : null}
      {data.tags && data.tags.length > 0 ? (
        <ul>
          {data.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      ) : null}
      {data.cover && coverDimensions ? (
        <Image
          src={urlFor(data.cover).width(coverDimensions.width).url()}
          alt={data.cover.alt ?? data.title}
          width={coverDimensions.width}
          height={coverDimensions.height}
        />
      ) : null}
      <PortableText value={data.body as never} components={components} />
    </main>
  );
}
