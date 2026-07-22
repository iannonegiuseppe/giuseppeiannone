import { createClient } from "@sanity/client";

// homePage-array migration pass (owner call — see homePage.ts's own
// comment on the `diplomi.items` field): one-time move of the standalone
// `qualification` document type's content into homePage.diplomi.items,
// per locale. Reads whatever is CURRENTLY live (not the original seed
// content — Giuseppe may have uploaded real scans / edited placeholder
// text via Studio since), preserves asset references verbatim (no
// re-upload), and writes with a dot-path patch scoped to `diplomi.items`
// only — kicker/heading/alboLine on the same object are left untouched.
// `qualification` documents themselves are NOT deleted by this script —
// see qualification.ts's own `hidden: true` + comment for how they're
// orphaned instead.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

type QualificationDoc = {
  _id: string;
  _rev: string;
  language: "it" | "en";
  year?: string;
  title?: string;
  institution?: string;
  tier?: string;
  document?: { _type: "image"; asset: { _type: "reference"; _ref: string } };
  order?: number;
};

type QualificationItem = {
  _key: string;
  _type: "qualificationItem";
  year: string;
  title: string;
  institution: string;
  tier: string;
  document?: { _type: "image"; asset: { _type: "reference"; _ref: string } };
};

function sourceKeyFromId(id: string, locale: string): string {
  // "qualification-bicocca-it" -> "bicocca"
  return id.replace(/^qualification-/, "").replace(new RegExp(`-${locale}$`), "");
}

async function migrateLocale(locale: "it" | "en") {
  const docs = await client.fetch<QualificationDoc[]>(
    `*[_type == "qualification" && language == $locale] | order(order asc)`,
    { locale },
  );

  console.log(`\n=== source qualification docs (${locale}), ${docs.length} found ===`);
  console.log(JSON.stringify(docs, null, 2));

  // STOP condition: anything that doesn't map cleanly to the array shape.
  const malformed = docs.filter((d) => !d.year || !d.title || !d.institution || !d.tier);
  if (malformed.length > 0) {
    console.error(`\nSTOP: ${malformed.length} qualification doc(s) missing required fields, cannot migrate cleanly:`);
    console.error(JSON.stringify(malformed, null, 2));
    process.exit(1);
  }

  const items: QualificationItem[] = docs.map((d) => ({
    _key: `qualification-${sourceKeyFromId(d._id, locale)}`,
    _type: "qualificationItem",
    year: d.year!,
    title: d.title!,
    institution: d.institution!,
    tier: d.tier!,
    ...(d.document ? { document: d.document } : {}),
  }));

  const homePageId = `homePage-${locale}`;

  // Concurrency check: capture _rev now, right before the write, and
  // compare against a fresh read taken right after — if it moved between
  // the two, someone (or something) else touched this document during
  // the migration window.
  const beforeRev = (await client.fetch<{ _rev: string; diplomi?: unknown }>(`*[_id == $id][0]{_rev, diplomi}`, {
    id: homePageId,
  }));
  console.log(`\n=== ${homePageId} BEFORE ===`);
  console.log(JSON.stringify(beforeRev, null, 2));

  const recheckRev = await client.fetch<{ _rev: string }>(`*[_id == $id][0]{_rev}`, { id: homePageId });
  if (recheckRev._rev !== beforeRev._rev) {
    console.error(
      `\nSTOP: ${homePageId} was modified between read and write (rev ${beforeRev._rev} -> ${recheckRev._rev}). ` +
        `Not overwriting — re-run once the dataset is quiet.`,
    );
    process.exit(1);
  }

  await client.patch(homePageId).set({ "diplomi.items": items }).commit();

  const after = await client.fetch<{ _rev: string; diplomi?: unknown }>(`*[_id == $id][0]{_rev, diplomi}`, {
    id: homePageId,
  });
  console.log(`\n=== ${homePageId} AFTER ===`);
  console.log(JSON.stringify(after, null, 2));

  return { locale, sourceCount: docs.length, sourceDocs: docs, items };
}

async function main() {
  const results = await Promise.all([migrateLocale("it"), migrateLocale("en")]);

  console.log("\n=== verification (fresh query) ===");
  for (const { locale, sourceCount, sourceDocs } of results) {
    const fresh = await client.fetch<{ items?: QualificationItem[] }>(
      `*[_id == $id][0]{"items": diplomi.items}`,
      { id: `homePage-${locale}` },
    );
    const freshItems = fresh?.items ?? [];
    const countMatch = freshItems.length === sourceCount;
    const assetRefsMatch = sourceDocs.every((d, i) => {
      const migrated = freshItems[i];
      const sourceRef = d.document?.asset?._ref;
      const migratedRef = migrated?.document?.asset?._ref;
      return sourceRef === migratedRef;
    });
    console.log(`${locale}: source=${sourceCount} migrated=${freshItems.length} countMatch=${countMatch} assetRefsMatch=${assetRefsMatch}`);
    if (!countMatch || !assetRefsMatch) {
      console.error(`STOP: verification mismatch for ${locale} — investigate before proceeding.`);
      process.exit(1);
    }
    // items were built directly from sourceDocs above via the same map()
    // call — re-run through it here isn't sufficient for a genuine field-
    // by-field diff, do that explicitly:
    freshItems.forEach((item, i) => {
      const src = sourceDocs[i]!;
      const mismatches: string[] = [];
      if (item.year !== src.year) mismatches.push("year");
      if (item.title !== src.title) mismatches.push("title");
      if (item.institution !== src.institution) mismatches.push("institution");
      if (item.tier !== src.tier) mismatches.push("tier");
      if (mismatches.length > 0) {
        console.error(`STOP: ${locale} item ${i} (${item._key}) field mismatch: ${mismatches.join(", ")}`);
        process.exit(1);
      }
    });
  }

  console.log("\nMigration verified clean.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
