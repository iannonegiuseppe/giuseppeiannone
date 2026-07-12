import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { VisualEditing } from "next-sanity/visual-editing";
import { Lato, Marcellus } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LenisProvider } from "@/components/LenisProvider";
import { routing } from "@/i18n/routing";
import { isDraftModeEnabled, sanityFetch } from "@/sanity/client";
import {
  buildMedicalBusinessJsonLd,
  buildPersonJsonLd,
} from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl, resolveRobots } from "@/sanity/metadata";
import type { Locale } from "@/sanity/paths";
import { sedesQuery } from "@/sanity/queries";
import {
  getSiteSettings,
  resolveAvailabilityText,
  resolveLogoImage,
} from "@/sanity/seo";
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

interface SedeAddress {
  centerName?: string;
  address: string;
  lat: number;
  lng: number;
}

interface SedeDoc {
  _id: string;
  city: string;
  isOnline?: boolean;
  onlineLine?: string;
  addresses?: SedeAddress[];
}

// CMS-driven header/footer pass: was locationsQuery (locationPage-backed,
// query since retired — see queries.ts's own comment). Footer's "Sedi"
// column now reads the SAME sede docs the homepage's own Sedi section
// already uses (per spec's explicit "addresses come from sede docs"),
// fixing a pre-existing bug an earlier audit pass flagged (locationPage
// had no published documents, so the footer column rendered empty).
function getSedes(locale: string) {
  return sanityFetch<SedeDoc[]>(sedesQuery, { locale }, ["sede"]);
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

  const [siteSettings, sedes, isDraft] = await Promise.all([
    getSiteSettings(locale),
    getSedes(locale),
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
  // buildMedicalBusinessJsonLd's own shape (LocationFields: flat
  // {title, address}[]) predates sede's richer city+addresses[] shape and
  // is left untouched (out of scope) — flattened here instead, one entry
  // per physical address (online-only sedi have no address, excluded;
  // "MedicalBusiness location" means a physical place).
  const physicalLocations = sedes
    .filter((sede) => !sede.isOnline)
    .flatMap((sede) =>
      (sede.addresses ?? []).map((addr) => ({
        title: addr.centerName ? `${sede.city} — ${addr.centerName}` : sede.city,
        address: addr.address,
      })),
    );
  const medicalBusinessJsonLd =
    siteSettings?.title && physicalLocations.length > 0
      ? buildMedicalBusinessJsonLd({
          name: siteSettings.title,
          siteUrl,
          locations: physicalLocations,
        })
      : undefined;

  const typedLocale = locale as Locale;
  const availability = resolveAvailabilityText(siteSettings);
  const resolvedLogo = resolveLogoImage(siteSettings?.logo);

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
          {/* Promoted from design-lab's own page-scoped LenisProvider —
              Header's dialogs (channel picker, mobile menu) now need the
              same Lenis instance Header itself renders under, and Header
              is a layout-level sibling of {children}, not a descendant
              of any per-page provider. Hoisting here makes smooth
              scrolling site-wide rather than homepage-only, a direct,
              unavoidable consequence of promoting Header — flagged in
              the promotion pass's own report, not a silent scope
              expansion. */}
          <LenisProvider>
            <Header
              locale={typedLocale}
              authorName={siteSettings?.author?.name ?? ""}
              logo={resolvedLogo}
              contactChannels={siteSettings?.contactChannels}
              availabilityStatus={availability?.status}
              availabilityText={availability?.text}
            />
            {children}
            <Footer
              locale={typedLocale}
              authorName={siteSettings?.author?.name ?? ""}
              logo={resolvedLogo}
              authorCredentials={siteSettings?.author?.credentials}
              authorRegistrationNumber={siteSettings?.author?.registrationNumber}
              contactChannels={siteSettings?.contactChannels}
              piva={siteSettings?.piva}
              sedes={sedes}
              crisisSupportText={siteSettings?.crisisSupportText}
              googleProfileUrl={siteSettings?.googleProfileUrl}
              socialLinks={siteSettings?.socialLinks}
            />
          </LenisProvider>
        </NextIntlClientProvider>
        {isDraft ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
