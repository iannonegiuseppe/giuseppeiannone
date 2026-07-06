import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CredentialsStrip } from "@/components/CredentialsStrip";
import { Hero, type HeroPhoto } from "@/components/Hero";
import { sanityFetch } from "@/sanity/client";
import type { Locale } from "@/sanity/paths";
import { homePageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";

interface HomePageData {
  title: string;
  hero?: {
    positioningStatement?: string;
    photo?: HeroPhoto;
    videoUrl?: string;
  };
  credentialsStrip?: string[];
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

  const [data, siteSettings] = await Promise.all([
    getHomePage(locale),
    getSiteSettings(locale),
  ]);
  if (!data) notFound();

  return (
    <main>
      <Hero
        locale={locale as Locale}
        authorName={siteSettings?.author?.name ?? ""}
        credentials={siteSettings?.author?.credentials}
        registrationNumber={siteSettings?.author?.registrationNumber}
        positioningStatement={data.hero?.positioningStatement}
        photo={data.hero?.photo}
        videoUrl={data.hero?.videoUrl}
      />
      <CredentialsStrip items={data.credentialsStrip} />
    </main>
  );
}
