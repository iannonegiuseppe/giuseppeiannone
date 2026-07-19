import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewPlaceholderPage } from "@/components/PreviewPlaceholderPage";
import { resolveRobots } from "@/sanity/metadata";

// PREVIEW-GATE (temporary) route — same slug "faq" for both locales
// (faqPath), so this one folder serves /faq (it) and /en/faq (en). See
// PreviewPlaceholderPage.tsx's own comment. Reversal: delete this folder
// once the real FAQ page is built.
export const metadata: Metadata = {
  title: "FAQ | Giuseppe Iannone",
  robots: resolveRobots(true),
};

export default async function FaqPlaceholderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewPlaceholderPage locale={locale} />;
}
