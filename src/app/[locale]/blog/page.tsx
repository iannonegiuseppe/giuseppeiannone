import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getBlogIndex } from "@/sanity/articles";
import { articlesPath } from "@/sanity/paths";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";
import { BlogIndexView } from "./BlogIndexView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as "it" | "en";
  const [siteSettings, blogIndex] = await Promise.all([
    getSiteSettings(locale),
    getBlogIndex(locale),
  ]);

  return await buildMetadata({
    locale: typedLocale,
    title: blogIndex?.heading ?? "Blog",
    seo: blogIndex?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: articlesPath("it"),
      en: articlesPath("en"),
    },
  });
}

export default async function BlogListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BlogIndexView locale={locale} pageNumber={1} />;
}
