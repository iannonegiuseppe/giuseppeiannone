import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewPlaceholderPage } from "@/components/PreviewPlaceholderPage";
import { resolveRobots } from "@/sanity/metadata";

// PREVIEW-GATE (temporary) route — same slug "cookie-policy" for both
// locales (cookiePolicyPath), so this one folder serves /cookie-policy
// (it) and /en/cookie-policy (en). See PreviewPlaceholderPage.tsx's own
// comment. Reversal: delete this folder once the real Cookie policy page
// is built.
export const metadata: Metadata = {
  title: "Cookie policy | Giuseppe Iannone",
  robots: resolveRobots(true),
};

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewPlaceholderPage locale={locale} />;
}
