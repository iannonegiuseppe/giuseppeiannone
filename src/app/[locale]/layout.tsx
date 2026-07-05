import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Fraunces, Work_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { client } from "@/sanity/client";
import {
  buildMedicalBusinessJsonLd,
  buildPersonJsonLd,
} from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl, resolveRobots } from "@/sanity/metadata";
import { locationsQuery } from "@/sanity/queries";
import { getSiteSettings } from "@/sanity/seo";
import "./globals.scss";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
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
  return client.fetch<{ title: string; address?: string }[]>(
    locationsQuery,
    { locale },
    { next: { tags: ["locationPage"] } },
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

  const [siteSettings, locations] = await Promise.all([
    getSiteSettings(locale),
    getLocations(locale),
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

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${workSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {personJsonLd ? <JsonLdScript data={personJsonLd} /> : null}
        {medicalBusinessJsonLd ? (
          <JsonLdScript data={medicalBusinessJsonLd} />
        ) : null}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
