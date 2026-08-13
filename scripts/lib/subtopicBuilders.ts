// Shared helpers for the anxiety/panic/sessuali/stress/relazioni/coppia/
// trauma subtopic batches. Mirrors the exact key convention observed live
// on subtopicPage-ansia-sociale-* (the very first subtopic template):
// block key "blk-N", its single span child "span-N+1", counter advancing
// by 2 per block; faqItem answers use the fixed "faq-answer-1"/
// "faq-answer-span-1" pair since each is a single-block document.

export interface Section {
  heading: string;
  paragraphs: string[];
}

export function buildBody(sections: Section[]) {
  const blocks: unknown[] = [];
  let counter = 1;
  for (const section of sections) {
    blocks.push({
      _key: `blk-${counter}`,
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: `span-${counter + 1}`, _type: "span", marks: [], text: section.heading }],
    });
    counter += 2;
    for (const p of section.paragraphs) {
      blocks.push({
        _key: `blk-${counter}`,
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [{ _key: `span-${counter + 1}`, _type: "span", marks: [], text: p }],
      });
      counter += 2;
    }
  }
  return blocks;
}

export function buildAnswer(text: string) {
  return [
    {
      _key: "faq-answer-1",
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: "faq-answer-span-1", _type: "span", marks: [], text }],
    },
  ];
}

export function faqItemDoc(id: string, language: "it" | "en", question: string, answerText: string) {
  return {
    _id: id,
    _type: "faqItem",
    language,
    question,
    answer: buildAnswer(answerText),
  };
}
