import { createClient } from "@sanity/client";

// Recognition rebuild pass, part 2 — adds the `label` field (disorder
// name) to each of the 26 already-migrated recognition items, matched by
// array index. These are the same 13 labels originally reported (not
// imported) during the content-population pass, per that pass's own
// explicit instruction to strip them from the quote text and report them
// separately instead — now genuinely needed as their own field for the
// rebuild's brief ("each quote has a label beneath it"). Idempotent: if
// an item already has a label, it's left untouched.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const labelsIt = [
  "Ansia generalizzata", "Attacco di panico", "Disturbo di panico", "Agorafobia", "Claustrofobia",
  "Ansia sociale", "Ansia da malattia", "Ipocondria", "Ansia anticipatoria", "Ansia da prestazione",
  "Ansia da separazione", "Emetofobia", "Insonnia da ansia",
];
const labelsEn = [
  "Generalised anxiety", "Panic attack", "Panic disorder", "Agoraphobia", "Claustrophobia",
  "Social anxiety", "Health anxiety", "Hypochondria", "Anticipatory anxiety", "Performance anxiety",
  "Separation anxiety", "Emetophobia", "Anxiety-related insomnia",
];

async function migrateLocale(language: "it" | "en") {
  const docId = `pillarPage-anxiety-${language}`;
  const labels = language === "it" ? labelsIt : labelsEn;
  const doc = await client.fetch<{ recognition?: { items?: { _key: string; quote: string; label?: string }[] } } | null>(
    `*[_id == $docId][0]{recognition}`,
    { docId },
  );

  const items = doc?.recognition?.items;
  if (!items) {
    console.log(`${docId}: no recognition.items, skipping`);
    return;
  }

  if (items.length !== labels.length) {
    console.log(`${docId}: item count (${items.length}) doesn't match label list (${labels.length}) — skipping, needs manual review`);
    return;
  }

  if (items[0]?.label) {
    console.log(`${docId}: labels already set, skipping (idempotent)`);
    return;
  }

  const updated = items.map((item, i) => ({ ...item, label: labels[i] }));

  console.log(`${docId}: adding ${labels.length} labels`);
  console.log("  item[0]:", JSON.stringify({ quote: updated[0]?.quote, label: updated[0]?.label }));

  await client.patch(docId).set({ "recognition.items": updated }).commit();
  console.log(`${docId}: done`);
}

async function main() {
  await migrateLocale("it");
  await migrateLocale("en");
}

main();
