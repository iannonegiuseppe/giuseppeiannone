import { writeFileSync } from "node:fs";
import { createClient } from "@sanity/client";

// READ-ONLY inspection pass. Giuseppe's three most recent posts render
// with manual line breaks instead of paragraphs, bullet characters
// instead of real lists, and a FAQ typed as ordinary text rather than
// the faqBlock the article editor actually offers. Before any of that
// can be rewritten, the real Portable Text shape has to be looked at:
// whether the breaks are "\n" inside a span or separate blocks, how the
// FAQ is stored, and what the list/heading blocks look like today.
//
// Writes a full dump to .article-dump.json at the repo root (delete it
// afterwards; it is a working file, not a committed artefact) and prints
// a compact summary. This script NEVER writes to Sanity — it does not
// even read a write token.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_READ_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const SLUGS = [
  "cosa-fare-durante-un-attacco-di-panico",
  "cuore-e-ansia-quando-preoccuparsi",
  "coppie-lontane-da-casa-e-rischio-solitudine",
  // Control: migrated by script, never hand-edited. Its body is what a
  // correctly-shaped article looks like in this dataset.
  "scosse-alla-testa-e-ansia",
];

interface Span { _type: string; _key: string; text?: string; marks?: string[] }
interface Block {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: Span[];
  markDefs?: unknown[];
  [k: string]: unknown;
}
interface Article { _id: string; _rev: string; title: string; language: string; slug: string; body: Block[] }

function describe(b: Block, i: number): string {
  if (b._type !== "block") {
    return `${String(i).padStart(3)} [${b._type}]`;
  }
  const text = (b.children ?? []).map((c) => c.text ?? "").join("");
  const nl = (text.match(/\n/g) ?? []).length;
  const bullets = (text.match(/[•‣◦⁃-]\s/g) ?? []).length;
  const numbered = (text.match(/(^|\n)\s*\d+[.)]\s/g) ?? []).length;
  const flags = [
    b.style && b.style !== "normal" ? b.style : null,
    b.listItem ? `list:${b.listItem}` : null,
    nl ? `\\n x${nl}` : null,
    bullets ? `bullet-chars x${bullets}` : null,
    numbered ? `numbered-chars x${numbered}` : null,
    (b.children ?? []).length > 1 ? `spans:${(b.children ?? []).length}` : null,
  ].filter(Boolean).join(" ");
  const preview = text.replace(/\n/g, "⏎").replace(/\s+/g, " ").trim().slice(0, 72);
  return `${String(i).padStart(3)} ${(flags || "-").padEnd(42)} ${preview}`;
}

const dump: Record<string, Article> = {};

// Wrapped in main() rather than using top-level await: tsx compiles the
// scripts in this folder to CJS (no "type": "module" in package.json), and
// esbuild rejects top-level await for that target. Same shape as every
// other script here.
async function inspectAll() {
for (const slug of SLUGS) {
  const doc = await client.fetch<Article | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id, _rev, title, language, "slug": slug.current, body }`,
    { slug },
  );

  if (!doc) {
    console.log(`\n### ${slug}\n  NOT FOUND`);
    continue;
  }

  dump[slug] = doc;
  const blocks = doc.body ?? [];
  const types = blocks.reduce<Record<string, number>>((a, b) => {
    const k = b._type === "block" ? `block:${b.listItem ? "list-" + b.listItem : b.style ?? "normal"}` : b._type;
    a[k] = (a[k] ?? 0) + 1;
    return a;
  }, {});
  const newlines = blocks.reduce(
    (n, b) => n + ((b.children ?? []).map((c) => c.text ?? "").join("").match(/\n/g) ?? []).length,
    0,
  );

  console.log(`\n### ${slug}  (${doc._id}, ${doc.language}, rev ${doc._rev})`);
  console.log(`  blocks: ${blocks.length} | newlines inside spans: ${newlines}`);
  console.log(`  shape: ${JSON.stringify(types)}`);
  for (const [i, b] of blocks.entries()) console.log("  " + describe(b, i));
}

writeFileSync(".article-dump.json", JSON.stringify(dump, null, 2), "utf8");
console.log(`\nFull Portable Text written to .article-dump.json (working file — delete when done).`);
}

inspectAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
