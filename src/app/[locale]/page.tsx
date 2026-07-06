import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { sanityFetch } from "@/sanity/client";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { homePageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface HomePageData {
  title: string;
  body: unknown;
  seo?: SeoFields;
}

function getHomePage(locale: string) {
  return sanityFetch<HomePageData | null>(
    homePageQuery,
    { locale },
    ["homePage"],
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [data, siteSettings] = await Promise.all([
    getHomePage(locale),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: locale as "it" | "en",
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: { it: "/", en: "/en" },
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getHomePage(locale);
  if (!data) notFound();

  const components = await getPortableTextComponents(locale);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{data.title}</h1>
      <div className={styles.body}>
        <PortableText value={data.body as never} components={components} />
      </div>
    </main>
  );
}
