import { singletonPathFns, type Locale } from "./paths";

// Root-namespace pass — the ONE source of truth for URL segments that a
// root-level document slug (pillarPage, page) may not claim.
//
// Why this file and not paths.ts: it has two consumers that run in
// different environments — the unified /[slug] resolver (server) and the
// Studio slug validator (browser). Like paths.ts next to it, this module
// is deliberately framework-agnostic (no next/headers, no server-only
// import), so both can import it. Keeping it separate from paths.ts keeps
// the "what is reserved" question answerable in one obvious place rather
// than buried among the path builders.
//
// Two halves, deliberately:
//
//   DERIVED — every fixed singleton route, computed from singletonPathFns
//   (paths.ts already describes that array as the single source its own
//   locale-switcher reverse-lookup iterates). Deriving means a renamed
//   route can't leave a stale entry behind here.
//
//   EXPLICIT — everything with no path function behind it: real route
//   folders, locale codes, prefixes reserved by convention, legacy
//   redirect sources, and framework/well-known paths. These cannot be
//   derived from anything, so they're listed.
//
// MAINTENANCE OBLIGATION: adding a route folder under src/app/[locale]/
// (or a new top-level folder under src/app/) means adding it to
// EXPLICIT_RESERVED_SLUGS below. A fixed singleton route added to
// singletonPathFns is picked up automatically and needs nothing here.

const LOCALES: readonly Locale[] = ["it", "en"];

// "/chi-sono" (it) -> "chi-sono"; "/en/about" (en) -> "about";
// "/" and "/en" (homePath) -> null, they claim no segment.
function rootSegmentOf(path: string, locale: Locale): string | null {
  const localePrefix = locale === "it" ? "" : `/${locale}`;
  const withoutLocale = path.startsWith(localePrefix)
    ? path.slice(localePrefix.length)
    : path;

  return withoutLocale.split("/").filter(Boolean)[0] ?? null;
}

// Both locales of every fixed singleton route: chi-sono/about,
// metodo/method, prezzi/pricing, blog, faq, contatti/contact, privacy,
// cookie-policy.
const DERIVED_RESERVED_SLUGS: string[] = singletonPathFns.flatMap((pathFn) =>
  LOCALES.map((locale) => rootSegmentOf(pathFn(locale), locale)).filter(
    (segment): segment is string => segment !== null,
  ),
);

const EXPLICIT_RESERVED_SLUGS: string[] = [
  // Real route folders with no path function — src/app/[locale]/* and
  // the non-locale-prefixed folders directly under src/app/.
  "api",
  "studio",
  // /design-lab — restored down to a single route (tone-swatch, kept live
  // at the client's own request as an ongoing tonal-scale reference) after
  // the rest of the tree was deleted pre-launch. Still a real root segment.
  "design-lab",
  "styleguide",

  // Locale codes. "en" is a real prefix; "it" is currently unprefixed
  // (localePrefix: "as-needed") and so isn't a live route today — reserved
  // anyway, because a document at /it would be indistinguishable from a
  // locale prefix to any reader, and because the prefixing strategy is a
  // config value that could change.
  "en",
  "it",

  // Prefixes paths.ts already reserves by convention for routes that
  // don't exist yet (locationPath, areaPath). Claiming one as a root slug
  // now would silently pre-empt that route later.
  "sedi",
  "locations",
  "aree",
  "areas",

  // Legacy preview-gate URLs that still redirect (next.config.ts).
  // A document slug here would be shadowed by the redirect.
  "risorse",
  "resources",

  // Framework internals and well-known files served from the root.
  "_next",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  ".well-known",
];

export const RESERVED_ROOT_SLUGS: ReadonlySet<string> = new Set([
  ...DERIVED_RESERVED_SLUGS,
  ...EXPLICIT_RESERVED_SLUGS,
]);

export function isReservedRootSlug(slug: string): boolean {
  return RESERVED_ROOT_SLUGS.has(slug.toLowerCase());
}
