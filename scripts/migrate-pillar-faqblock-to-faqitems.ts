import { createClient } from "@sanity/client";

// Pillar template pass — the two placeholder pillarPage documents
// (pillarPage-anxiety-it/-en) have a faqBlock sitting inline in body
// (pillar-{locale}-faq, referencing faqItem-1/2/3-{locale}). The pillar
// template's dedicated FAQ section reads from a new top-level field
// (faqItems) instead, per this pass's own decision: fishing faqBlock out
// of body regardless of where the author placed it would be a silent
// WYSIWYG surprise. This script copies those same 3 references (same
// order) into faqItems, then removes the faqBlock entry from body —
// nothing else in body is touched. Idempotent: if faqItems is already set
// and the faqBlock is already gone, re-running is a no-op for that
// locale.
//
// Run: npx tsx -r dotenv/config scripts/migrate-pillar-faqblock-to-faqitems.ts dotenv_config_path=.env.local
//
// Already run once against the live dataset (both locales) as part of
// this pass — kept here per this repo's convention of keeping migration
// scripts in history rather than deleting them after use.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

interface FaqBlockItem {
  _key: string;
  _type: string;
  _ref: string;
}

interface FaqBlockEntry {
  _key: string;
  _type: string;
  items?: FaqBlockItem[];
}

async function migrateLocale(language: "it" | "en") {
  const docId = `pillarPage-anxiety-${language}`;
  const doc = await client.fetch<{ body?: { _key: string; _type: string }[] } | null>(
    `*[_id == $docId][0]{body}`,
    { docId },
  );

  if (!doc) {
    console.log(`${docId}: not found, skipping`);
    return;
  }

  const faqBlock = (doc.body ?? []).find(
    (block): block is FaqBlockEntry => block._type === "faqBlock",
  );

  if (!faqBlock) {
    console.log(`${docId}: no faqBlock in body, nothing to migrate`);
    return;
  }

  const refs = (faqBlock.items ?? []).map((item) => ({
    _key: item._key,
    _type: "reference" as const,
    _ref: item._ref,
  }));

  console.log(`${docId}: moving ${refs.length} reference(s) from body faqBlock "${faqBlock._key}" to faqItems`);

  await client
    .patch(docId)
    .set({ faqItems: refs })
    .unset([`body[_key=="${faqBlock._key}"]`])
    .commit();

  console.log(`${docId}: done`);
}

async function main() {
  await migrateLocale("it");
  await migrateLocale("en");
}

main();
