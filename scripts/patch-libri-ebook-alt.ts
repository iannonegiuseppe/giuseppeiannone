import { createClient } from "@sanity/client";

// Libri ebook cover swap, follow-up — the guideCoverImage.alt text on
// both locale documents still described the OLD 3D laptop/video-call
// mockup after patch-libri-ebook-cover.ts swapped the asset. Only the
// alt sub-path is touched via patch().set() — never the whole
// guideCoverImage object — so the (already-correct) asset reference is
// left untouched.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const ALT_BY_DOC: Record<string, string> = {
  "libriPage-it": "Copertina della guida: E quindi uscimmo a riveder le stelle.",
  "libriPage-en": "Guide cover: E quindi uscimmo a riveder le stelle.",
};

async function main() {
  for (const [docId, alt] of Object.entries(ALT_BY_DOC)) {
    await client.patch(docId).set({ "guideCoverImage.alt": alt }).commit();
    console.log(`patched ${docId} -> guideCoverImage.alt = ${JSON.stringify(alt)}`);
  }
}
main();
