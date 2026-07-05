import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Fraunces, Work_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
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

const indexingEnabled = process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true";

// Site-wide fallback + noindex default. Individual pages (e.g. the
// homepage) override title/description via generateMetadata; robots is
// inherited from here unless a page deliberately sets its own.
export const metadata: Metadata = {
  title: "Giuseppe Iannone",
  robots: {
    index: indexingEnabled,
    follow: indexingEnabled,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${workSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
