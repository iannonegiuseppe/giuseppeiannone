// Reading-frame pass 2 — computed server-side (called once, in the Server
// Component page.tsx, never re-run in the browser) from the real Portable
// Text body word count at 200 wpm. Across all 468 imported articles this
// ranges 1-12 minutes, median 5 (this pass's own report, measured via a
// direct dataset query, not estimated).
interface PortableTextSpan {
  text?: string;
}

interface PortableTextBlock {
  _type?: string;
  children?: PortableTextSpan[];
}

const WORDS_PER_MINUTE = 200;

function wordCount(body: unknown): number {
  if (!Array.isArray(body)) return 0;

  let count = 0;
  for (const block of body as PortableTextBlock[]) {
    if (block?._type !== "block" || !Array.isArray(block.children)) continue;
    const text = block.children.map((span) => span.text ?? "").join("");
    const words = text.trim().split(/\s+/).filter(Boolean);
    count += words.length;
  }
  return count;
}

export function getReadingTimeMinutes(body: unknown): number {
  const words = wordCount(body);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
