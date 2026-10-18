import { getBuildTimeClient } from "./buildTimeClient";
import type { StaticRedirect } from "./localeSlugRedirects";
import { articlePath } from "./paths";
import { RESERVED_ROOT_SLUGS } from "./reservedSlugs";
import wordpressArticleSlugs from "./wordpressArticleSlugs.json";

// Root-namespace pass — the redirect SOURCE list is now a frozen,
// committed snapshot (wordpressArticleSlugs.json, 468 entries, generated
// once by scripts/freeze-wordpress-redirects.ts), not a live query.
//
// It used to be `*[_type == "article"]` — every article, not just the
// migrated ones. That meant a newly written post silently claimed a
// root-namespace redirect (/{slug} -> /blog/{slug}) for a URL it never
// occupied on the old WordPress site, shadowing any page or pillar page
// holding that slug, with no error anywhere. The WordPress redirect set
// is a historical fact about one completed migration; it must not grow
// when Giuseppe writes a post. See the generator script's own comment.
//
// Every source is unprefixed (/{slug}) — i.e. the IT root, matching the
// old flat WP URLs. All 468 migrated articles are language: "it".

// Claimed-slug filter: a root-level document (pillar page, universal
// page) holding one of these slugs would be permanently unreachable,
// because redirects run BEFORE routing — the redirect fires and the
// document is never consulted. Dropping the redirect is the correct
// resolution: the article stays reachable at its real /blog/{slug} URL,
// and the document keeps the root URL it was published at.
//
// Scoped to language == "it" deliberately: these redirect sources are
// unprefixed, so only IT documents can contend. An EN pillar at
// /en/{slug} is not shadowed by a /{slug} redirect.
async function getClaimedRootSlugs(): Promise<Set<string> | null> {
  try {
    const client = getBuildTimeClient();
    const rows = await client.fetch<{ slug: string | null }[]>(
      `*[_type in ["pillarPage", "page"] && language == "it" && defined(slug.current)]{ "slug": slug.current }`,
    );
    return new Set(rows.map((r) => r.slug).filter((s): s is string => Boolean(s)));
  } catch (error) {
    // Fail SOFT, loudly. The redirect list itself no longer depends on
    // Sanity (it's the frozen snapshot) — only this filter does, so an
    // unreachable dataset shouldn't take down the whole build. Emitting
    // the unfiltered snapshot is exactly the pre-existing behaviour, so
    // this degrades to the status quo rather than to something worse.
    console.warn(
      "[redirects] Could not fetch claimed root slugs; emitting the unfiltered WordPress snapshot.",
      error,
    );
    return null;
  }
}

export async function getWordPressArticleRedirects(): Promise<
  { source: string; destination: string; permanent: boolean }[]
> {
  const slugs: string[] = wordpressArticleSlugs;
  const claimed = await getClaimedRootSlugs();

  const droppedAsClaimed: string[] = [];
  const droppedAsReserved: string[] = [];

  const kept = slugs.filter((slug) => {
    if (RESERVED_ROOT_SLUGS.has(slug)) {
      droppedAsReserved.push(slug);
      return false;
    }
    if (claimed?.has(slug)) {
      droppedAsClaimed.push(slug);
      return false;
    }
    return true;
  });

  if (droppedAsReserved.length > 0) {
    console.warn(
      `[redirects] Dropped ${droppedAsReserved.length} WordPress redirect(s) whose slug is a reserved site route: ${droppedAsReserved.join(", ")}`,
    );
  }
  if (droppedAsClaimed.length > 0) {
    console.warn(
      `[redirects] Dropped ${droppedAsClaimed.length} WordPress redirect(s) whose slug is claimed by a published pillar page or page: ${droppedAsClaimed.join(", ")}. Those articles remain reachable at /blog/{slug}.`,
    );
  }
  console.log(
    `[redirects] WordPress article redirects: ${kept.length} of ${slugs.length} in the frozen snapshot.`,
  );

  // No trailing slash on `source`, even though every real old URL has one
  // (https://www.giuseppeiannone.it/{slug}/): Next.js's own automatic
  // trailing-slash normalization (trailingSlash: false, the project
  // default) ALWAYS fires before custom redirects() are matched, for any
  // incoming request that has a trailing slash — there is no way to make
  // a custom redirect see the pre-normalized path. Re-verified directly
  // against a real production build (not dev mode) this pass: a
  // trailing-slash-ONLY source matches nothing at all (0 redirects fired,
  // straight 404) — Next's own strip redirect always wins first, and once
  // it does, a slash-terminated source can never match. The real old URL
  // shape (every one ends in /) therefore costs two redirect hops, not
  // one: Next's own slash-strip, then this custom redirect. Both hops are
  // real 308s a browser/crawler follows correctly to a real 200 — this is
  // not broken, just not reducible to one hop without either flipping
  // trailingSlash to true sitewide (changes canonical URL shape for every
  // route, not just these) or moving this redirect into middleware
  // (reverses the "static config, not middleware" call this file's own
  // header comment already made, and runs per-request instead of once at
  // boot). Neither done here — flagged in this pass's own report instead
  // of picked unilaterally.
  return kept.map((slug) => ({
    source: `/${slug}`,
    destination: `/blog/${slug}`,
    permanent: true,
  }));
}


// --- /en/blog/{italian-slug} ------------------------------------------
//
// The same "slug decides the locale" rule as localeSlugRedirects.ts and
// localeContentRedirects.ts, for the blog namespace — and by volume the
// largest single thing in the 18 Oct 2026 Coverage export: 477 of the
// 540 "Not found (404)" URLs are /en/blog/{an Italian slug}, still being
// crawled on 13 Oct, two and a half months after launch.
//
// These will never have an English counterpart. Giuseppe declined the
// bulk-translation route in September and writes the English articles
// from scratch, on themes the Italian archive doesn't cover. So a 404 is
// not wrong, just slow and expensive: Google re-checks a 404 for months,
// and every re-check of a /en/blog/* miss renders the dynamic route and
// writes an ISR cache entry — on a plan whose ISR writes already ran
// 321K against a 200K limit. A redirect configured here is matched
// before routing, so it never renders and never writes.
//
// SOURCE IS THE FROZEN SNAPSHOT, not a live article query, for the same
// reason the root-namespace pass above uses it: the set of URLs the old
// WordPress site occupied is a historical fact about one completed
// migration, and it must not grow when Giuseppe writes a post. 460 of
// the 477 reported URLs are in it. Of the 17 that aren't, 16 are
// /en/blog/page/N — deliberately left to 404 (there is only one page of
// English articles today, and new ones will make those URLs valid) — and
// one is a post written after the migration, handled as a hand-curated
// redirect in next.config.ts instead.
//
// THE FILTER IS MANDATORY. Five English articles carry Italian slugs, so
// /en/blog/{that slug} is a REAL English page for them; redirecting it
// would take a live article off the site. Hence: no English slug list,
// no redirects at all. Failing closed is cheap here (the status quo is
// these URLs 404ing, exactly as they do today) and failing open is not.
//
// Residual window, stated plainly: if Giuseppe ever publishes an English
// article whose slug matches one of the 468 frozen Italian slugs, its URL
// is shadowed by this redirect until the next deploy, when the filter
// picks it up and drops the entry. The exposure is bounded (that fixed
// 468-slug set, which never grows) and self-healing, but it is real.
async function getEnglishArticleSlugs(): Promise<Set<string> | null> {
  try {
    const client = getBuildTimeClient();
    const rows = await client.fetch<{ slug: string | null }[]>(
      `*[_type == "article" && language == "en" && defined(slug.current)]{ "slug": slug.current }`,
    );
    return new Set(rows.map((r) => r.slug).filter((s): s is string => Boolean(s)));
  } catch (error) {
    console.warn(
      "[redirects] Could not fetch English article slugs; emitting no /en/blog redirects.",
      error,
    );
    return null;
  }
}

// Pure half, so the rule is testable without a dataset.
export function buildCrossLocaleArticleRedirects(
  italianSlugs: readonly string[],
  englishSlugs: ReadonlySet<string>,
): StaticRedirect[] {
  const seen = new Set<string>();
  const redirects: StaticRedirect[] = [];

  for (const slug of italianSlugs) {
    if (!slug || englishSlugs.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    redirects.push({
      source: articlePath("en", slug),
      destination: articlePath("it", slug),
      permanent: true,
    });
  }

  return redirects.sort((a, b) => a.source.localeCompare(b.source));
}

export async function getCrossLocaleArticleRedirects(): Promise<StaticRedirect[]> {
  const englishSlugs = await getEnglishArticleSlugs();
  if (englishSlugs === null) return [];

  const slugs: string[] = wordpressArticleSlugs;
  const redirects = buildCrossLocaleArticleRedirects(slugs, englishSlugs);
  const dropped = slugs.length - redirects.length;

  if (dropped > 0) {
    console.log(
      `[redirects] /en/blog: held back ${dropped} slug(s) that a real English article occupies.`,
    );
  }
  console.log(
    `[redirects] Cross-locale article redirects: ${redirects.length} of ${slugs.length} in the frozen snapshot.`,
  );
  return redirects;
}
