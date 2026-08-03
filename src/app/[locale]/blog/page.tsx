import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { getArticlesPage } from "@/sanity/articles";
import { articlePath, articlesPath } from "@/sanity/paths";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as "it" | "en";
  const siteSettings = await getSiteSettings(locale);

  return await buildMetadata({
    locale: typedLocale,
    title: "Blog",
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
  const typedLocale = locale as "it" | "en";

  const { articles, totalPages } = await getArticlesPage(locale, 1);

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
      {totalPages > 1 ? (
        <Link href={`${articlesPath(typedLocale)}/page/2`}>Next</Link>
      ) : null}
    </main>
  );
}
