import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { VisualEditing } from "next-sanity/visual-editing";
import { Lato, Marcellus } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import { isDraftModeEnabled, sanityFetch } from "@/sanity/client";
import {
  buildMedicalBusinessJsonLd,
  buildPersonJsonLd,
} from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl, resolveRobots } from "@/sanity/metadata";
import type { Locale } from "@/sanity/paths";
import { locationsQuery } from "@/sanity/queries";
import { getSiteSettings } from "@/sanity/seo";
import "./globals.scss";

// Marcellus ships Regular (400) only — there is no bold cut, so no other
// weight is requested here. Never apply a heavier font-weight to it in CSS.
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: ["400"],
});

// Lato's real (non-synthesized) weights are 100/300/400/700/900 — no 500 or
// 600. 700 is kept for inline emphasis within body copy only; heading
// hierarchy uses 400 at different sizes, not weight. Italic is loaded
// too — the restricted Portable Text schema allows an `em` mark, and
// without it that would fall back to the browser's own faux-slanted
// rendering instead of Lato's real italic cut.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// Site-wide fallback + noindex default. Individual pages (e.g. the
// homepage) override title/description via generateMetadata; robots is
// inherited from here unless a page deliberately sets its own.
export const metadata: Metadata = {
  title: "Giuseppe Iannone",
  robots: resolveRobots(),
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function getLocations(locale: string) {
  return sanityFetch<{ title: string; address?: string }[]>(
    locationsQuery,
    { locale },
    ["locationPage"],
  );
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [siteSettings, locations, isDraft] = await Promise.all([
    getSiteSettings(locale),
    getLocations(locale),
    isDraftModeEnabled(),
  ]);

  const siteUrl = getSiteUrl();
  const personJsonLd = siteSettings?.author?.name
    ? buildPersonJsonLd({
        author: siteSettings.author,
        siteUrl,
        socialLinks: siteSettings.socialLinks,
      })
    : undefined;
  const medicalBusinessJsonLd =
    siteSettings?.title && locations.length > 0
      ? buildMedicalBusinessJsonLd({
          name: siteSettings.title,
          siteUrl,
          locations,
        })
      : undefined;

  const typedLocale = locale as Locale;

  return (
    <html
      lang={locale}
      className={`${marcellus.variable} ${lato.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {personJsonLd ? <JsonLdScript data={personJsonLd} /> : null}
        {medicalBusinessJsonLd ? (
          <JsonLdScript data={medicalBusinessJsonLd} />
        ) : null}
        <NextIntlClientProvider>
          <Header
            locale={typedLocale}
            authorName={siteSettings?.author?.name ?? ""}
          />
          {children}
          <Footer
            locale={typedLocale}
            contactEmail={siteSettings?.contactEmail}
            contactPhone={siteSettings?.contactPhone}
            whatsappNumber={siteSettings?.whatsappNumber}
            locations={locations}
            crisisSupportText={siteSettings?.crisisSupportText}
            googleProfileUrl={siteSettings?.googleProfileUrl}
            socialLinks={siteSettings?.socialLinks}
          />
        </NextIntlClientProvider>
        {isDraft ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
