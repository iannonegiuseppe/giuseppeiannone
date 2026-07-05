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
