// Shared Portable Text block builders for the pillar rollout population
// scripts. Mirrors the exact structure already live on pillarPage-anxiety-*
// (h2 for every section heading, strong-mark spans for inline bold,
// plain paragraphs for the em-dash "quando ha senso chiedere aiuto"
// lines) — read directly from that document before writing this, not
// guessed.
let counter = 0;
function key(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

interface Span {
  _key: string;
  _type: "span";
  marks: string[];
  text: string;
}

export interface PTBlock {
  _key: string;
  _type: "block";
  style: string;
  markDefs: unknown[];
  children: Span[];
}

function span(text: string, marks: string[] = []): Span {
  return { _key: key("span"), _type: "span", marks, text };
}

export function h2(text: string): PTBlock {
  return { _key: key("blk"), _type: "block", style: "h2", markDefs: [], children: [span(text)] };
}

export function p(text: string): PTBlock {
  return { _key: key("blk"), _type: "block", style: "normal", markDefs: [], children: [span(text)] };
}

// Bold label at the start of the paragraph, e.g. "**Esaurimento.** Le energie..."
export function pBoldStart(boldText: string, restText: string): PTBlock {
  return {
    _key: key("blk"),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [span(boldText, ["strong"]), span(restText)],
  };
}

// Bold phrase in the middle of the sentence, e.g. "Il **trauma singolo** ha..."
export function pMidBold(before: string, bold: string, after: string): PTBlock {
  return {
    _key: key("blk"),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [span(before), span(bold, ["strong"]), span(after)],
  };
}
