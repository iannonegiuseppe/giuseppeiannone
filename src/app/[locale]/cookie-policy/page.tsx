import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { LegalPageShell } from "@/components/LegalPageShell";
import { sanityFetch } from "@/sanity/client";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { extractHeadings, headingIdsByKey } from "@/sanity/headings";
import { buildBreadcrumbListJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import { cookiePolicyPath, type Locale } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { cookiePolicyPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale.
export const revalidate = 1800;

interface CookiePolicyPageData {
  title?: string;
  lastUpdated?: string;
  body?: unknown;
  seo?: SeoFields;
}

function getCookiePolicyPage(locale: string) {
  return sanityFetch<CookiePolicyPageData | null>(cookiePolicyPageQuery, { locale }, [
    "cookiePolicyPage",
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [data, siteSettings] = await Promise.all([
    getCookiePolicyPage(locale),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: cookiePolicyPath("it"),
      en: cookiePolicyPath("en"),
    },
  });
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const data = await getCookiePolicyPage(locale);
  const t = await getTranslations({ locale, namespace: "LegalPage" });

  const path = cookiePolicyPath(typedLocale);
  const siteUrl = getSiteUrl();

  const trail = await getPillarTrail(typedLocale, data?.title ?? "", path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const headings = extractHeadings(data?.body);
  const headingIds = headingIdsByKey(headings);
  const components = await getPortableTextComponents(locale, headingIds);

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      <LegalPageShell
        trail={trail}
        title={data?.title ?? ""}
        lastUpdatedLabel={t("lastUpdated")}
        lastUpdatedDate={data?.lastUpdated}
        lastUpdatedPlaceholder={t("lastUpdatedPlaceholder")}
        locale={locale}
        headings={headings}
        body={data?.body}
        components={components}
      />
    </>
  );
}
