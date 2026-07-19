import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewPlaceholderPage } from "@/components/PreviewPlaceholderPage";
import { resolveRobots } from "@/sanity/metadata";

// PREVIEW-GATE (temporary) route — see PreviewPlaceholderPage.tsx's own
// comment. Reversal: delete this folder once the real Prezzi page is built.
export const metadata: Metadata = {
  title: "Prezzi | Giuseppe Iannone",
  robots: resolveRobots(true),
};

export default async function PrezziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewPlaceholderPage locale={locale} />;
}
