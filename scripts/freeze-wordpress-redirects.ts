import { writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

// Root-namespace pass — generates the FROZEN snapshot of WordPress
// article slugs that next.config.ts's redirects() reads
// (src/sanity/wordpressArticleSlugs.json).
//
// Why frozen rather than queried live: the old
// getWordPressArticleRedirects() ran `*[_type == "article"]` — EVERY
// article, not just the migrated ones — so every newly written post
// would silently claim a root-namespace redirect (/{slug} ->
// /blog/{slug}) for a URL it never occupied on the old site, shadowing
// any page or pillar with that slug. The WordPress redirect set is a
// historical fact about one completed migration, not live data: it must
// not grow when Giuseppe writes a new post. Freezing it also removes a
// build-time Sanity dependency from next.config.ts's redirect list.
//
// "Migrated" is identified by the _id convention the migration script
// itself established: `article-{wpPostId}` (see
// migrate-wordpress-articles.ts, which does createIfNotExists on exactly
// that shape). Studio-authored articles get a random uuid _id instead, so
// the two are cleanly distinguishable without adding a field to the
// article schema (which this pass is explicitly not allowed to touch).
//
// This script is intended to be run ONCE, for the completed migration. It
// is committed rather than deleted so the snapshot is reproducible and so
// the derivation is auditable — but re-running it after new articles are
// authored is correct and safe: uuid-_id articles are excluded by design.

const WP_ID_PATTERN = /^article-\d+$/;
const OUTPUT_PATH = path.resolve(
  __dirname,
  "..",
  "src",
  "sanity",
  "wordpressArticleSlugs.json",
);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}

const client = createClient({
  projectId,
  dataset,
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: "2026-07-05",
  useCdn: false,
});

interface ArticleRow {
  _id: string;
  slug: string | null;
}

async function main() {
  const articles = await client.fetch<ArticleRow[]>(
    `*[_type == "article"]{ _id, "slug": slug.current }`,
  );

  const migrated = articles.filter((a) => WP_ID_PATTERN.test(a._id));
  const excluded = articles.filter((a) => !WP_ID_PATTERN.test(a._id));
  const missingSlug = migrated.filter((a) => !a.slug);

  // Sorted so the committed file has a stable diff across regenerations.
  const slugs = migrated
    .map((a) => a.slug)
    .filter((slug): slug is string => Boolean(slug))
    .sort();

  const duplicates = slugs.filter((slug, i) => i > 0 && slug === slugs[i - 1]);

  console.log(`Articles in dataset:        ${articles.length}`);
  console.log(`WordPress-migrated (_id):   ${migrated.length}`);
  console.log(`Excluded (Studio-authored): ${excluded.length}`);
  console.log(`Migrated but missing slug:  ${missingSlug.length}`);
  console.log(`Duplicate slugs:            ${duplicates.length}`);
  console.log(`Slugs written to snapshot:  ${slugs.length}`);

  if (excluded.length > 0) {
    console.log(`\nExcluded _ids: ${excluded.map((a) => a._id).join(", ")}`);
  }
  if (duplicates.length > 0) {
    console.log(`\nDuplicate slugs: ${[...new Set(duplicates)].join(", ")}`);
  }

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(slugs, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
