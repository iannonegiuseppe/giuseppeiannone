import { createClient } from "@sanity/client";

// Owner decision: remove the "whether to stay or leave" sentence from the
// relationships pillar's own "no advice on the relationship" paragraph —
// he doesn't want it. Surgical patch on the exact block/span the sentence
// lives in (found by direct query first, not assumed) — leaves every
// other block in the body array untouched. Don't replace it with
// anything; the paragraph is simply two sentences now instead of three.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  await client
    .patch("pillarPage-relazioni-it")
    .set({
      'body[_key=="blk-51"].children[_key=="span-52"].text':
        "Non do consigli su cosa fare della relazione. Quello su cui si può lavorare è la chiarezza con cui quella decisione viene presa.",
    })
    .commit();
  console.log("pillarPage-relazioni-it: patched");

  await client
    .patch("pillarPage-relazioni-en")
    .set({
      'body[_key=="blk-119"].children[_key=="span-120"].text':
        "I don't advise people on what to do about the relationship. What can be worked on is the clarity with which the decision gets made.",
    })
    .commit();
  console.log("pillarPage-relazioni-en: patched");
}

main();
