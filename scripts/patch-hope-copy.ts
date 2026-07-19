import { createClient } from "@sanity/client";

// Hope — full-bleed accent band, targeted patch. Same discipline as
// scripts/patch-hero-copy.ts and scripts/patch-recognition-copy.ts: a
// dot-path .set() scoped to exactly the three hope.* leaf paths on the
// live homePage-it document, not a full reseed — nothing else on the
// document is touched.
//
// ALL THREE fields below are placeholder copy written by Aliaksandr's
// assistant, not by Giuseppe — his real line is still outstanding ("the
// message/intent for the Hope section"). Marked [segnaposto] in the text
// itself (same convention as every other placeholder on this page) so
// it's unmistakable in Studio and on the live page alike. This copy
// matters more than any other placeholder on the homepage: one sentence
// carries the entire emotional turn of the page, and it has to be his.
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
  "hope.eyebrow": "Un percorso possibile [segnaposto]",
  "hope.heading": "Non è sempre stato così. E non deve restare così. [segnaposto]",
  "hope.headingEmphasisWord": "non deve restare",
};

async function getHopeFields(id: string) {
  return client.fetch(
    `*[_id == $id][0]{
      "eyebrow": hope.eyebrow,
      "heading": hope.heading,
      "headingEmphasisWord": hope.headingEmphasisWord
    }`,
    { id },
  );
}

async function main() {
  const before = await getHopeFields(DOC_ID);
  console.log("BEFORE:", JSON.stringify(before, null, 2));

  // Safety net only — homePage-it is a live, already-published document;
  // expected to be a no-op every time this actually runs.
  await client.createIfNotExists({ _id: DOC_ID, _type: "homePage", language: "it" });

  await client.patch(DOC_ID).set(PATCH).commit();

  const after = await getHopeFields(DOC_ID);
  console.log("AFTER:", JSON.stringify(after, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
