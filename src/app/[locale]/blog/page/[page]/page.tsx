import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getArticlesPage, getArticlesTotalPages } from "@/sanity/articles";
import { articlePath, articlesPath } from "@/sanity/paths";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";

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
  const siteSettings = await getSiteSettings(locale);

  return await buildMetadata({
    locale: typedLocale,
    title: `Blog — page ${page}`,
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

  const { articles, totalPages } = await getArticlesPage(locale, pageNumber);
  if (pageNumber > totalPages) notFound();

  return (
    <main>
      <h1>Blog</h1>
      <ul>
        {articles.map((article) => (
          <li key={article._id}>
            <Link href={articlePath(typedLocale, article.slug)}>
              {article.title}
            </Link>
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}> {article.publishedAt}</time>
            ) : null}
          </li>
        ))}
      </ul>
      {pageNumber > 1 ? (
        <Link
          href={
            pageNumber - 1 === 1
              ? articlesPath(typedLocale)
              : `${articlesPath(typedLocale)}/page/${pageNumber - 1}`
          }
        >
          Previous
        </Link>
      ) : null}
      {pageNumber < totalPages ? (
        <Link href={`${articlesPath(typedLocale)}/page/${pageNumber + 1}`}>
          Next
        </Link>
      ) : null}
    </main>
  );
}
