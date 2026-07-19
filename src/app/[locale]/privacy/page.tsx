import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewPlaceholderPage } from "@/components/PreviewPlaceholderPage";
import { resolveRobots } from "@/sanity/metadata";

// PREVIEW-GATE (temporary) route — same slug "privacy" for both locales
// (privacyPath), so this one folder serves /privacy (it) and /en/privacy
// (en). See PreviewPlaceholderPage.tsx's own comment. Reversal: delete
// this folder once the real Privacy page is built.
export const metadata: Metadata = {
  title: "Privacy | Giuseppe Iannone",
  robots: resolveRobots(true),
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewPlaceholderPage locale={locale} />;
}
