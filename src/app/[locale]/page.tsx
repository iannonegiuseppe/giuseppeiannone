import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { client } from "@/sanity/client";
import { resolveRobots } from "@/sanity/metadata";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { homePageQuery } from "@/sanity/queries";
import styles from "./page.module.scss";

interface HomePageData {
  title: string;
  body: unknown;
  seo?: { metaTitle?: string; metaDescription?: string; noIndex?: boolean };
}

function getHomePage(locale: string) {
  return client.fetch<HomePageData | null>(
    homePageQuery,
    { locale },
    { next: { tags: ["homePage"] } },
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const data = await getHomePage(locale);

  return {
    title: data?.seo?.metaTitle ?? data?.title,
    description: data?.seo?.metaDescription,
    robots: resolveRobots(data?.seo?.noIndex),
  };
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

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{data.title}</h1>
      <div className={styles.body}>
        <PortableText
          value={data.body as never}
          components={getPortableTextComponents(locale)}
        />
      </div>
    </main>
  );
}
