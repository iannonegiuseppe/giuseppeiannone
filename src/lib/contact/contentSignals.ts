// Contact form hardening pass — flags only, never blocks (per spec: a
// false positive here must never cost a real visitor their message). Adds
// one extra line to the INTERNAL notification email only — never the
// visitor-facing confirmation, never surfaced in the form UI.

const LINK_RE = /https?:\/\/|www\.[a-z0-9-]+\.[a-z]{2,}/i;

// IT/EN visitors write in Latin script — these ranges cover the scripts
// most commonly seen in unsolicited-message spam (Cyrillic, Arabic,
// Hebrew, CJK Unified Ideographs, Hiragana+Katakana, Hangul syllables,
// Thai). Not exhaustive, not meant to be: a message in a script outside
// this list simply doesn't trip this one signal, which is fine for a
// flag, not a filter. Range boundaries as codepoints, for anyone
// checking this against the Unicode block chart: U+0400-04FF, U+0600-
// 06FF, U+0590-05FF, U+4E00-9FFF, U+3040-30FF, U+AC00-D7AF, U+0E00-0E7F.
const NON_LATIN_RE =
  /[Ѐ-ӿ؀-ۿ֐-׿一-鿿぀-ヿ가-힯฀-๿]/;

// A modest, curated list — not an attempt at an exhaustive spam-phrase
// filter (that's a losing arms race and not what was asked for). Matched
// as case-insensitive substrings.
const SPAM_PHRASES = [
  "seo services",
  "backlink",
  "guest post",
  "link building",
  "crypto investment",
  "bitcoin",
  "forex signals",
  "make money fast",
  "work from home opportunity",
  "click here",
  "buy now",
  "limited time offer",
  "viagra",
  "cialis",
  "casino",
  "loan approved",
  "weight loss",
  "increase your ranking",
  "web design services",
  "digital marketing services",
];

export interface SpamSignals {
  hasLink: boolean;
  hasNonLatinScript: boolean;
  spamPhrases: string[];
}

export function detectSpamSignals(text: string): SpamSignals {
  const lower = text.toLowerCase();
  return {
    hasLink: LINK_RE.test(text),
    hasNonLatinScript: NON_LATIN_RE.test(text),
    spamPhrases: SPAM_PHRASES.filter((phrase) => lower.includes(phrase)),
  };
}

// Returns null when nothing was flagged — a clean message gets no line at
// all, not a reassuring "no signals found" line nobody needs to read.
export function formatSpamSignalsLine(signals: SpamSignals): string | null {
  const parts: string[] = [];
  if (signals.hasLink) parts.push("contains a link");
  if (signals.hasNonLatinScript) parts.push("non-Latin script");
  if (signals.spamPhrases.length > 0) {
    parts.push(`spam phrasing ("${signals.spamPhrases.join('", "')}")`);
  }
  if (parts.length === 0) return null;
  return `Possible spam signals: ${parts.join(", ")}`;
}
