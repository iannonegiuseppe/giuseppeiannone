import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { VisualEditing } from "next-sanity/visual-editing";
import { EB_Garamond, Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AnalyticsLoader } from "@/components/AnalyticsLoader";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { FooterLab } from "@/components/FooterLab";
import { Header } from "@/components/Header";
import { LenisProvider } from "@/components/LenisProvider";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
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
import sectionWrapperStyles from "@/components/sectionWrappers.module.scss";
import "./globals.scss";

// Stage 2b-2 — migrate the remaining homepage sections: FooterLab replaces
// the real Footer here (design-lab-to-production migration), same
// mechanism used for every other section in this pass. UNLIKE every other
// swap in this pass, this one is NOT homepage-scoped — Footer renders once
// here, at the layout level, shared by every page on the site (FAQ,
// articles, styleguide, etc.), so this is a site-wide visual change, not a
// homepage-only one (confirmed with the client before making this edit).
// Footer.tsx/.module.scss themselves are untouched, just no longer
// imported. toneMidWrap: the same tone-mid mechanism Aree/Tariffe/Spazi/
// Risorse already use, shared via sectionWrappers.module.scss.

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
//
// Aree panel hierarchy pass: 300 added — the Aree panel's subtopics now
// read as children of their group heading via a lighter weight instead of
// an indent (owner's own instruction: same left edge for every item,
// weight carries the hierarchy). Same reasoning as 500 above, mirrored
// for the other direction: font-weight 300 with no real 300 face loaded
// doesn't fake a thin look, the CSS spec just falls back to the nearest
// loaded weight (400 here) — a silent no-op, not a visible bug, but not
// the lighter weight either. Checked before writing any component CSS,
// not assumed: 300 was NOT in this list previously.
const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
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
  // Real contact/legal data pass: phone/email for JSON-LD come from the
  // same siteSettings.contactChannels array every wa.me/tel/mailto link
  // elsewhere in the app already derives from — not re-typed here. Raw
  // digits form (channel.value), not the spaced display label.
  const phoneChannel = siteSettings?.contactChannels?.find((c) => c.type === "phone");
  const emailChannel = siteSettings?.contactChannels?.find((c) => c.type === "email");
  const personJsonLd = siteSettings?.author?.name
    ? buildPersonJsonLd({
        author: siteSettings.author,
        siteUrl,
        socialLinks: siteSettings.socialLinks,
        telephone: phoneChannel?.value,
        email: emailChannel?.value,
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
          telephone: phoneChannel?.value,
          email: emailChannel?.value,
          vatID: siteSettings.piva,
          // Contatti build pass — page-level hours (Mo-Fr 08:00-21:00),
          // matching contactPage.hours' own human-readable copy. Not
          // per-location: see this function's own comment on why.
          openingHours: {
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "21:00",
          },
        })
      : undefined;

  const typedLocale = locale as Locale;

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${ebGaramond.variable} ${sourceSans3.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {/* Stage 2c dark-canvas fix, corrected — data-theme="dark" is now a
            plain static SSR'd attribute on <html> above, not a blocking
            inline script. The script version worked for the very first
            page load (synchronous scripts run during HTML parsing, before
            paint) but broke on every LOCALE SWITCH after that: [locale] is
            a dynamic segment, so switching locale remounts this layout's
            subtree, and React re-creates the script element via
            `.innerHTML` assignment rather than the browser's HTML parser —
            script content set that way never executes. Confirmed live
            (this pass's own report): data-theme stayed null and the page
            stayed light-themed indefinitely after a locale switch, no
            self-correction. Since this attribute was never actually
            conditional in production ("no light variant to branch on
            anymore" — the comment this replaces said as much), there was
            no reason for it to be script-driven at all; a static attribute
            is simpler AND correct on every navigation type, because it's
            just normal SSR'd markup, not something that has to "happen"
            client-side at all. Unlike design-lab's own dark/light toggle
            (DesignLabHomepage.tsx), which stays script-based since it's
            genuinely conditional there. */}
        {personJsonLd ? <JsonLdScript data={personJsonLd} /> : null}
        {medicalBusinessJsonLd ? (
          <JsonLdScript data={medicalBusinessJsonLd} />
        ) : null}
        <NextIntlClientProvider>
          {/* Cookie consent pass — rendered here, OUTSIDE every page's own
              light-island sections and outside FooterLab's tone-mid wrap,
              so it always reads the plain ambient dark theme tokens (see
              CookieConsentBanner.module.scss's own comment). First child
              on purpose: keyboard users reach it before Header's own nav,
              matching "reachable by keyboard from the top of the page." */}
          <CookieConsentBanner locale={typedLocale} />
          {/* Gated analytics pass — renders nothing; wires GA4/Clarity to
              the same consent gate the banner above writes to. See
              AnalyticsLoader.tsx's own comment. Sibling of the banner, not
              inside it — this needs to run (and start listening for
              consent changes) on every route, not just while the banner
              itself is mounted/visible. */}
          <AnalyticsLoader />
          <PageTransitionLoader />
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
            <div className={sectionWrapperStyles.toneMidWrap}>
              <FooterLab
                locale={typedLocale}
                authorName={siteSettings?.author?.name ?? ""}
                authorCredentials={siteSettings?.author?.credentials}
                authorRegistrationNumber={siteSettings?.author?.registrationNumber}
                contactChannels={siteSettings?.contactChannels}
                piva={siteSettings?.piva}
                sedes={sedes}
                crisisSupportText={siteSettings?.crisisSupportText}
                emergencyContacts={siteSettings?.emergencyContacts}
                googleProfileUrl={siteSettings?.googleProfileUrl}
                socialLinks={siteSettings?.socialLinks}
              />
            </div>
            {/* Cookie consent pass — a REAL flex child (sibling of Header/
                {children}/FooterLab in this same flex-column body), not
                padding on body itself: body has an explicit height:100%
                (globals.scss's own reset) and its content already
                overflows that height on every real page, so padding on
                body's own box never had room to manifest as extra
                scrollable space — confirmed live, document.documentElement
                .scrollHeight was IDENTICAL with and without it. A plain
                block contributing real height to the flex column's own
                content extent is what actually moves the true end of the
                document. Grows/shrinks with the same --consent-banner-
                offset custom property CookieConsentBanner.tsx sets via
                ResizeObserver — 0px (the var()'s own fallback) the instant
                a choice exists or the banner isn't mounted. flexShrink: 0
                is load-bearing, not defensive: body's flex column already
                overflows its own fixed height on every real page, and an
                empty flex item has no content-driven minimum size to
                resist the resulting shrink — confirmed live, without this
                the div's declared height collapsed to 0 regardless of the
                custom property's value. */}
            <div
              aria-hidden="true"
              style={{ height: "var(--consent-banner-offset, 0px)", flexShrink: 0 }}
            />
          </LenisProvider>
        </NextIntlClientProvider>
        {isDraft ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
