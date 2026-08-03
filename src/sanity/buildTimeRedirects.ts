import { createClient } from "@sanity/client";

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

// One redirect per imported WordPress article: the old flat WP URL
// (https://www.giuseppeiannone.it/{slug}/) -> the new /blog/{slug}. Built
// from the live article slug list, not hand-maintained — see this pass's
// own collision-check report for why a catch-all pattern isn't safe here
// (the old site also has non-article pages at the same flat root).
export async function getWordPressArticleRedirects(): Promise<
  { source: string; destination: string; permanent: boolean }[]
> {
  const client = getBuildTimeClient();
  const articles = await client.fetch<{ slug: string }[]>(
    `*[_type == "article" && defined(slug.current)]{ "slug": slug.current }`,
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
  return articles.map(({ slug }) => ({
    source: `/${slug}`,
    destination: `/blog/${slug}`,
    permanent: true,
  }));
}
