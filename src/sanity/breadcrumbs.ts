import { getTranslations } from "next-intl/server";

export interface BreadcrumbItem {
  name: string;
  /** Absolute pathname, e.g. "/", "/en", "/disturbi-d-ansia". */
  path: string;
}

type Locale = "it" | "en";

// Shared by BreadcrumbList JSON-LD (Stage 2 Step 4) and the visible
// breadcrumb nav (Stage 2 Step 6) — same data source, so the two can
// never drift out of sync with each other.
async function getHomeCrumb(locale: Locale): Promise<BreadcrumbItem> {
  const t = await getTranslations({ locale, namespace: "Breadcrumbs" });
  return { name: t("home"), path: locale === "it" ? "/" : "/en" };
}

export async function getPillarTrail(
  locale: Locale,
  pillarTitle: string,
  pillarPath: string,
): Promise<BreadcrumbItem[]> {
  const home = await getHomeCrumb(locale);
  return [home, { name: pillarTitle, path: pillarPath }];
}

export async function getSubtopicTrail(
  locale: Locale,
  pillarTitle: string,
  pillarPath: string,
  subtopicTitle: string,
  subtopicPath: string,
): Promise<BreadcrumbItem[]> {
  const pillarTrail = await getPillarTrail(locale, pillarTitle, pillarPath);
  return [...pillarTrail, { name: subtopicTitle, path: subtopicPath }];
}

// Blog article pass — Home > Blog > {article title}, same shape as
// getPillarTrail (a fixed middle crumb instead of a dynamic one, since
// there's no separate "articlesPath" document, just the fixed /blog route).
export async function getArticleTrail(
  locale: Locale,
  articlesLabel: string,
  articlesPath: string,
  articleTitle: string,
  articlePath: string,
): Promise<BreadcrumbItem[]> {
  const home = await getHomeCrumb(locale);
  return [
    home,
    { name: articlesLabel, path: articlesPath },
    { name: articleTitle, path: articlePath },
  ];
}
