import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { VisualEditing } from "next-sanity/visual-editing";
import { EB_Garamond, Source_Sans_3 } from "next/font/google";
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
import { getSiteSettings } from "@/sanity/seo";
import "./globals.scss";

// Global restyle pass: EB Garamond replaces Marcellus entirely (not kept
// alongside it for any heading tier). Regular (400) is still the only
// weight requested, matching this codebase's "only load what's used"
// discipline — no component sets a heavier display weight. Unlike
// Marcellus, EB Garamond has a real italic cut, loaded here too even
// though nothing currently sets font-style italic on --font-display —
// cheap to have available now that it's real, rather than the browser's
// faux-slanted fallback if a future block needs it.
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

// Global restyle pass: Source Sans 3 replaces Lato. Config mirrors the two
// scoped loaders already proven in this repo (design-preview, styleguide)
// rather than Lato's older/narrower one: latin-ext added (better Italian
// diacritic coverage) and display: "swap" added (both strictly better,
// not just a literal swap). 700 is kept for inline emphasis within body
// copy only, matching the same convention as before; italic is loaded for
// the restricted Portable Text `em` mark, as before.
//
// Header/hero restyle pass: 500 added — the header nav wants a real
// medium weight (calmer than 700, more substantial than 400). Without a
// real 500 face, font-weight:500 silently falls back to rendering as
// plain 400 (the CSS spec's own 400/500 fallback pairing) rather than
// faux-bolding, so it would have been a no-op otherwise.
const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
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
  //
  // Partner-centre names pass: was `centerName ? "City — CenterName" :
  // City` — with centerName cleared everywhere, every entry collapsed to
  // bare city, and Milano has TWO physical addresses, so both would have
  // produced the exact same non-unique Place.name. Switched to "City —
  // Address" instead of bare city for that reason (each entry is unique;
  // `Place.address` below already carries the plain street address on
  // its own, so this isn't introducing any new/invented data, just
  // reusing it for the name too).
  const physicalLocations = sedes
    .filter((sede) => !sede.isOnline)
    .flatMap((sede) =>
      (sede.addresses ?? []).map((addr) => ({
        title: `${sede.city} — ${addr.address}`,
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

  return (
    <html
      lang={locale}
      className={`${ebGaramond.variable} ${sourceSans3.variable}`}
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
              contactChannels={siteSettings?.contactChannels}
            />
            {children}
            <Footer
              locale={typedLocale}
              authorName={siteSettings?.author?.name ?? ""}
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
