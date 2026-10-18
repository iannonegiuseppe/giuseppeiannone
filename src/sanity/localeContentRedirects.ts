import { getBuildTimeClient } from "./buildTimeClient";
import type { StaticRedirect } from "./localeSlugRedirects";
import { pagePath, pillarPath, subtopicPath, type Locale } from "./paths";
import { RESERVED_ROOT_SLUGS } from "./reservedSlugs";

// The Sanity-driven half of "THE SLUG DECIDES THE LOCALE".
//
// localeSlugRedirects.ts next door encodes that rule for the FIXED
// singleton pages, deriving its pairs from SINGLETON_ROUTES. That covers
// 8 routes whose URLs are decided in code. It cannot cover pillarPage,
// subtopicPage or page: their slugs live in Sanity, so no constant in
// this repo knows them.
//
// Those routes have exactly the same exposure, and it is live. The
// 18 Oct 2026 Coverage export lists 50 of them as "Not found (404)",
// still being crawled on 12-13 Oct:
//
//   /anxiety-disorders              (EN pillar slug, no /en prefix)
//   /trauma/grief-and-loss          (EN subtopic, no /en prefix)
//   /en/disturbi-d-ansia            (IT pillar slug, under /en)
//   /en/trauma/lutto-e-perdita      (IT subtopic, under /en)
//
// Unlike the singleton case these 404 rather than serving the wrong
// locale's content (the queries behind /[slug] filter on language, so a
// slug from the other language resolves to nothing). A 404 is honest but
// slow: Google re-checks it for months. A 301 onto the real page retires
// the URL from the index in weeks and costs a visitor who guessed the
// wrong prefix nothing — the same call localeSlugRedirects.ts made, for
// the same reason.
//
// WHY NO translation.metadata LOOKUP. The obvious shape — pair each IT
// document with its EN sibling, emit a redirect per pair — is both more
// work and more fragile: it needs a translation.metadata document to
// exist, and a page with no counterpart yet (17 of 21 subtopics have
// none, per LocaleSwitcher's own comment) would silently get no
// protection. It is not needed. A redirect source is just this
// document's OWN slug under the OTHER locale's prefix, which every
// document can produce by itself. Pairing adds a dependency and buys
// nothing.
//
// THE ONE COLLISION THAT MATTERS, and why realPaths exists. Some slugs
// are identical in both languages — "trauma" is a real pillar slug in IT
// and in EN. Emitting the rule blindly would produce:
//
//   /trauma     -> /en/trauma     (from the EN pillar)
//   /en/trauma  -> /trauma        (from the IT pillar)
//
// i.e. a redirect loop placed on top of two perfectly good pages, both
// of which would become permanently unreachable, because redirects run
// BEFORE routing. So a candidate source is dropped whenever it is itself
// a real document path. Subtopics make this a FULL-PATH test, not a
// root-segment one: "/trauma" is claimed, but "/trauma/grief-and-loss"
// is not, and that subtopic redirect is one we do want.
//
// This also means the list self-heals: publish an Italian page whose
// slug matches an English one and the conflicting redirect disappears on
// the next build, rather than silently shadowing the new page forever.
// The usual build-time caveat applies — it heals on deploy, not on
// publish.
//
// RESERVED_ROOT_SLUGS is checked on top of that, as defence in depth: it
// is what stops this generator from emitting a source that one of the
// OTHER redirect lists already owns (every singleton segment is in that
// set, so a /method or /en/metodo produced here would be dropped rather
// than silently duplicating localeSlugRedirects.ts's own entry). A
// document can't legally hold a reserved slug anyway — rootSlugValidator
// enforces it in Studio — so a hit here means something upstream broke,
// which is why it warns rather than passing quietly.

export interface LocalizedDoc {
  _type: string;
  language: string | null;
  slug: string | null;
  parentSlug?: string | null;
}

interface ResolvedDoc {
  _type: string;
  language: Locale;
  slug: string;
  parentSlug: string | null;
}

function resolve(doc: LocalizedDoc): ResolvedDoc | null {
  const { _type, language, slug } = doc;
  if (!slug) return null;
  if (language !== "it" && language !== "en") return null;
  // A subtopic's URL is /{parent}/{slug}; with no resolvable parent there
  // is no URL to protect, and guessing one would invent a route.
  const parentSlug = doc.parentSlug ?? null;
  if (_type === "subtopicPage" && !parentSlug) return null;
  return { _type, language, slug, parentSlug };
}

// The URL this document would occupy IF it belonged to `locale` — its own
// locale for the real path, the other one for the wrong-prefix path this
// file redirects away.
function pathFor(doc: ResolvedDoc, locale: Locale): string | null {
  if (doc._type === "subtopicPage") {
    return doc.parentSlug ? subtopicPath(locale, doc.parentSlug, doc.slug) : null;
  }
  if (doc._type === "pillarPage") return pillarPath(locale, doc.slug);
  if (doc._type === "page") return pagePath(locale, doc.slug);
  return null;
}

// "/en/disturbi-d-ansia" under locale "en" -> "disturbi-d-ansia".
// Same shape as reservedSlugs.ts's own rootSegmentOf — the locale prefix
// has to come off first, or every /en/* source would read as the
// reserved segment "en".
function rootSegmentOf(routePath: string, locale: Locale): string | null {
  const prefix = locale === "it" ? "" : `/${locale}`;
  const withoutLocale = routePath.startsWith(prefix)
    ? routePath.slice(prefix.length)
    : routePath;
  return withoutLocale.split("/").filter(Boolean)[0] ?? null;
}

// Pure, so the whole rule is testable without a dataset — see
// localeContentRedirects.test.ts. getLocaleContentRedirects() below is
// the only part that needs Sanity.
export function buildLocaleContentRedirects(docs: LocalizedDoc[]): StaticRedirect[] {
  const resolved = docs
    .map(resolve)
    .filter((doc): doc is ResolvedDoc => doc !== null);

  // Every URL a real document actually occupies, both locales.
  const realPaths = new Set<string>();
  for (const doc of resolved) {
    const ownPath = pathFor(doc, doc.language);
    if (ownPath) realPaths.add(ownPath);
  }

  const bySource = new Map<string, StaticRedirect>();
  const droppedAsReal: string[] = [];
  const droppedAsReserved: string[] = [];
  const conflicting: string[] = [];

  for (const doc of resolved) {
    const otherLocale: Locale = doc.language === "it" ? "en" : "it";
    const destination = pathFor(doc, doc.language);
    const source = pathFor(doc, otherLocale);
    if (!destination || !source || source === destination) continue;

    if (realPaths.has(source)) {
      droppedAsReal.push(source);
      continue;
    }

    const segment = rootSegmentOf(source, otherLocale);
    if (!segment || RESERVED_ROOT_SLUGS.has(segment)) {
      droppedAsReserved.push(source);
      continue;
    }

    const existing = bySource.get(source);
    if (existing) {
      // Two documents of the same language claiming one slug. Sanity
      // doesn't enforce slug uniqueness across types, so this is
      // reachable; emitting either destination would be a coin flip.
      if (existing.destination !== destination) {
        conflicting.push(`${source} -> ${existing.destination} | ${destination}`);
        bySource.delete(source);
      }
      continue;
    }

    bySource.set(source, { source, destination, permanent: true });
  }

  if (droppedAsReal.length > 0) {
    console.log(
      `[redirects] Cross-locale: skipped ${droppedAsReal.length} candidate(s) whose URL is itself a real page (a slug spelled the same in both languages): ${droppedAsReal.sort().join(", ")}`,
    );
  }
  if (droppedAsReserved.length > 0) {
    console.warn(
      `[redirects] Cross-locale: skipped ${droppedAsReserved.length} candidate(s) on a RESERVED root slug — a document should never hold one, check rootSlugValidator: ${droppedAsReserved.sort().join(", ")}`,
    );
  }
  if (conflicting.length > 0) {
    console.warn(
      `[redirects] Cross-locale: dropped ${conflicting.length} source(s) claimed by two documents with different destinations: ${conflicting.sort().join("; ")}`,
    );
  }

  // Sorted so a build's redirect list is byte-stable regardless of the
  // order Sanity happened to return documents in.
  return [...bySource.values()].sort((a, b) => a.source.localeCompare(b.source));
}

// No seo.noIndex filter, deliberately: a noIndex page is still a real
// route, so its URL must still count as claimed in realPaths above, and
// redirecting a wrong-prefix duplicate onto it is still correct.
const localizedContentQuery = `
  *[_type in ["pillarPage", "subtopicPage", "page"] && defined(slug.current)]{
    _type,
    language,
    "slug": slug.current,
    "parentSlug": parentPillar->slug.current
  }
`;

export async function getLocaleContentRedirects(): Promise<StaticRedirect[]> {
  let docs: LocalizedDoc[];

  try {
    docs = await getBuildTimeClient().fetch<LocalizedDoc[]>(localizedContentQuery);
  } catch (error) {
    // Fail SOFT, loudly, and toward the status quo: with no documents
    // there is no list, and the affected URLs keep 404ing exactly as they
    // do today. The alternative — failing the build — would turn an
    // unreachable dataset into an outage over a set of redirects that are
    // a cleanup, not a feature anything depends on.
    console.warn(
      "[redirects] Could not fetch localized content for cross-locale redirects; emitting none.",
      error,
    );
    return [];
  }

  const redirects = buildLocaleContentRedirects(docs);
  console.log(
    `[redirects] Cross-locale content redirects: ${redirects.length} from ${docs.length} document(s).`,
  );
  return redirects;
}
