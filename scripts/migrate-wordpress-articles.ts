import { createClient } from "@sanity/client";
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";
import path from "node:path";

// WordPress -> Sanity blog migration. Stage C: full import, all posts.
// Idempotent by design: every write is createIfNotExists + patch.set,
// keyed on a stable _id derived from the WordPress post id
// (`article-{wp-id}`). Running this twice must not create duplicates or
// touch any field not listed in the patch. Never createOrReplace.
//
// A dead/failing image (cover or in-body) does NOT fail the whole post —
// it's skipped, logged, and the article is written without it. Only a
// failure to fetch the WP post itself, or a failure in the Sanity write
// itself, fails the whole post.

const WP_BASE = "https://www.giuseppeiannone.it";

// Report files land here — outside the repo, not committed. Point your
// own tooling at this path, or copy specific files into the repo
// yourself if you want any of them kept.
const REPORTS_DIR =
  process.env.WP_MIGRATION_REPORTS_DIR ||
  "C:/Users/HP/AppData/Local/Temp/claude/d--applications-giuseppeiannone/1da9657e-d4d2-464f-a00a-0479e2811ef2/scratchpad/wp-migration-reports";

const FAILURE_RATE_STOP_THRESHOLD = 0.05;
const MIN_PROCESSED_BEFORE_CIRCUIT_BREAKER = 20;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- WordPress fetch helpers ------------------------------------------

interface WpPost {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  tags: number[];
}

async function fetchAllWpPostIds(): Promise<number[]> {
  // Debugging/verification escape hatch — set WP_TEST_IDS as a
  // comma-separated list of post ids to run against a small, explicit
  // subset instead of the full site. Unset (the default) fetches every
  // post, which is what Stage C actually runs.
  if (process.env.WP_TEST_IDS) {
    return process.env.WP_TEST_IDS.split(",").map((s) => Number(s.trim()));
  }
  const ids: number[] = [];
  let page = 1;
  for (;;) {
    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=id`);
    if (!res.ok) {
      if (res.status === 400 && page > 1) break; // WP returns 400 once past the last page
      throw new Error(`WP post list page ${page} fetch failed: ${res.status}`);
    }
    const data: { id: number }[] = await res.json();
    if (data.length === 0) break;
    ids.push(...data.map((p) => p.id));
    page += 1;
    await sleep(400);
  }
  return ids;
}

async function fetchWpPost(id: number): Promise<WpPost> {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/posts/${id}`);
  if (!res.ok) throw new Error(`WP post ${id} fetch failed: ${res.status}`);
  return res.json();
}

async function fetchWpMedia(id: number): Promise<{ url: string; alt: string } | null> {
  if (!id) return null;
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/media/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return { url: data.source_url as string, alt: (data.alt_text as string) || "" };
}

const tagNameCache = new Map<number, string>();
async function fetchWpTagName(id: number): Promise<string> {
  if (tagNameCache.has(id)) return tagNameCache.get(id)!;
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/tags/${id}`);
  if (!res.ok) return String(id);
  const data = await res.json();
  const name = (data.name as string) || String(id);
  tagNameCache.set(id, name);
  return name;
}

async function scrapeMetaTags(url: string): Promise<{ title: string | null; description: string | null }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Rendered page fetch failed for ${url}: ${res.status}`);
  const html = await res.text();
  const dom = new JSDOM(html, { virtualConsole: new VirtualConsole() });
  const doc = dom.window.document;
  const title = doc.querySelector("title")?.textContent?.trim() || null;
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || null;
  return { title, description };
}

// A description is flagged (not fixed) when it ends in an explicit
// ellipsis, or doesn't end on sentence-closing punctuation at all — the
// AIOSEO mid-word cut ("...dalla bravura del tera") is the latter case.
function isDescriptionTruncated(description: string): boolean {
  const trimmed = description.trim();
  if (/(\.\.\.|…)$/.test(trimmed)) return true;
  return !/[.!?"'\)]$/.test(trimmed);
}

// --- §9 deontology scan (report-only, Italian phrase/keyword matching) ---
// Best-effort natural-language matching, not exhaustive — a work list for
// manual review, not a filter. Categories per docs/design-direction.md §9
// plus this pass's own explicit additions (session-count/duration
// promises, comparative-quality claims).

interface DeontologyPattern {
  category: string;
  pattern: RegExp;
}

const DEONTOLOGY_PATTERNS: DeontologyPattern[] = [
  {
    category: "session-count-or-duration-promise",
    pattern: /quante sedute|in \d+ sedute|dopo \d+ sedute|in poch[ei] (settimane|sedute|mesi)|risultati in \d+/gi,
  },
  {
    category: "comparative-claim",
    pattern:
      /(la |il )?(psicoterapia|terapia|psicologo|psicoterapeuta|terapeuta) (migliore|miglior[ei])|il miglior (psicologo|psicoterapeuta|terapeuta)|meglio di altri|a differenza di altri|come capire se.{0,25}(è|sia) bravo/gi,
  },
  {
    category: "efficacy-or-outcome-claim",
    pattern:
      /funziona sempre|risolve (il|ogni) problema|cura definitiv\w*|elimina l['’]ansia|guarigione (completa|totale)/gi,
  },
  {
    category: "statistics-or-percentages",
    pattern: /\d{1,3}\s?%|\d+\s+(pazienti|persone)\s+su\s+\d+|migliaia di pazienti/gi,
  },
  {
    category: "testimonial",
    pattern: /testimonianz\w*|recension[ei]|mi ha scritto una paziente|un[ao]? paziente mi ha raccontato/gi,
  },
  {
    category: "guarantee-of-recovery",
    pattern: /garant(isco|isce|ito|ita)\s+(la\s+)?guarigione|guarigione garantita|risultati garantiti/gi,
  },
];

interface DeontologyFlag {
  wpId: number;
  slug: string;
  category: string;
  matchedPhrase: string;
  context: string;
}

function scanDeontology(wpId: number, slug: string, plainText: string): DeontologyFlag[] {
  const flags: DeontologyFlag[] = [];
  for (const { category, pattern } of DEONTOLOGY_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((match = re.exec(plainText))) {
      const start = Math.max(0, match.index - 60);
      const end = Math.min(plainText.length, match.index + match[0].length + 60);
      flags.push({
        wpId,
        slug,
        category,
        matchedPhrase: match[0],
        context: plainText.slice(start, end).trim(),
      });
    }
  }
  return flags;
}

// --- Image upload with dedup-by-source-URL, and skip-on-failure --------

const imageAssetCache = new Map<string, string>(); // source URL -> Sanity asset _id

interface SkippedImage {
  wpId: number;
  slug: string;
  role: "cover" | "in-body";
  url: string;
  reason: string;
}

async function uploadImageDeduped(url: string, filenameHint: string): Promise<string> {
  const cached = imageAssetCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, { filename: filenameHint });
  imageAssetCache.set(url, asset._id);
  return asset._id;
}

// --- Portable Text block builders (matching scripts/seed.ts's own convention) ---

let keyCounter = 0;
function nextKey(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: "link"; _key: string; href: string; nofollow: boolean };
type TextBlock = {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
};
type ImageBlock = {
  _type: "image";
  _key: string;
  alt: string;
  generatedAlt: boolean;
  asset: { _type: "reference"; _ref: string };
};
type PortableTextItem = TextBlock | ImageBlock;

const HEADING_MAP: Record<string, "h2" | "h3"> = {
  h1: "h2",
  h2: "h2",
  h3: "h3",
  h4: "h3",
  h5: "h3",
  h6: "h3",
};

interface ConvertResult {
  blocks: PortableTextItem[];
  imagesFound: number;
  imagesLanded: number;
  imagesGeneratedAlt: number;
  warnings: string[];
  skippedImages: SkippedImage[];
}

function extractInline(node: Node, markDefs: MarkDef[], marks: string[] = []): Span[] {
  const spans: Span[] = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      const text = child.textContent || "";
      if (text.trim().length === 0 && spans.length === 0) return;
      spans.push({ _type: "span", _key: nextKey("span"), text, marks: [...marks] });
    } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      if (tag === "strong" || tag === "b") {
        spans.push(...extractInline(el, markDefs, [...marks, "strong"]));
      } else if (tag === "em" || tag === "i") {
        spans.push(...extractInline(el, markDefs, [...marks, "em"]));
      } else if (tag === "a") {
        const href = el.getAttribute("href");
        if (href) {
          const linkKey = nextKey("link");
          markDefs.push({ _type: "link", _key: linkKey, href, nofollow: false });
          spans.push(...extractInline(el, markDefs, [...marks, linkKey]));
        } else {
          spans.push(...extractInline(el, markDefs, marks));
        }
      } else if (tag === "br") {
        spans.push({ _type: "span", _key: nextKey("span"), text: "\n", marks: [...marks] });
      } else {
        spans.push(...extractInline(el, markDefs, marks));
      }
    }
  });
  return spans;
}

async function htmlToPortableText(
  html: string,
  ctx: { wpId: number; slug: string; articleTitle: string },
): Promise<ConvertResult> {
  const warnings: string[] = [];
  const skippedImages: SkippedImage[] = [];
  let imagesFound = 0;
  let imagesLanded = 0;
  let imagesGeneratedAlt = 0;

  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`, { virtualConsole: new VirtualConsole() });
  const document = dom.window.document;

  document.querySelectorAll("script, style, form, iframe, noscript").forEach((el: Element) => {
    if (el.tagName.toLowerCase() === "script" && el.getAttribute("src")?.includes("activehosted.com")) {
      warnings.push("Stripped ActiveCampaign form embed script");
    } else if (el.tagName.toLowerCase() === "style") {
      warnings.push("Stripped embedded <style> block");
    }
    el.remove();
  });
  document.querySelectorAll("div[class*='_form']").forEach((el: Element) => {
    warnings.push("Stripped ActiveCampaign form div");
    el.remove();
  });
  const walker = document.createTreeWalker(document.body, dom.window.NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  let n;
  // eslint-disable-next-line no-cond-assign
  while ((n = walker.nextNode())) comments.push(n);
  comments.forEach((c) => c.parentNode?.removeChild(c));

  const blocks: PortableTextItem[] = [];

  // Resolves one <img> into a portable-text image block, or records a
  // skip and returns null. Never throws — a bad in-body image must not
  // fail the article.
  async function resolveImage(img: Element): Promise<ImageBlock | null> {
    const src = img.getAttribute("src");
    if (!src) return null;
    imagesFound += 1;
    const wpAlt = img.getAttribute("alt") || "";
    const alt = wpAlt || ctx.articleTitle;
    const generatedAlt = !wpAlt;
    try {
      const assetId = await uploadImageDeduped(src, src.split("/").pop() || "image.jpg");
      imagesLanded += 1;
      if (generatedAlt) imagesGeneratedAlt += 1;
      return { _type: "image", _key: nextKey("image"), alt, generatedAlt, asset: { _type: "reference", _ref: assetId } };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skippedImages.push({ wpId: ctx.wpId, slug: ctx.slug, role: "in-body", url: src, reason });
      return null;
    }
  }

  async function walk(node: Node): Promise<void> {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) continue;
      if (child.nodeType !== 1) continue;
      const el = child as Element;
      const tag = el.tagName.toLowerCase();

      if (tag in HEADING_MAP) {
        const markDefs: MarkDef[] = [];
        const key = nextKey("block");
        const children = extractInline(el, markDefs);
        if (children.length > 0) {
          blocks.push({ _type: "block", _key: key, style: HEADING_MAP[tag]!, markDefs, children });
        }
        continue;
      }

      if (tag === "p") {
        const imgs = el.querySelectorAll("img");
        if (imgs.length > 0) {
          for (const img of Array.from(imgs)) {
            const block = await resolveImage(img);
            if (block) blocks.push(block);
          }
          const clone = el.cloneNode(true) as Element;
          clone.querySelectorAll("img").forEach((i) => i.remove());
          const markDefs: MarkDef[] = [];
          const children = extractInline(clone, markDefs);
          if (children.some((s) => s.text.trim().length > 0)) {
            blocks.push({ _type: "block", _key: nextKey("block"), style: "normal", markDefs, children });
          }
          continue;
        }
        const markDefs: MarkDef[] = [];
        const key = nextKey("block");
        const children = extractInline(el, markDefs);
        if (children.some((s) => s.text.trim().length > 0)) {
          blocks.push({ _type: "block", _key: key, style: "normal", markDefs, children });
        }
        continue;
      }

      if (tag === "blockquote") {
        const markDefs: MarkDef[] = [];
        const key = nextKey("block");
        const children = extractInline(el, markDefs);
        if (children.some((s) => s.text.trim().length > 0)) {
          blocks.push({ _type: "block", _key: key, style: "blockquote", markDefs, children });
        }
        continue;
      }

      if (tag === "ul" || tag === "ol") {
        const listItem = tag === "ul" ? "bullet" : "number";
        for (const li of Array.from(el.children)) {
          if (li.tagName.toLowerCase() !== "li") continue;
          const markDefs: MarkDef[] = [];
          const key = nextKey("block");
          const children = extractInline(li, markDefs);
          if (children.some((s) => s.text.trim().length > 0)) {
            blocks.push({ _type: "block", _key: key, style: "normal", listItem, level: 1, markDefs, children });
          }
        }
        continue;
      }

      if (tag === "img") {
        const block = await resolveImage(el);
        if (block) blocks.push(block);
        continue;
      }

      if (tag === "hr") {
        continue;
      }

      const hasBlockDescendant = Array.from(el.children).some((c) =>
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "blockquote", "img", "div", "article", "section", "figure"].includes(
          c.tagName.toLowerCase(),
        ),
      );
      if (hasBlockDescendant) {
        await walk(el);
      } else {
        const markDefs: MarkDef[] = [];
        const key = nextKey("block");
        const children = extractInline(el, markDefs);
        if (children.some((s) => s.text.trim().length > 0)) {
          blocks.push({ _type: "block", _key: key, style: "normal", markDefs, children });
        }
      }
    }
  }

  await walk(document.body);

  return { blocks, imagesFound, imagesLanded, imagesGeneratedAlt, warnings, skippedImages };
}

// --- Per-post pipeline ---------------------------------------------------

interface PostReportRow {
  wpId: number;
  title: string;
  slug: string;
  publishedAt: string;
  tags: string[];
  coverLanded: boolean;
  imagesInBody: number;
  metaTitle: string;
  metaDescription: string;
  metaDescriptionFallback: boolean;
  metaDescriptionTruncated: boolean;
  warnings: string[];
}

function htmlToPlainText(html: string): string {
  const dom = new JSDOM(`<body>${html}</body>`, { virtualConsole: new VirtualConsole() });
  return (dom.window.document.body.textContent || "").replace(/\s+/g, " ").trim();
}

async function migratePost(wpId: number): Promise<{ report: PostReportRow; flags: DeontologyFlag[]; skipped: SkippedImage[] }> {
  const post = await fetchWpPost(wpId);
  await sleep(250);

  const title = htmlToPlainText(post.title.rendered);

  const { title: scrapedTitle, description: scrapedDescription } = await scrapeMetaTags(post.link);
  await sleep(250);

  let metaDescription = scrapedDescription;
  let metaDescriptionFallback = false;
  if (!metaDescription) {
    const plainExcerpt = htmlToPlainText(post.excerpt.rendered);
    metaDescription = plainExcerpt.slice(0, 160);
    metaDescriptionFallback = true;
  }
  const metaTitle = scrapedTitle || title;
  const metaDescriptionTruncated = isDescriptionTruncated(metaDescription);

  const skippedImages: SkippedImage[] = [];

  let coverLanded = false;
  let coverField: unknown = undefined;
  const media = await fetchWpMedia(post.featured_media);
  if (media) {
    try {
      const assetId = await uploadImageDeduped(media.url, media.url.split("/").pop() || "cover.jpg");
      coverField = { _type: "image", alt: media.alt, asset: { _type: "reference", _ref: assetId } };
      coverLanded = true;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      skippedImages.push({ wpId, slug: post.slug, role: "cover", url: media.url, reason });
    }
  }

  const { blocks, imagesFound, warnings, skippedImages: bodySkipped } = await htmlToPortableText(post.content.rendered, {
    wpId,
    slug: post.slug,
    articleTitle: title,
  });
  skippedImages.push(...bodySkipped);

  const tagNames: string[] = [];
  for (const tagId of post.tags) {
    tagNames.push(await fetchWpTagName(tagId));
    await sleep(120);
  }

  const excerptPlain = htmlToPlainText(post.excerpt.rendered);

  const bodyPlain = blocks
    .filter((b): b is TextBlock => b._type === "block")
    .map((b) => b.children.map((s) => s.text).join(""))
    .join(" ");
  const flags = scanDeontology(wpId, post.slug, `${title} ${bodyPlain}`);

  const docId = `article-${wpId}`;
  await client.createIfNotExists({ _id: docId, _type: "article", language: "it" });
  await client
    .patch(docId)
    .set({
      title,
      slug: { _type: "slug", current: post.slug },
      publishedAt: post.date,
      ...(coverField ? { cover: coverField } : {}),
      body: blocks,
      excerpt: excerptPlain,
      tags: tagNames,
      seo: { metaTitle, metaDescription, noIndex: false },
      language: "it",
    })
    .commit();

  return {
    report: {
      wpId,
      title,
      slug: post.slug,
      publishedAt: post.date,
      tags: tagNames,
      coverLanded,
      imagesInBody: imagesFound,
      metaTitle,
      metaDescription,
      metaDescriptionFallback,
      metaDescriptionTruncated,
      warnings,
    },
    flags,
    skipped: skippedImages,
  };
}

function writeJson(filename: string, data: unknown) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORTS_DIR, filename), JSON.stringify(data, null, 2), "utf8");
}

async function main() {
  console.log("Fetching full WordPress post id list...");
  const ids = await fetchAllWpPostIds();
  console.log(`Found ${ids.length} posts.`);

  const perPostReport: PostReportRow[] = [];
  const failures: { wpId: number; error: string }[] = [];
  const allFlags: DeontologyFlag[] = [];
  const allSkipped: SkippedImage[] = [];
  const generatedAltImages: { wpId: number; slug: string; alt: string }[] = [];
  const noTagsPosts: { wpId: number; slug: string }[] = [];
  const truncatedDescriptions: { wpId: number; slug: string; metaDescription: string }[] = [];

  let processed = 0;

  for (const id of ids) {
    processed += 1;
    console.log(`\n[${processed}/${ids.length}] Migrating WP post ${id}...`);
    try {
      const { report, flags, skipped } = await migratePost(id);
      perPostReport.push(report);
      allFlags.push(...flags);
      allSkipped.push(...skipped);
      if (report.tags.length === 0) noTagsPosts.push({ wpId: id, slug: report.slug });
      if (report.metaDescriptionTruncated) {
        truncatedDescriptions.push({ wpId: id, slug: report.slug, metaDescription: report.metaDescription });
      }
      console.log(
        `  OK — cover=${report.coverLanded} images=${report.imagesInBody} tags=${report.tags.length} flags=${flags.length}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push({ wpId: id, error: message });
      console.log(`  FAILED (post not written): ${message}`);
    }

    const failureRate = failures.length / processed;
    if (processed >= MIN_PROCESSED_BEFORE_CIRCUIT_BREAKER && failureRate > FAILURE_RATE_STOP_THRESHOLD) {
      console.log(
        `\nSTOPPING: failure rate ${(failureRate * 100).toFixed(1)}% exceeds ${FAILURE_RATE_STOP_THRESHOLD * 100}% after ${processed} posts.`,
      );
      break;
    }

    await sleep(400);
  }

  // Collect generated-alt images from what actually landed in Sanity —
  // re-derive from perPostReport isn't enough (alt isn't in that row), so
  // pull straight from the documents just written.
  for (const row of perPostReport) {
    const doc = await client.fetch(`*[_id == $id][0]{ "genAlt": body[_type == "image" && generatedAlt == true].alt }`, {
      id: `article-${row.wpId}`,
    });
    for (const alt of doc?.genAlt ?? []) {
      generatedAltImages.push({ wpId: row.wpId, slug: row.slug, alt });
    }
    await sleep(80);
  }

  writeJson("per-post-report.json", perPostReport);
  writeJson("failures.json", failures);
  writeJson("deontology-flags.json", allFlags);
  writeJson("skipped-images.json", allSkipped);
  writeJson("generated-alt-images.json", generatedAltImages);
  writeJson("posts-with-no-tags.json", noTagsPosts);
  writeJson("truncated-meta-descriptions.json", truncatedDescriptions);

  console.log("\n\n=== FINAL SUMMARY ===");
  console.log("Total WordPress posts:", ids.length);
  console.log("Processed:", processed);
  console.log("Written successfully:", perPostReport.length);
  console.log("Failed (not written):", failures.length);
  console.log("Deontology flags:", allFlags.length);
  console.log("Skipped images (cover+in-body):", allSkipped.length);
  console.log("In-body images with generated alt:", generatedAltImages.length);
  console.log("Posts with zero tags:", noTagsPosts.length);
  console.log("Truncated meta descriptions:", truncatedDescriptions.length);
  console.log("Distinct images uploaded (deduped by source URL):", imageAssetCache.size);
  console.log("Reports written to:", REPORTS_DIR);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
