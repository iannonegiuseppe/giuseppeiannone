import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewPlaceholderPage } from "@/components/PreviewPlaceholderPage";
import { resolveRobots } from "@/sanity/metadata";

// PREVIEW-GATE (temporary) route — English slug for contactPath's EN
// output (/en/contact). See PreviewPlaceholderPage.tsx's own comment.
// Reversal: delete this folder once the real Contact page is built.
export const metadata: Metadata = {
  title: "Contact | Giuseppe Iannone",
  robots: resolveRobots(true),
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewPlaceholderPage locale={locale} />;
}
