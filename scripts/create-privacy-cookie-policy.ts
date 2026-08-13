import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

// Privacy/cookie policy build pass — parses contents/privacy-cookie-policy.md
// directly (not retyped) into Portable Text, so the published documents are
// guaranteed byte-verbatim against the approved draft rather than a
// hand-transcribed copy that could silently drift. Four documents:
// privacyPage-it, privacyPage-en, cookiePolicyPage-it, cookiePolicyPage-en.
//
// Two deliberate departures from the source markdown, both explicitly
// instructed, not silent:
// - The "**Ultimo aggiornamento: [DA CONFERMARE]**" / "**Last updated:
//   [TO BE CONFIRMED]**" line under each H1 is NOT carried into the body —
//   it's now the `lastUpdated` schema field (empty for now, since there's
//   no real date yet; the page renders a visible "[DA CONFERMARE]"/
//   "[TO BE CONFIRMED]" placeholder fallback when it's empty — see
//   LegalPageShell.tsx).
// - ContactBlock is replaced with one closing prose paragraph linking to
//   /contatti — appended as the last body block, not present in the
//   source markdown (it describes what USED to be there before this
//   pass's own approved edit).
//
// Every other placeholder ([DA CONFERMARE] / [TO BE CONFIRMED]) is parsed
// and stored exactly as it appears in the source — this script does not
// special-case or strip them.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

let keyCounter = 0;
function genKey(): string {
  keyCounter += 1;
  return `k${keyCounter}${Math.random().toString(36).slice(2, 8)}`;
}

interface Span {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface MarkDef {
  _key: string;
  _type: "link";
  href: string;
}

// Scans one line/paragraph's raw text for **bold**, *italic*, [text](url) —
// left to right, non-overlapping. Table cells use stripInlineToPlainText
// below instead (no marks in a table cell, see contentTable.ts's own
// "no rich text inside a cell" comment).
function parseInlineSpans(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const tokenRegex = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  function pushPlain(str: string) {
    if (!str) return;
    children.push({ _type: "span", _key: genKey(), text: str, marks: [] });
  }

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushPlain(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      children.push({ _type: "span", _key: genKey(), text: match[1], marks: ["strong"] });
    } else if (match[2] !== undefined) {
      children.push({ _type: "span", _key: genKey(), text: match[2], marks: ["em"] });
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const markKey = genKey();
      markDefs.push({ _key: markKey, _type: "link", href: match[4] });
      children.push({ _type: "span", _key: genKey(), text: match[3], marks: [markKey] });
    }
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    pushPlain(text.slice(lastIndex));
  }
  if (children.length === 0) {
    children.push({ _type: "span", _key: genKey(), text: "", marks: [] });
  }
  return { children, markDefs };
}

// Table cells are plain strings (contentTable.ts) — strips code-span
// backticks (the only inline markdown the source tables use, e.g.
// `_ga`, `_ga_*`) rather than rendering literal backtick characters.
function stripInlineToPlainText(text: string): string {
  return text.replace(/`([^`]+)`/g, "$1").trim();
}

function paragraphBlock(text: string, style: "normal" | "h2" = "normal") {
  const { children, markDefs } = parseInlineSpans(text);
  return { _type: "block", _key: genKey(), style, children, markDefs };
}

function bulletBlock(text: string) {
  const { children, markDefs } = parseInlineSpans(text);
  return {
    _type: "block",
    _key: genKey(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    children,
    markDefs,
  };
}

function isTableRow(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line);
}
function isTableSeparator(line: string): boolean {
  return /^\s*\|[\s:|-]+\|\s*$/.test(line) && /-/.test(line);
}
function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => stripInlineToPlainText(cell));
}

function tableBlock(headerLine: string, bodyLines: string[]) {
  const headerRow = splitTableRow(headerLine);
  const rows = bodyLines.map((line) => ({ _key: genKey(), cells: splitTableRow(line) }));
  return { _type: "contentTable", _key: genKey(), headerRow, rows };
}

// Converts one section's raw markdown body (everything after the H1 +
// lastUpdated line) into a Portable Text block array.
function markdownToBlocks(markdown: string): unknown[] {
  const rawLines = markdown.split("\n");
  const blocks: unknown[] = [];
  let i = 0;

  function isBlank(line: string) {
    return line.trim() === "";
  }

  while (i < rawLines.length) {
    const line = rawLines[i] ?? "";

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // Heading — this source only uses ##, never ###.
    const headingMatch = /^##\s+(.*)$/.exec(line);
    if (headingMatch) {
      blocks.push(paragraphBlock(headingMatch[1]!.trim(), "h2"));
      i += 1;
      continue;
    }

    // Table — header row, separator row, then 1+ body rows.
    if (isTableRow(line) && i + 1 < rawLines.length && isTableSeparator(rawLines[i + 1] ?? "")) {
      const headerLine = line;
      i += 2; // skip header + separator
      const bodyLines: string[] = [];
      while (i < rawLines.length && isTableRow(rawLines[i] ?? "")) {
        bodyLines.push(rawLines[i]!);
        i += 1;
      }
      blocks.push(tableBlock(headerLine, bodyLines));
      continue;
    }

    // Bullet list — consecutive "- " lines, one block per item. Each item
    // can wrap onto following lines the same way a plain paragraph does;
    // in this source those continuation lines are indented (2 spaces,
    // confirmed against the actual file, not assumed) so they're
    // distinguishable from the next "- " item.
    if (/^-\s+/.test(line)) {
      while (i < rawLines.length && /^-\s+/.test(rawLines[i] ?? "")) {
        const itemLines = [(rawLines[i] ?? "").replace(/^-\s+/, "")];
        i += 1;
        while (
          i < rawLines.length &&
          /^\s+\S/.test(rawLines[i] ?? "") &&
          !/^\s*-\s+/.test(rawLines[i] ?? "")
        ) {
          itemLines.push((rawLines[i] ?? "").trim());
          i += 1;
        }
        blocks.push(bulletBlock(itemLines.join(" ")));
      }
      continue;
    }

    // Plain paragraph — accumulate wrapped lines until a blank line, a
    // heading, a table, or a bullet list starts.
    const paraLines: string[] = [line];
    i += 1;
    while (
      i < rawLines.length &&
      !isBlank(rawLines[i] ?? "") &&
      !/^##\s+/.test(rawLines[i] ?? "") &&
      !/^-\s+/.test(rawLines[i] ?? "") &&
      !(isTableRow(rawLines[i] ?? "") && isTableSeparator(rawLines[i + 1] ?? ""))
    ) {
      paraLines.push(rawLines[i]!);
      i += 1;
    }
    blocks.push(paragraphBlock(paraLines.join(" ").trim()));
  }

  return blocks;
}

// --- Extract the four sections from the source file -------------------------
const source = readFileSync("contents/privacy-cookie-policy.md", "utf8");

const SECTION_MARKERS = [
  { marker: "# PRIVACY POLICY — ITALIANO", key: "privacy-it" },
  { marker: "# COOKIE POLICY — ITALIANO", key: "cookie-it" },
  { marker: "# PRIVACY POLICY — ENGLISH", key: "privacy-en" },
  { marker: "# COOKIE POLICY — ENGLISH", key: "cookie-en" },
] as const;

function extractSection(marker: string): string {
  const startIdx = source.indexOf(marker);
  if (startIdx === -1) throw new Error(`Marker not found: ${marker}`);
  const afterMarker = startIdx + marker.length;
  const nextSeparatorIdx = source.indexOf("\n---\n---\n", afterMarker);
  const endIdx = nextSeparatorIdx === -1 ? source.length : nextSeparatorIdx;
  return source.slice(afterMarker, endIdx).trim();
}

// Each section starts with the "**Ultimo aggiornamento: ...**" /
// "**Last updated: ...**" line — stripped here (see this file's own top
// comment), everything after it is real body content.
function stripLastUpdatedLine(text: string): string {
  const lines = text.split("\n");
  const firstNonBlank = lines.findIndex((l) => l.trim() !== "");
  if (firstNonBlank === -1) return text;
  const candidate = lines[firstNonBlank]!.trim();
  if (/^\*\*(Ultimo aggiornamento|Last updated):/.test(candidate)) {
    return lines.slice(firstNonBlank + 1).join("\n").trim();
  }
  return text;
}

const CLOSING_LINK_IT =
  "Per qualsiasi domanda su questa informativa puoi [scrivermi](/contatti).";
const CLOSING_LINK_EN =
  "For any question about this notice you can [write to me](/en/contact).";

// Reciprocal-cross-link pass — cookie policy only. Privacy policy already
// links to the cookie policy from within its own §6 body prose (verbatim
// from the source markdown); the cookie policy never linked back, since
// the source never included that sentence. This is genuinely new prose
// (not in contents/privacy-cookie-policy.md), added on explicit
// instruction — appended AFTER the existing closing "scrivimi"/"write to
// me" paragraph, so it's the true last paragraph, not a replacement for it.
const RECIPROCAL_LINK_IT =
  "Il trattamento dei dati personali raccolti tramite questo sito è descritto nella [privacy policy](/privacy).";
const RECIPROCAL_LINK_EN =
  "How personal data collected through this site is processed is described in the [privacy policy](/en/privacy).";

interface DocSpec {
  id: string;
  type: "privacyPage" | "cookiePolicyPage";
  language: "it" | "en";
  title: string;
  markdown: string;
  closingLink: string;
  /** Cookie policy only — appended after closingLink, the true last paragraph. */
  reciprocalLink?: string;
  metaTitle: string;
  metaDescription: string;
}

const docs: DocSpec[] = [
  {
    id: "privacyPage-it",
    type: "privacyPage",
    language: "it",
    title: "Privacy policy",
    markdown: stripLastUpdatedLine(extractSection(SECTION_MARKERS[0].marker)),
    closingLink: CLOSING_LINK_IT,
    metaTitle: "Privacy policy",
    metaDescription:
      "Come vengono raccolti, usati e conservati i dati personali su questo sito, incluso il modulo di contatto.",
  },
  {
    id: "cookiePolicyPage-it",
    type: "cookiePolicyPage",
    language: "it",
    title: "Cookie policy",
    markdown: stripLastUpdatedLine(extractSection(SECTION_MARKERS[1].marker)),
    closingLink: CLOSING_LINK_IT,
    reciprocalLink: RECIPROCAL_LINK_IT,
    metaTitle: "Cookie policy",
    metaDescription:
      "Quali cookie e tecnologie simili usa questo sito, a cosa servono e come gestirli.",
  },
  {
    id: "privacyPage-en",
    type: "privacyPage",
    language: "en",
    title: "Privacy policy",
    markdown: stripLastUpdatedLine(extractSection(SECTION_MARKERS[2].marker)),
    closingLink: CLOSING_LINK_EN,
    metaTitle: "Privacy policy",
    metaDescription:
      "How personal data is collected, used and stored on this site, including the contact form.",
  },
  {
    id: "cookiePolicyPage-en",
    type: "cookiePolicyPage",
    language: "en",
    title: "Cookie policy",
    markdown: stripLastUpdatedLine(extractSection(SECTION_MARKERS[3].marker)),
    closingLink: CLOSING_LINK_EN,
    reciprocalLink: RECIPROCAL_LINK_EN,
    metaTitle: "Cookie policy",
    metaDescription:
      "Which cookies and similar technologies this site uses, what they're for, and how to manage them.",
  },
];

async function main() {
  for (const doc of docs) {
    const bodyBlocks = markdownToBlocks(doc.markdown);
    bodyBlocks.push(paragraphBlock(doc.closingLink));
    if (doc.reciprocalLink) {
      bodyBlocks.push(paragraphBlock(doc.reciprocalLink));
    }

    const document = {
      _id: doc.id,
      _type: doc.type,
      title: doc.title,
      body: bodyBlocks,
      seo: {
        _type: "seo",
        metaTitle: doc.metaTitle,
        metaDescription: doc.metaDescription,
        noIndex: true,
      },
      language: doc.language,
    };

    if (process.env.DRY_RUN) {
      console.log(`=== ${doc.id} (${bodyBlocks.length} blocks) ===`);
      console.log(JSON.stringify(document, null, 2));
      continue;
    }
    await client.createOrReplace(document);
    console.log(`wrote ${doc.id} — ${bodyBlocks.length} blocks`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
