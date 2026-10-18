import { createClient } from "@sanity/client";
import { deontologyCheckAllowingSymbols } from "../src/sanity/schemaTypes/lib/deontologyValidator";

// Repairs the formatting of the three posts Giuseppe published by hand.
// Pasting from Word/Google Docs left soft line breaks as "\n" INSIDE
// Portable Text spans (which render as <br>), bullet and number markers
// typed as literal characters instead of real list blocks, and a FAQ
// written as ordinary paragraphs rather than the faqBlock the article
// editor offers. Measured before writing this: 52 newlines in the first
// post, 19 in the second, 2 in the third; the control post, migrated by
// script and never hand-edited, has 0.
//
// DRY RUN BY DEFAULT. Prints the full before/after block list and writes
// nothing. Set APPLY=1 to write.
//
// Two safety rails, both deliberate:
//   - every generated FAQ answer is run through the SAME §9 deontology
//     validator the faqItem schema uses, before anything is written. The
//     text is moving from article body (looser) into faqItem.answer
//     (validated), so copy that was legal where it sat could be illegal
//     where it lands. A violation aborts the whole run rather than
//     creating a document that shows a red error in Studio.
//   - every body write carries ifRevisionId, so an edit made in Studio
//     between the dry run and the apply makes the write fail instead of
//     silently overwriting it.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const APPLY = process.env.APPLY === "1";

// The dry run only reads, so it runs on the read token. The write token is
// required at the moment of writing and not a minute before — which also
// means a rotated or missing write token can't stop anyone from reviewing
// the proposed changes.
const token = APPLY
  ? process.env.SANITY_API_WRITE_TOKEN
  : (process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN);

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (APPLY && !token) {
  throw new Error("APPLY=1 needs SANITY_API_WRITE_TOKEN");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

// --- editorial decisions, deliberately visible and editable ----------
interface ArticlePlan {
  slug: string;
  // Giuseppe styled five lead-in lines as h3 in this post while the real
  // section headings are h2, so the document opened H1 -> H3. Promoting
  // them is what restores the hierarchy.
  promoteH3ToH2?: boolean;
  // Lines that are styled as a heading but read as a sentence introducing
  // the list under them ("I sintomi più comuni sono:"). A heading has to
  // name its subject on its own; a colon-terminated lead-in does not, so
  // these become ordinary paragraphs instead of being promoted.
  demoteToParagraph?: string[];
}

const PLANS: ArticlePlan[] = [
  {
    slug: "cosa-fare-durante-un-attacco-di-panico",
    demoteToParagraph: ["I sintomi più comuni sono:"],
  },
  { slug: "cuore-e-ansia-quando-preoccuparsi", promoteH3ToH2: true },
  { slug: "coppie-lontane-da-casa-e-rischio-solitudine" },
];

// Where the FAQ run ends. Anything from here on is trailing matter that
// belongs in the body, not in the accordion.
const FAQ_TERMINATORS = /^(fonti|l.autore|autore\s*:|questo articolo)/i;
const FAQ_HEADING = /domande frequenti/i;

const BULLET = /^\s*[•◦‣⁃·-]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

// --- Portable Text shapes --------------------------------------------
interface Span { _type: string; _key: string; text: string; marks: string[] }
interface MarkDef { _key: string; _type: string; [k: string]: unknown }
interface Block {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: Span[];
  markDefs?: MarkDef[];
  [k: string]: unknown;
}

let keySeed = 0;
function newKey(): string {
  keySeed += 1;
  return `fx${Date.now().toString(36)}${keySeed.toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// A single rendered line: what one "\n"-separated run of spans becomes.
interface Line { style: string; listItem?: string; spans: Span[] }
type Item = { kind: "line"; line: Line } | { kind: "passthrough"; block: Block };

// Splits a block's spans at every "\n", carrying each span's own marks
// across the split. This is the whole repair: a line break inside a span
// becomes a real block boundary.
function explode(block: Block): Item[] {
  if (block._type !== "block") return [{ kind: "passthrough", block }];

  const style = block.style ?? "normal";
  const lines: Span[][] = [[]];

  for (const span of block.children ?? []) {
    const parts = (span.text ?? "").split("\n");
    for (const [i, part] of parts.entries()) {
      if (i > 0) lines.push([]);
      if (part === "") continue;
      const current = lines[lines.length - 1];
      if (current) current.push({ _type: "span", _key: newKey(), text: part, marks: span.marks ?? [] });
    }
  }

  return lines
    .filter((spans) => spans.some((s) => s.text.trim() !== ""))
    .map((spans) => ({ kind: "line" as const, line: { style, listItem: block.listItem, spans } }));
}

function lineText(line: Line): string {
  return line.spans.map((s) => s.text).join("");
}

// Strips a literal "• " or "3. " typed at the start of a line and returns
// the list kind it stood for.
function detectListMarker(line: Line): "bullet" | "number" | null {
  const text = lineText(line);
  const re = BULLET.test(text) ? BULLET : NUMBERED.test(text) ? NUMBERED : null;
  if (!re) return null;

  const first = line.spans[0];
  if (!first) return null;
  first.text = first.text.replace(re, "");
  if (first.text === "") line.spans.shift();
  return re === BULLET ? "bullet" : "number";
}

function isQuestionLine(line: Line): boolean {
  const text = lineText(line).trim();
  if (!text.endsWith("?")) return false;
  const bold = line.spans.every((s) => s.text.trim() === "" || s.marks.includes("strong"));
  return bold || line.style === "h2" || line.style === "h3";
}

function toBlock(line: Line, markDefs: MarkDef[]): Block {
  const used = new Set(line.spans.flatMap((s) => s.marks));
  return {
    _type: "block",
    _key: newKey(),
    style: line.listItem ? "normal" : line.style,
    ...(line.listItem ? { listItem: line.listItem, level: 1 } : {}),
    children: line.spans,
    markDefs: markDefs.filter((d) => used.has(d._key)),
  };
}

interface FaqDraft { question: string; answerLines: Line[] }

interface ArticleDoc {
  _id: string;
  _rev: string;
  title: string;
  language: string;
  slug: string;
  body: Block[];
}

// Section labels that sit after the FAQ and head their own short run
// ("Fonti", "L'autore"). They are headings in everything but style.
const TRAILING_HEADING = /^(fonti|l.autore)$/i;

interface Planned {
  doc: ArticleDoc;
  before: string[];
  after: string[];
  body: Block[];
  faqItems: { _id: string; question: string; answer: Block[] }[];
}

function plan(doc: ArticleDoc, cfg: ArticlePlan): Planned {
  const allMarkDefs: MarkDef[] = (doc.body ?? []).flatMap((b) => b.markDefs ?? []);
  const before = (doc.body ?? []).map((b, i) => summarise(b, i));

  const items: Item[] = (doc.body ?? []).flatMap(explode);

  // Heading policy, then list markers.
  for (const item of items) {
    if (item.kind !== "line") continue;
    const text = lineText(item.line).trim();
    if (cfg.demoteToParagraph?.includes(text)) item.line.style = "normal";
    else if (cfg.promoteH3ToH2 && item.line.style === "h3") item.line.style = "h2";
    if (TRAILING_HEADING.test(text)) item.line.style = "h3";
    const marker = detectListMarker(item.line);
    if (marker) item.line.listItem = marker;
  }

  // Re-join a sentence the paste tore in half. A break landing mid-sentence
  // leaves a continuation starting with a lowercase letter — in the third
  // post, "Ogni delusione, ogni giornata difficile," / "ogni
  // preoccupazione, ogni richiesta di conforto finisce…", one sentence
  // split across a comma. Splitting that into two paragraphs would be a
  // different wrong answer from the <br> it is today, so these are merged
  // back with a single space. Scoped to plain paragraphs: a list item or a
  // heading starting lowercase is intentional, not a tear.
  for (let i = items.length - 1; i > 0; i -= 1) {
    const current = items[i];
    const previous = items[i - 1];
    if (!current || !previous || current.kind !== "line" || previous.kind !== "line") continue;
    if (current.line.listItem || previous.line.listItem) continue;
    if (current.line.style !== "normal" || previous.line.style !== "normal") continue;
    const first = lineText(current.line).trimStart().charAt(0);
    if (first === "" || first !== first.toLocaleLowerCase("it") || !/\p{L}/u.test(first)) continue;
    const lastSpan = previous.line.spans[previous.line.spans.length - 1];
    if (lastSpan && !/\s$/.test(lastSpan.text)) lastSpan.text += " ";
    previous.line.spans.push(...current.line.spans);
    items.splice(i, 1);
  }

  const faqAt = items.findIndex(
    (it) =>
      it.kind === "line" &&
      FAQ_HEADING.test(lineText(it.line)) &&
      (it.line.style !== "normal" || it.line.spans.every((s) => s.marks.includes("strong"))),
  );

  const head: Item[] = faqAt === -1 ? items : items.slice(0, faqAt);
  const drafts: FaqDraft[] = [];
  const tail: Item[] = [];

  if (faqAt !== -1) {
    let ended = false;
    for (const item of items.slice(faqAt + 1)) {
      if (ended || item.kind !== "line") { tail.push(item); continue; }
      const text = lineText(item.line).trim();
      // A heading that is not itself a question ends the FAQ run. Without
      // this the third post swallowed its closing "Messaggio chiave"
      // section into the last answer, because nothing else about that
      // line says "the questions are over".
      const closingHeading = (item.line.style === "h2" || item.line.style === "h3") && !isQuestionLine(item.line);
      if (closingHeading || TRAILING_HEADING.test(text) || FAQ_TERMINATORS.test(text) || item.line.spans.every((s) => s.marks.includes("em"))) {
        ended = true;
        tail.push(item);
        continue;
      }
      if (isQuestionLine(item.line)) {
        drafts.push({ question: text, answerLines: [] });
        continue;
      }
      const current = drafts[drafts.length - 1];
      if (current) current.answerLines.push(item.line);
      else tail.push(item);
    }
  }

  const faqItems = drafts.map((d, i) => ({
    _id: `faqItem-${doc.slug}-${i + 1}`,
    question: d.question,
    answer: d.answerLines.map((l) => toBlock({ ...l, style: "normal", listItem: undefined }, allMarkDefs)),
  }));

  const body: Block[] = head.map((it) => (it.kind === "line" ? toBlock(it.line, allMarkDefs) : it.block));

  if (faqAt !== -1) {
    const headingItem = items[faqAt];
    if (headingItem && headingItem.kind === "line") {
      body.push(toBlock({ ...headingItem.line, style: "h2", listItem: undefined }, allMarkDefs));
    }
    if (faqItems.length > 0) {
      body.push({
        _type: "faqBlock",
        _key: newKey(),
        items: faqItems.map((f) => ({ _type: "reference", _key: newKey(), _ref: f._id })),
      } as unknown as Block);
    }
    body.push(...tail.map((it) => (it.kind === "line" ? toBlock(it.line, allMarkDefs) : it.block)));
  }

  return { doc, before, after: body.map((b, i) => summarise(b, i)), body, faqItems };
}

function summarise(b: Block, i: number): string {
  if (b._type !== "block") {
    const extra = b._type === "faqBlock" ? ` (${(b.items as unknown[] | undefined)?.length ?? 0} refs)` : "";
    return `${String(i).padStart(3)} [${b._type}]${extra}`;
  }
  const text = (b.children ?? []).map((c) => c.text ?? "").join("");
  const nl = (text.match(/\n/g) ?? []).length;
  const kind = b.listItem ? `list:${b.listItem}` : b.style && b.style !== "normal" ? b.style : "p";
  return `${String(i).padStart(3)} ${kind.padEnd(11)}${nl ? ` \\n x${nl}` : ""} ${text.replace(/\n/g, "⏎").replace(/\s+/g, " ").trim().slice(0, 74)}`;
}

const check = deontologyCheckAllowingSymbols(["%"]);

async function run() {
  // Fail with a sentence rather than a stack trace. A revoked token comes
  // back as 401 SIO-401-ANF ("Session not found") on the very first read,
  // which reads like a bug in the script and is not one.
  try {
    await client.fetch<number>(`count(*[_type == "article"])`);
  } catch {
    throw new Error(
      `Sanity rejected the ${APPLY ? "SANITY_API_WRITE_TOKEN" : "read"} token.\n` +
        `Create a new one at https://sanity.io/manage -> project ${projectId} -> API -> Tokens\n` +
        `with Editor permission, and put it in .env.local.`,
    );
  }

  const planned: Planned[] = [];

  for (const cfg of PLANS) {
    const doc = await client.fetch<ArticleDoc | null>(
      `*[_type == "article" && slug.current == $slug][0]{ _id, _rev, title, language, "slug": slug.current, body }`,
      { slug: cfg.slug },
    );
    if (!doc) throw new Error(`Article not found: ${cfg.slug}`);
    planned.push(plan(doc, cfg));
  }

  // Open drafts are a silent undo button. This writes to the PUBLISHED
  // document; a draft sitting in Studio still holds the old, broken body,
  // and whoever presses Publish on it next reverts everything done here
  // without anyone noticing. Checked before the §9 gate so the louder
  // problem is reported first.
  const draftIds = planned.map((p) => `drafts.${p.doc._id}`);
  const openDrafts = await client.fetch<{ _id: string }[]>(
    `*[_id in $ids]{ _id }`,
    { ids: draftIds },
  );
  if (openDrafts.length > 0) {
    console.error(
      `\n!!! Unpublished drafts exist for ${openDrafts.length} of these articles:\n` +
        openDrafts.map((d) => "  " + d._id).join("\n") +
        `\nPublish or discard them in Studio first — otherwise this write lands on the published` +
        `\ndocument and the next Publish of that draft silently restores the broken formatting.`,
    );
    // Fatal only when actually writing: a dry run should still print the
    // full diff, since seeing it is the entire point of running one.
    if (APPLY) process.exit(1);
  }
  console.log("\nOpen-draft check: none of the three articles has an unpublished draft.");

  // §9 gate, before anything is written anywhere.
  const violations: string[] = [];
  for (const p of planned) {
    for (const item of p.faqItems) {
      const verdict = check(item.answer);
      if (verdict !== true) violations.push(`${item._id}: ${verdict}`);
    }
  }

  for (const p of planned) {
    console.log(`\n${"=".repeat(78)}\n### ${p.doc.slug}  (${p.doc._id}, rev ${p.doc._rev})`);
    console.log(`--- BEFORE (${p.before.length} blocks) ---`);
    for (const l of p.before) console.log("  " + l);
    console.log(`--- AFTER (${p.after.length} blocks) ---`);
    for (const l of p.after) console.log("  " + l);
    console.log(`--- faqItem documents (${p.faqItems.length}) ---`);
    for (const f of p.faqItems) {
      const answer = f.answer.map((b) => (b.children ?? []).map((c) => c.text).join("")).join(" ");
      console.log(`  ${f._id}`);
      console.log(`     Q: ${f.question}`);
      console.log(`     A: ${answer.slice(0, 150)}${answer.length > 150 ? "…" : ""}`);
    }
  }

  if (violations.length > 0) {
    console.error(`\n!!! §9 deontology violations — nothing written:\n${violations.map((v) => "  " + v).join("\n")}`);
    process.exit(1);
  }
  console.log(`\n§9 deontology check: ${planned.reduce((n, p) => n + p.faqItems.length, 0)} answer(s) passed.`);

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with APPLY=1 to write.");
    return;
  }

  for (const p of planned) {
    for (const f of p.faqItems) {
      await client.createIfNotExists({ _id: f._id, _type: "faqItem", question: f.question, answer: f.answer, language: p.doc.language });
      await client.patch(f._id).set({ question: f.question, answer: f.answer, language: p.doc.language }).commit();
      console.log(`  wrote ${f._id}`);
    }
    await client.patch(p.doc._id).ifRevisionId(p.doc._rev).set({ body: p.body }).commit();
    console.log(`  wrote body of ${p.doc.slug} (${p.body.length} blocks)`);
  }
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
