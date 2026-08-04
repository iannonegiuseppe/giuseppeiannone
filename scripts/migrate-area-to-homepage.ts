import { createClient } from "@sanity/client";

// Area-fold pass — copies the 12 `area` documents (6 per locale) into
// homePage.aree.items (the array field added in homePage.ts this same
// pass). Additive only: patch.set on exactly `aree.items`, never
// createOrReplace, never touches the source `area` documents — they keep
// their own data, orphaned but intact (see structure.ts's own comment
// once the type is hidden). Only title/descriptor carried over —
// slug (empty on all 12, backed by no route) and order (array position
// replaces it) are deliberately dropped, per this pass's own report.
// Idempotent: safe to re-run, always copies the CURRENT source values in
// CURRENT order.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

interface AreaDoc {
  _id: string;
  title: string;
  descriptor: string;
  order: number;
}

// Stable, readable _key derived from the source document's own _id
// (e.g. "area-ansia-it" -> "ansia") rather than an opaque counter —
// matches this codebase's preference for meaningful keys where one is
// available.
function keyFromId(id: string, language: string): string {
  return id.replace(/^area-/, "").replace(new RegExp(`-${language}$`), "");
}

async function migrateLocale(language: "it" | "en") {
  const homePageId = `homePage-${language}`;

  const [source, before] = await Promise.all([
    client.fetch<AreaDoc[]>(
      `*[_type == "area" && language == $language] | order(order asc){_id, title, descriptor, order}`,
      { language },
    ),
    client.fetch<{ items: unknown } | null>(`*[_id == $homePageId][0].aree{items}`, { homePageId }),
  ]);

  console.log(`\n=== ${language.toUpperCase()} ===`);
  console.log(`BEFORE homePage-${language}.aree.items:`, JSON.stringify(before?.items ?? null));
  console.log(`SOURCE area documents (${source.length}), in order:`);
  source.forEach((a) => console.log(`  [${a.order}] ${a._id}: "${a.title}" — "${a.descriptor}"`));

  if (source.length !== 6) {
    throw new Error(`Expected 6 ${language} area documents, found ${source.length} — aborting, no partial write.`);
  }

  const items = source.map((a) => ({
    _key: keyFromId(a._id, language),
    _type: "areaItem",
    title: a.title,
    descriptor: a.descriptor,
  }));

  await client
    .patch(homePageId)
    .set({ "aree.items": items })
    .commit();

  const after = await client.fetch<{ items: unknown } | null>(`*[_id == $homePageId][0].aree{items}`, {
    homePageId,
  });
  console.log(`AFTER  homePage-${language}.aree.items:`, JSON.stringify(after?.items, null, 2));
}

async function main() {
  await migrateLocale("it");
  await migrateLocale("en");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
