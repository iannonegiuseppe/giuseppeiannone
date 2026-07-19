import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewPlaceholderPage } from "@/components/PreviewPlaceholderPage";
import { resolveRobots } from "@/sanity/metadata";

// PREVIEW-GATE (temporary) route — English slug for pricePath's EN
// output (/en/pricing). See PreviewPlaceholderPage.tsx's own comment.
// Reversal: delete this folder once the real Pricing page is built.
export const metadata: Metadata = {
  title: "Pricing | Giuseppe Iannone",
  robots: resolveRobots(true),
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewPlaceholderPage locale={locale} />;
}
