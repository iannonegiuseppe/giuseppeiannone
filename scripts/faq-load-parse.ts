import fs from "node:fs";
import path from "node:path";

export interface ParsedQuestion {
  question: string;
  idMarker: string | null; // e.g. "faqItem-1" or null for NUOVO
  paragraphs: string[];
  sectionIndex: number; // 0-based
  pagePosition: number; // 1-based, across the whole file
}

export interface ParsedSection {
  index: number;
  title: string;
  description: string;
  questions: ParsedQuestion[];
}

export function parseFaqMarkdown(filePath: string): ParsedSection[] {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n");

  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let currentQuestion: ParsedQuestion | null = null;
  let paragraphBuffer: string[] = [];
  let globalPosition = 0;

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ").trim();
      if (text) currentQuestion?.paragraphs.push(text);
      paragraphBuffer = [];
    }
  }
  function flushQuestion() {
    flushParagraph();
    currentQuestion = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    const sectionMatch = line.match(/^## \d+ — (.+)$/);
    if (sectionMatch) {
      flushQuestion();
      currentSection = {
        index: sections.length,
        title: (sectionMatch[1] ?? "").trim(),
        description: "",
        questions: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Section description: the *italic* line immediately after a section header
    if (currentSection && currentSection.description === "" && currentSection.questions.length === 0) {
      const descMatch = line.match(/^\*(.+)\*$/);
      if (descMatch) {
        currentSection.description = (descMatch[1] ?? "").trim();
        continue;
      }
    }

    const questionMatch = line.match(/^### (.+?)(?: · (?:`([^`]+)`|NUOVO))?$/);
    if (questionMatch) {
      flushQuestion();
      if (!currentSection) throw new Error(`Question found before any section at line ${i + 1}`);
      globalPosition++;
      currentQuestion = {
        question: (questionMatch[1] ?? "").trim(),
        idMarker: questionMatch[2] ?? null,
        paragraphs: [],
        sectionIndex: currentSection.index,
        pagePosition: globalPosition,
      };
      currentSection.questions.push(currentQuestion);
      continue;
    }

    if (line.trim() === "---" || line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Legend/heading lines before the first section — ignore.
    if (!currentSection) continue;

    // Otherwise: a content line, part of the current paragraph.
    paragraphBuffer.push(line.trim());
  }
  flushQuestion();

  return sections;
}

if (require.main === module) {
  const itPath = path.resolve(__dirname, "../contents/faq-it-completa.md");
  const enPath = path.resolve(__dirname, "../contents/faq-en-completa.md");
  const it = parseFaqMarkdown(itPath);
  const en = parseFaqMarkdown(enPath);

  function summarize(sections: ParsedSection[], label: string) {
    console.log(`\n=== ${label} ===`);
    let total = 0;
    for (const s of sections) {
      console.log(`${s.index + 1}. "${s.title}" (${s.questions.length}) — desc: "${s.description}"`);
      total += s.questions.length;
      for (const q of s.questions) {
        console.log(
          `   pos ${q.pagePosition}: [${q.idMarker ?? "NUOVO"}] "${q.question}" (${q.paragraphs.length} paragraph(s))`,
        );
      }
    }
    console.log(`TOTAL: ${total}`);
  }
  summarize(it, "IT");
  summarize(en, "EN");
}
