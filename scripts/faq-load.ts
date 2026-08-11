import path from "node:path";
import { createClient } from "@sanity/client";
import { parseFaqMarkdown, type ParsedSection, type ParsedQuestion } from "./faq-load-parse";

const DRY_RUN = process.argv.includes("--dry-run");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

// --- Paragraph -> portable text blocks -------------------------------------
function paragraphsToBlocks(docId: string, paragraphs: string[]) {
  return paragraphs.map((text, i) => ({
    _key: `${docId}-answer-${i + 1}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${docId}-answer-${i + 1}-span`, _type: "span", marks: [], text }],
  }));
}

// --- ID mapping --------------------------------------------------------
interface MappedItem {
  question: ParsedQuestion;
  docId: string;
  isReuse: boolean; // true = existing costi-* doc, patch answer (and for EN, question) only
  reuseUpdateQuestion: boolean;
}

function buildItMapping(sections: ParsedSection[]): MappedItem[] {
  const result: MappedItem[] = [];
  for (const section of sections) {
    for (const q of section.questions) {
      if (q.idMarker && q.idMarker.startsWith("faqItem-costi-")) {
        result.push({ question: q, docId: `${q.idMarker}-it`, isReuse: true, reuseUpdateQuestion: false });
      } else {
        result.push({ question: q, docId: `faqItem-faq-it-${q.pagePosition}`, isReuse: false, reuseUpdateQuestion: false });
      }
    }
  }
  return result;
}

// EN has no id markers at all — the 3 costi-reuse slots are identified
// explicitly by their known page position within section 3 ("Fees, payment
// and insurance"): local index 0 -> costi-1, index 1 -> costi-2, index 3 ->
// costi-3 (index 2, "Can I claim it back on my insurance?", is the one
// genuinely new EN-only question in that section). Hardcoded, not fuzzy-
// matched — this is a verified, one-time exception the brief itself
// describes, not something to guess at.
function buildEnMapping(sections: ParsedSection[]): MappedItem[] {
  const result: MappedItem[] = [];
  // Renumber new EN docs sequentially by page position, skipping the 3 reuse slots.
  for (const section of sections) {
    section.questions.forEach((q, localIndex) => {
      const isFeesSection = section.title === "Fees, payment and insurance";
      if (isFeesSection && localIndex === 0) {
        result.push({ question: q, docId: "faqItem-costi-1-en", isReuse: true, reuseUpdateQuestion: true });
      } else if (isFeesSection && localIndex === 1) {
        result.push({ question: q, docId: "faqItem-costi-2-en", isReuse: true, reuseUpdateQuestion: true });
      } else if (isFeesSection && localIndex === 3) {
        result.push({ question: q, docId: "faqItem-costi-3-en", isReuse: true, reuseUpdateQuestion: true });
      } else {
        result.push({ question: q, docId: `faqItem-faq-en-${q.pagePosition}`, isReuse: false, reuseUpdateQuestion: false });
      }
    });
  }
  return result;
}

async function main() {
  const itPath = path.resolve(__dirname, "../contents/faq-it-completa.md");
  const enPath = path.resolve(__dirname, "../contents/faq-en-completa.md");
  const itSections = parseFaqMarkdown(itPath);
  const enSections = parseFaqMarkdown(enPath);

  const itMapping = buildItMapping(itSections);
  const enMapping = buildEnMapping(enSections);

  console.log(`IT: ${itMapping.length} questions (${itMapping.filter((m) => !m.isReuse).length} new, ${itMapping.filter((m) => m.isReuse).length} reused)`);
  console.log(`EN: ${enMapping.length} questions (${enMapping.filter((m) => !m.isReuse).length} new, ${enMapping.filter((m) => m.isReuse).length} reused)`);

  const writtenDocIds: string[] = [];

  async function writeFaqItem(m: MappedItem, language: "it" | "en") {
    const { docId, question, isReuse, reuseUpdateQuestion } = m;
    const blocks = paragraphsToBlocks(docId, question.paragraphs);
    const patchData: Record<string, unknown> = { answer: blocks };
    if (!isReuse) {
      patchData.question = question.question;
      patchData.language = language;
    } else if (reuseUpdateQuestion) {
      patchData.question = question.question;
    }

    console.log(
      `${isReuse ? "PATCH (reuse)" : "CREATE+PATCH (new)"} ${docId} | Q: "${question.question}" | ${question.paragraphs.length} paragraph(s)${reuseUpdateQuestion ? " [question text also updated]" : ""}`,
    );

    if (DRY_RUN) return;

    if (!isReuse) {
      await client.createIfNotExists({ _id: docId, _type: "faqItem" });
    }
    await client.patch(docId).set(patchData).commit();
    writtenDocIds.push(docId);
  }

  for (const m of itMapping) await writeFaqItem(m, "it");
  for (const m of enMapping) await writeFaqItem(m, "en");

  // --- Repoint faqPage-it sections -----------------------------------
  const itSectionKeys = [
    "primo-incontro", "costi-pagamenti", "online-sedi", "farmaci-medico",
    "ansia", "panico-agorafobia", "relazioni-coppia", "sessualita",
    "stress-burnout", "trauma",
  ];
  const itSectionPatch = itSections.map((s, i) => ({
    _key: itSectionKeys[i],
    items: s.questions.map((q, qi) => {
      const m = itMapping.find((x) => x.question === q)!;
      return { _key: `${itSectionKeys[i]}-item-${qi + 1}`, _type: "reference", _ref: m.docId };
    }),
  }));

  const enSectionPatch = enSections.map((s, i) => ({
    _key: itSectionKeys[i], // same 10 keys reused for EN, per existing structure
    title: s.title,
    description: s.description,
    items: s.questions.map((q, qi) => {
      const m = enMapping.find((x) => x.question === q)!;
      return { _key: `${itSectionKeys[i]}-item-${qi + 1}`, _type: "reference", _ref: m.docId };
    }),
  }));

  console.log("\n=== faqPage-it sections patch preview ===");
  console.log(JSON.stringify(itSectionPatch, null, 1).slice(0, 2000));
  console.log("\n=== faqPage-en sections patch preview ===");
  console.log(JSON.stringify(enSectionPatch, null, 1).slice(0, 2000));

  if (!DRY_RUN) {
    // Patch each section individually via its _key (sections[_key=="..."])
    // rather than replacing the whole sections array, so title/description
    // NOT covered by this patch (IT's) are never touched.
    for (const sp of itSectionPatch) {
      await client
        .patch("faqPage-it")
        .set({ [`sections[_key=="${sp._key}"].items`]: sp.items })
        .commit();
    }
    for (const sp of enSectionPatch) {
      await client
        .patch("faqPage-en")
        .set({
          [`sections[_key=="${sp._key}"].items`]: sp.items,
          [`sections[_key=="${sp._key}"].title`]: sp.title,
          [`sections[_key=="${sp._key}"].description`]: sp.description,
        })
        .commit();
    }
    console.log("\nfaqPage-it and faqPage-en sections repointed.");
  }

  console.log(`\n${DRY_RUN ? "[DRY RUN] Would write" : "Wrote"} ${writtenDocIds.length || itMapping.length + enMapping.length} faqItem documents.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
