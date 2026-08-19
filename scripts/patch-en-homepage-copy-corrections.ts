import { createClient } from "@sanity/client";

// Follow-up to patch-en-homepage-copy.ts: three verbatim corrections after
// that pass introduced two real line-wrap regressions at 1440 (hope.heading,
// contactSection.heading — the latter despite an unchanged character count,
// see that pass's own report) plus an SEO metaTitle/metaDescription overage.
// faqItem-home-8-en is deliberately left as-is — its extra mobile line was
// accepted, not a defect.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HOMEPAGE_EN_SET: Record<string, unknown> = {
  "seo.metaTitle": "English-speaking psychotherapist in Milan — anxiety, panic",
  "seo.metaDescription":
    "Psychotherapy in English for anxiety and panic attacks. Milan, Monza and online. First session 45 minutes, €100.",
  "contactSection.heading": "Write me a few lines and we'll find where to start.",
  "hope.heading": "It hasn't always been like this. And it doesn't have to stay.",
  "hope.headingEmphasisWord": "doesn't have to stay",
};

async function main() {
  const beforeItRev = await client.fetch<string>(`*[_id == "homePage-it"][0]._rev`);
  const beforeEnRev = await client.fetch<string>(`*[_id == "homePage-en"][0]._rev`);
  console.log("BEFORE homePage-it._rev:", beforeItRev);
  console.log("BEFORE homePage-en._rev:", beforeEnRev);

  await client.patch("homePage-en").set(HOMEPAGE_EN_SET).commit();

  const afterItRev = await client.fetch<string>(`*[_id == "homePage-it"][0]._rev`);
  const afterEnRev = await client.fetch<string>(`*[_id == "homePage-en"][0]._rev`);
  console.log("AFTER  homePage-it._rev:", afterItRev);
  console.log("AFTER  homePage-en._rev:", afterEnRev);
  console.log("homePage-it._rev unchanged:", beforeItRev === afterItRev);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
