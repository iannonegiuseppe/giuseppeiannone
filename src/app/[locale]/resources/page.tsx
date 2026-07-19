import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewPlaceholderPage } from "@/components/PreviewPlaceholderPage";
import { resolveRobots } from "@/sanity/metadata";

// PREVIEW-GATE (temporary) route — English slug for articlesPath's EN
// output (/en/resources). See PreviewPlaceholderPage.tsx's own comment.
// Reversal: delete this folder once the real Resources index page is built.
export const metadata: Metadata = {
  title: "Resources | Giuseppe Iannone",
  robots: resolveRobots(true),
};

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewPlaceholderPage locale={locale} />;
}
