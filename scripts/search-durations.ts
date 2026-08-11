import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-07-05",
  useCdn: false,
});

const IT_NUMBERS = [
  "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci",
  "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette",
  "diciotto", "diciannove", "venti", "ventuno", "ventidue", "ventitré", "venticinque",
  "trenta",
];
const EN_NUMBERS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-five", "thirty",
];

function findMatches(text: string, docId: string, path: string, hits: Array<{ docId: string; path: string; match: string; context: string }>) {
  // digit + anni/years
  const digitPatterns = [/\b\d{1,2}\s*anni\b/gi, /\b\d{1,2}\s*years\b/gi, /\b\d{1,2}-year\b/gi];
  for (const re of digitPatterns) {
    let m;
    while ((m = re.exec(text))) {
      const idx = m.index;
      hits.push({ docId, path, match: m[0], context: text.slice(Math.max(0, idx - 60), idx + 60) });
    }
  }
  // spelled-out IT
  for (const num of IT_NUMBERS) {
    const re = new RegExp(`\\b${num}\\s+anni\\b`, "gi");
    let m;
    while ((m = re.exec(text))) {
      const idx = m.index;
      hits.push({ docId, path, match: m[0], context: text.slice(Math.max(0, idx - 60), idx + 60) });
    }
  }
  // spelled-out EN
  for (const num of EN_NUMBERS) {
    const re = new RegExp(`\\b${num}[\\s-]+years\\b`, "gi");
    let m;
    while ((m = re.exec(text))) {
      const idx = m.index;
      hits.push({ docId, path, match: m[0], context: text.slice(Math.max(0, idx - 60), idx + 60) });
    }
  }
}

function walk(value: unknown, docId: string, path: string, hits: Array<{ docId: string; path: string; match: string; context: string }>) {
  if (typeof value === "string") {
    findMatches(value, docId, path, hits);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, docId, `${path}[${i}]`, hits));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.startsWith("_")) continue;
      walk(v, docId, path ? `${path}.${k}` : k, hits);
    }
  }
}

async function main() {
  const allDocs = await client.fetch(`*[!(_id in path("drafts.**"))]`);
  console.log(`Scanning ${allDocs.length} published documents...\n`);
  const hits: Array<{ docId: string; path: string; match: string; context: string }> = [];
  for (const doc of allDocs) {
    walk(doc, doc._id, "", hits);
  }
  console.log(`=== ${hits.length} match(es) in Sanity content ===`);
  for (const hit of hits) {
    console.log(`${hit.docId} :: ${hit.path}\n  match: "${hit.match}"\n  context: ...${hit.context}...\n`);
  }
}

main();
