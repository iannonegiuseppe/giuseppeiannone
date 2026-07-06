import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContentCardGrid } from "@/components/ContentCardGrid";
import { CredentialsStrip } from "@/components/CredentialsStrip";
import { Hero, type HeroPhoto } from "@/components/Hero";
import { MethodsSection } from "@/components/MethodsSection";
import { WhoIAm } from "@/components/WhoIAm";
import { sanityFetch } from "@/sanity/client";
import { hrefFor, type Locale, type ReferencedDoc } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import {
  homePageQuery,
  latestContentQuery,
  pillarsGridQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface MethodItem {
  title: string;
  description: string;
}

interface HomePageData {
  title: string;
  hero?: {
    positioningStatement?: string;
    photo?: HeroPhoto;
    videoUrl?: string;
  };
  credentialsStrip?: string[];
  methods?: MethodItem[];
  body?: unknown;
  seo?: SeoFields;
}

interface PillarGridItem {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
}

function getHomePage(locale: string) {
  return sanityFetch<HomePageData | null>(
    homePageQuery,
    { locale },
    ["homePage"],
  );
}

function getConcernsGrid(locale: string) {
  return sanityFetch<PillarGridItem[]>(
    pillarsGridQuery,
    { locale },
    ["pillarPage"],
  );
}

function getLatestContent(locale: string) {
  return sanityFetch<ReferencedDoc[]>(
    latestContentQuery,
    { locale },
    ["pillarPage", "subtopicPage"],
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
  const typedLocale = locale as Locale;

  const [data, siteSettings, concerns, latestContent, t, portableTextComponents] =
    await Promise.all([
      getHomePage(locale),
      getSiteSettings(locale),
      getConcernsGrid(locale),
      getLatestContent(locale),
      getTranslations({ locale: typedLocale, namespace: "Home" }),
      getPortableTextComponents(locale),
    ]);
  if (!data) notFound();

  const concernsItems = concerns
    .filter((item): item is PillarGridItem & { slug: string } => !!item.slug)
    .map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      href: hrefFor(typedLocale, { ...item, _type: "pillarPage", slug: item.slug }),
    }));

  const latestItems = latestContent.map((item) => ({
    id: item._id,
    title: item.title ?? "",
    description: (item as ReferencedDoc & { description?: string }).description,
    href: hrefFor(typedLocale, item),
  }));

  return (
    <main>
      <Hero
        locale={typedLocale}
        authorName={siteSettings?.author?.name ?? ""}
        credentials={siteSettings?.author?.credentials}
        registrationNumber={siteSettings?.author?.registrationNumber}
        positioningStatement={data.hero?.positioningStatement}
        photo={data.hero?.photo}
        videoUrl={data.hero?.videoUrl}
      />
      <WhoIAm heading={t("whoIAmHeading")} bio={siteSettings?.author?.bio} />
      <ContentCardGrid
        heading={t("concernsGridHeading")}
        items={concernsItems}
      />
      {data.body ? (
        <div className={styles.bodySection}>
          <PortableText
            value={data.body as never}
            components={portableTextComponents}
          />
        </div>
      ) : null}
      <CredentialsStrip items={data.credentialsStrip} />
      <MethodsSection heading={t("methodsHeading")} items={data.methods} />
      <ContentCardGrid
        heading={t("latestContentHeading")}
        items={latestItems}
      />
    </main>
  );
}
