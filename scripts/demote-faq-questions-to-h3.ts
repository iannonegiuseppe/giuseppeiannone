import { createClient } from "@sanity/client";

// Blog TOC pass — demotes FAQ question headings from h2 to h3 so they stop
// appearing in the article TOC (which is built from h2 only). Only the
// question headings under an "FAQ"/"Domande frequenti" label are touched —
// never the label itself, never any other h2 in the article. Idempotent:
// once a question is h3, it no longer matches the h2-based detection below,
// so re-running this script is a no-op for articles already fixed.
// patch.set only, keyed on each block's own _key — never createOrReplace.
//
// Dry-run by default. Pass --write to actually apply the patches; without
// it, this only reports what WOULD change.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const FAQ_LABEL_PATTERN = /^(faq|domande frequenti)/i;

interface PortableTextSpan {
  text?: string;
}
interface PortableTextBlock {
  _key: string;
  _type: string;
  style?: string;
  children?: PortableTextSpan[];
}

interface ArticleDoc {
  _id: string;
  slug: string;
  body: PortableTextBlock[];
}

function blockText(block: PortableTextBlock): string {
  return (block.children ?? []).map((c) => c.text ?? "").join("");
}

// Finds every FAQ-question h2 in a body: an h2 matching FAQ_LABEL_PATTERN,
// followed by consecutive (h2 question, normal answer) pairs. Stops at the
// first block that doesn't fit — matches exactly the pattern confirmed by
// direct inspection in the earlier report (5 articles use this shape; the
// other 6 already use h3 for questions and are untouched by this script,
// since their questions never match style=="h2" here).
//
// Real bug caught by the dry run itself, not assumed: one article
// (coppie-lontane-da-casa-e-rischio-solitudine) has a genuine closing
// section heading ("Messaggio chiave") immediately after its last real
// FAQ question, which happens to ALSO be h2-immediately-followed-by-
// normal — a coincidental structural match, not a question. Every real
// FAQ question in all 5 articles ends in "?"; "Messaggio chiave" doesn't.
// Added that as an explicit stop condition rather than trusting the
// structural pattern alone.
function findFaqQuestionKeys(body: PortableTextBlock[]): { key: string; text: string }[] {
  const found: { key: string; text: string }[] = [];
  const labelIdx = body.findIndex(
    (b) => b._type === "block" && b.style === "h2" && FAQ_LABEL_PATTERN.test(blockText(b).trim()),
  );
  if (labelIdx === -1) return found;

  let i = labelIdx + 1;
  while (i < body.length - 1) {
    const q = body[i];
    const a = body[i + 1];
    if (!q || !a) break;
    const text = blockText(q).trim();
    if (
      q._type === "block" &&
      q.style === "h2" &&
      a._type === "block" &&
      a.style === "normal" &&
      text.endsWith("?")
    ) {
      found.push({ key: q._key, text });
      i += 2;
    } else {
      break;
    }
  }
  return found;
}

async function main() {
  const write = process.argv.includes("--write");

  const articles = await client.fetch<ArticleDoc[]>(
    `*[_type == "article"]{ _id, "slug": slug.current, body }`,
  );

  const plan: { id: string; slug: string; questions: { key: string; text: string }[] }[] = [];
  for (const article of articles) {
    const questions = findFaqQuestionKeys(article.body ?? []);
    if (questions.length > 0) {
      plan.push({ id: article._id, slug: article.slug, questions });
    }
  }

  console.log(`=== FAQ h2-question demotion — ${write ? "WRITE" : "DRY RUN"} ===`);
  console.log(`Articles with h2-level FAQ questions to demote: ${plan.length}\n`);

  let totalQuestions = 0;
  for (const item of plan) {
    console.log(`${item.slug} (${item.id}) — ${item.questions.length} question(s):`);
    for (const q of item.questions) {
      console.log(`  [${q.key}] "${q.text}"`);
    }
    totalQuestions += item.questions.length;
    console.log("");
  }
  console.log(`Total questions to demote: ${totalQuestions}`);

  if (!write) {
    console.log("\nDry run only — no writes made. Re-run with --write to apply.");
    return;
  }

  console.log("\nApplying patches...");
  let patched = 0;
  for (const item of plan) {
    const patch = client.patch(item.id);
    for (const q of item.questions) {
      patch.set({ [`body[_key=="${q.key}"].style`]: "h3" });
    }
    await patch.commit();
    patched++;
    console.log(`  patched ${item.slug} (${item.questions.length} heading(s))`);
  }
  console.log(`\nDone. ${patched} article(s) patched, ${totalQuestions} heading(s) demoted.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
