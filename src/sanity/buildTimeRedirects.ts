import { createClient } from "@sanity/client";
import { RESERVED_ROOT_SLUGS } from "./reservedSlugs";
import wordpressArticleSlugs from "./wordpressArticleSlugs.json";

// Config-time-only Sanity access for next.config.ts's redirects(). That
// function runs before the Next.js app exists (no request context), so it
// can't use src/sanity/client.ts (that file imports next/headers). Uses
// the plain @sanity/client package directly instead — same package
// scripts/migrate-wordpress-articles.ts already imports the same way, so
// this isn't a new dependency, just a second call site for one that's
// already resolvable.
function getBuildTimeClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;

  if (!projectId || !dataset) {
    throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
  }

  return createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });
}

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
  // default) strips it from the incoming request BEFORE custom redirects
  // are matched — a source WITH a trailing slash never matches a real
  // request. Confirmed by testing against the actual built server: a
  // trailing-slash source silently no-ops (Next's own redirect fires
  // instead, stripping the slash, then 404s) while a slash-less source
  // correctly catches the now-normalized request.
  return kept.map((slug) => ({
    source: `/${slug}`,
    destination: `/blog/${slug}`,
    permanent: true,
  }));
}
