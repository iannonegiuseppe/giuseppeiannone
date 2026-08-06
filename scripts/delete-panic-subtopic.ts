import { createClient } from "@sanity/client";

// Pillar rollout, panic conflict resolution (owner decision: option 1,
// delete). subtopicPage-panic-it/en held only placeholder content
// (bracketed lorem ipsum body, bracketed SEO) since creation — confirmed
// nothing real existed to lose. Checked before deleting, not assumed:
// no navLink references them, no relatedTopics block anywhere references
// them, no recognitionItem.subtopic on the anxiety pillar points at
// either one, and sitemap.ts's own sitemapSubtopicsQuery already filters
// `seo.noIndex != true` — since both documents have noIndex: true, they
// were never in the sitemap either. The only document referencing them
// at all was their own translation.metadata pairing, deleted alongside
// them. No redirect: never indexed, never linked, nothing to redirect
// FROM in the first place.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  // translation.metadata first — it's the one holding references TO the
  // other two, and Sanity refuses to delete a still-referenced document.
  const ids = [
    "translation.metadata.subtopicPage-panic",
    "subtopicPage-panic-it",
    "subtopicPage-panic-en",
  ];
  for (const id of ids) {
    const before = await client.fetch(`*[_id == $id][0]{_id}`, { id });
    if (!before) {
      console.log(`${id}: already absent, skipping (idempotent)`);
      continue;
    }
    await client.delete(id);
    console.log(`${id}: deleted`);
  }
}

main();
