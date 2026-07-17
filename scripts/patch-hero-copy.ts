import { createClient } from "@sanity/client";

// Hero — finish it, Step 1: a targeted, one-off patch — NOT a reseed.
// Deliberately does not reuse upsertManagedSingleton's own `.set(fields)`
// call (see scripts/seed.ts): that helper sets whole top-level keys
// (e.g. the entire `hero` object), which would overwrite hero.photo/
// hero.youtubeId if either has been set by hand in Studio since the last
// seed run. This script instead uses dot-path keys ("hero.headline", not
// "hero"), which Sanity's patch API deep-sets without touching any
// sibling field under `hero` — exactly the same discipline
// upsertManagedSingleton exists to enforce, just scoped to four leaf
// paths instead of whole top-level objects.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped " +
      "token in the Sanity dashboard (API → Tokens → Add API token, " +
      '"Editor" permission), set it in .env.local, run this script, ' +
      "then delete the token again.",
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-07-05",
  useCdn: false,
});

const DOC_ID = "homePage-it";

const PATCH = {
  "hero.headline": "Uno spazio sicuro per ritrovare chiarezza e benessere.",
  "hero.headlineEmphasisWord": "chiarezza",
  "hero.positioningStatement":
    "Un percorso di psicoterapia costruito su ascolto, rispetto e professionalità, per accompagnarti a stare meglio con te stesso e con gli altri.",
  "hero.ctaLabel": "Inizia il percorso",
};

async function getHeroFields(id: string) {
  return client.fetch(
    `*[_id == $id][0]{
      "headline": hero.headline,
      "headlineEmphasisWord": hero.headlineEmphasisWord,
      "positioningStatement": hero.positioningStatement,
      "ctaLabel": hero.ctaLabel
    }`,
    { id },
  );
}

async function main() {
  const before = await getHeroFields(DOC_ID);
  console.log("BEFORE:", JSON.stringify(before, null, 2));

  // Safety net only — homePage-it is a live, already-published document;
  // this is expected to be a no-op every time it actually runs.
  await client.createIfNotExists({ _id: DOC_ID, _type: "homePage", language: "it" });

  await client.patch(DOC_ID).set(PATCH).commit();

  const after = await getHeroFields(DOC_ID);
  console.log("AFTER:", JSON.stringify(after, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
