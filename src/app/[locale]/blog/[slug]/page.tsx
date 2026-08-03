import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { getArticleBySlug, getArticleSlugs } from "@/sanity/articles";
import { urlFor } from "@/sanity/image";
import { articlePath } from "@/sanity/paths";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./article.module.scss";
import { getArticlePortableTextComponents } from "./articlePortableText";

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  cover?: (SanityImage & { alt?: string }) | undefined;
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

  const components = getArticlePortableTextComponents();

  return (
    <main className={styles.page}>
      {data.cover ? (
        <div className={styles.coverBand}>
          <Image
            src={urlFor(data.cover).width(2400).height(1029).url()}
            alt={data.cover.alt ?? ""}
            fill
            sizes="100vw"
            className={styles.coverImage}
            priority
          />
        </div>
      ) : null}
      <div className={styles.column}>
        <header className={styles.header}>
          <p className={styles.kickerRow}>
            <span className={styles.kickerRule} aria-hidden="true" />
            <span className={styles.kicker}>Blog</span>
          </p>
          {/* Plain, no italic-accent span: the article schema has no
              emphasis-word field (unlike homePage.hero's own
              headlineEmphasisWord) — confirmed by reading the schema
              directly, not guessed. See article.module.scss's own
              .titleEmphasis for the ready-to-use styling if a field is
              added later. */}
          <h1 className={styles.title}>{data.title}</h1>
        </header>
        <div className={styles.body}>
          <PortableText value={data.body as never} components={components} />
        </div>
      </div>
    </main>
  );
}
