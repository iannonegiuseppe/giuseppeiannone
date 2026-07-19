import { createClient } from "@sanity/client";

// Recognition — asymmetric constellation, targeted patch. Same discipline
// as scripts/patch-hero-copy.ts: a dot-path .set() scoped to exactly
// "recognition.fragments" on the live homePage-it document, not a full
// reseed — createOrReplace/upsertManagedSingleton's own whole-object
// .set({recognition: {...}}) would overwrite kicker/heading/bridgeLine (and
// the now-orphaned old vignettes field) if any of those were hand-edited in
// Studio since the last seed run. This script never touches them.
//
// ALL FIVE fragments below are placeholder copy written by Aliaksandr's
// assistant, not by Giuseppe and not overheard from real patients — the
// whole point of this section is that the wording IS the language patients
// actually use. Marked [segnaposto] in the text itself (same convention as
// homePage.hope's own placeholder heading) so it's unmistakable in Studio
// and on the live page alike. Real lines are still owed by Giuseppe.
//
// Anchor pass: adds the single "anchor" tier fragment (fragment-anchor)
// to the four already live from the first pass — same dot-path .set(),
// still scoped to exactly "recognition.fragments", still nothing else.
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

const FRAGMENTS = [
  {
    _key: "fragment-anchor",
    label: "",
    text: "Da fuori sembra tutto a posto. Dentro, no. [segnaposto]",
    emphasisWord: "Dentro",
    tier: "anchor",
  },
  {
    _key: "fragment-stress",
    label: "Stress",
    text: "Mi sveglio già stanco, e la giornata non è ancora iniziata. [segnaposto]",
    emphasisWord: "già stanco",
    tier: "dominant",
  },
  {
    _key: "fragment-rimuginio",
    label: "Rimuginio",
    text: "Rimando le decisioni finché non sono più decisioni, ma urgenze. [segnaposto]",
    emphasisWord: "urgenze",
    tier: "dominant",
  },
  {
    _key: "fragment-ansia",
    label: "Ansia",
    text: "Il cuore accelera senza un motivo apparente. Ma il corpo non ci crede. [segnaposto]",
    tier: "peripheral",
  },
  {
    _key: "fragment-relazioni",
    label: "Relazioni",
    text: "Dico sempre di sì. Poi non resta niente per me. [segnaposto]",
    tier: "peripheral",
  },
];

const PATCH = {
  "recognition.fragments": FRAGMENTS,
};

async function getFragments(id: string) {
  return client.fetch(
    `*[_id == $id][0]{ "fragments": recognition.fragments }`,
    { id },
  );
}

async function main() {
  const before = await getFragments(DOC_ID);
  console.log("BEFORE:", JSON.stringify(before, null, 2));

  // Safety net only — homePage-it is a live, already-published document;
  // expected to be a no-op every time this actually runs.
  await client.createIfNotExists({ _id: DOC_ID, _type: "homePage", language: "it" });

  await client.patch(DOC_ID).set(PATCH).commit();

  const after = await getFragments(DOC_ID);
  console.log("AFTER:", JSON.stringify(after, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
