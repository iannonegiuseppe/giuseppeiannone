import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getArticlesTotalPages, getBlogIndex } from "@/sanity/articles";
import { articlesPath } from "@/sanity/paths";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";
import { BlogIndexView } from "../../BlogIndexView";

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const totalPages = await getArticlesTotalPages(params.locale);
  // Page 1 is /blog itself (see page redirect below) — only 2..totalPages
  // get their own static route here.
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}): Promise<Metadata> {
  const { locale, page } = await params;
  const typedLocale = locale as "it" | "en";
  const [siteSettings, blogIndex] = await Promise.all([
    getSiteSettings(locale),
    getBlogIndex(locale),
  ]);

  return await buildMetadata({
    locale: typedLocale,
    title: `${blogIndex?.heading ?? "Blog"} — ${typedLocale === "en" ? "page" : "pagina"} ${page}`,
    seo: blogIndex?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: `${articlesPath("it")}/page/${page}`,
      en: `${articlesPath("en")}/page/${page}`,
    },
  });
}

export default async function BlogListingPagedPage({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}) {
  const { locale, page } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) notFound();
  if (pageNumber === 1) redirect(articlesPath(typedLocale));

  const totalPages = await getArticlesTotalPages(locale);
  if (pageNumber > totalPages) notFound();

  return <BlogIndexView locale={locale} pageNumber={pageNumber} />;
}
