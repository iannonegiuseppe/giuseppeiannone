import { createClient } from "@sanity/client";

// Chi sono build pass — chiSonoSection just gained an `seo` field (see
// chiSonoSection.ts's own schema comment); this route isn't launched yet,
// so noIndex must be true from the start, matching every other
// not-yet-launched document's own convention this session. metaTitle/
// metaDescription are proposed separately and written only after
// approval — dotted-path .set() here touches only noIndex, so it can't
// clobber those once they land (same lesson as the earlier pillar-page
// noIndex incident this session: whole-object .set() on `seo` would wipe
// sibling fields; a dotted path merges instead).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  for (const docId of ["chiSonoSection-it", "chiSonoSection-en"]) {
    await client.patch(docId).set({ "seo.noIndex": true }).commit();
    console.log(`${docId}: seo.noIndex set to true`);
  }
}

main();
