import { SINGLETON_ROUTES } from "./paths";

export interface StaticRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

// Every fixed singleton page lives in TWO literal route folders under
// src/app/[locale]/ — one per translated slug (metodo/ + method/,
// chi-sono/ + about-me/, ...), the second re-exporting the first
// wholesale. See any EN-slug page.tsx's own comment for why that shape
// was chosen over a slug->type dispatcher.
//
// What that shape does NOT do on its own is bind a folder to a locale.
// `[locale]` is a dynamic segment matching both "it" and "en", and
// next-intl's `localePrefix: "as-needed"` rewrites an unprefixed request
// to the default locale before routing — so BOTH folders match BOTH
// locales, and every one of these pages answered 200 at four URLs
// instead of two:
//
//   /metodo      (it, correct)      /en/method   (en, correct)
//   /method      (it content!)      /en/metodo   (en content!)
//
// Confirmed live against production, all 16 wrong URLs returning 200 —
// Search Console had picked up the whole set as "Crawled - currently not
// indexed". The pages' own canonical tags were already self-correcting
// (/en/metodo canonicalised to /en/method), which is why this never
// became a ranking incident, but a crawler still had to fetch, render
// and discard 16 duplicate pages.
//
// The rule this encodes: THE SLUG DECIDES THE LOCALE. An English slug
// always resolves to the English page, an Italian slug to the Italian
// one, whatever prefix it arrived under. 301, not 404, deliberately:
// these URLs were crawled and are known to Google, so consolidating them
// onto the real page retires them from the index faster than a 404
// (which Google re-checks for months) and costs a visitor who guessed
// the wrong prefix nothing.
//
// Derived from SINGLETON_ROUTES rather than hand-listed, same reasoning
// as sitemap.ts and reservedSlugs.ts: a singleton added there is
// protected automatically, with no second list to remember. Routes whose
// slug is NOT translated (blog, faq, privacy, cookie-policy — the EN path
// is just "/en" + the IT path) produce no pair and are skipped: /en/faq
// is the real English URL, not a duplicate. The homepage is skipped for
// the same reason — it claims no root segment at all.
//
// Safe against shadowing a real document: every source segment here is
// already in RESERVED_ROOT_SLUGS (reservedSlugs.ts derives BOTH locales'
// segments from these same path functions), so no pillarPage or page can
// ever hold one.
export function getLocaleSlugRedirects(): StaticRedirect[] {
  const redirects: StaticRedirect[] = [];

  for (const { pathFn } of SINGLETON_ROUTES) {
    const itPath = pathFn("it");
    const enPath = pathFn("en");

    // Homepage: "/" and "/en" claim no root segment of their own.
    if (itPath === "/" || enPath === "/en") continue;

    // "/en/method" -> "/method": the English slug as it would arrive
    // WITHOUT the prefix, i.e. the wrong-locale URL to be redirected.
    if (!enPath.startsWith("/en/")) continue;
    const enPathUnprefixed = enPath.slice("/en".length);

    // Untranslated slug (blog, faq, privacy, cookie-policy) — the two
    // locales differ only by the prefix, so there is no wrong pairing to
    // redirect, and emitting one would send /faq to /en/faq.
    if (enPathUnprefixed === itPath) continue;

    // English slug reached without the /en prefix -> the English page.
    redirects.push({
      source: enPathUnprefixed,
      destination: enPath,
      permanent: true,
    });

    // Italian slug reached under the /en prefix -> the Italian page.
    redirects.push({
      source: "/en" + itPath,
      destination: itPath,
      permanent: true,
    });
  }

  return redirects;
}
