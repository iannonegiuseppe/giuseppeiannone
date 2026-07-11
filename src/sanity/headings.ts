export interface TocHeading {
  /** The block's own Portable Text _key — used to match this heading to
   * its rendered <h2>/<h3> element (see headingIdsByKey + portableTextComponents.tsx). */
  key: string;
  id: string;
  text: string;
  level: "h2" | "h3";
}

// Strips accents (à -> a, etc.) before slugifying, so Italian heading
// text produces clean, stable anchor ids regardless of locale.
function slugifyHeading(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface PortableTextBlock {
  _type?: string;
  _key?: string;
  style?: string;
  children?: { text?: string }[];
}

// Extracts H2/H3 headings from a Portable Text body — the single source
// for both the visible TOC (TableOfContents.tsx) and the anchor ids
// assigned to the actual rendered headings (portableTextComponents.tsx),
// so a jump-link can never point at an id that doesn't exist on the page.
export function extractHeadings(body: unknown): TocHeading[] {
  if (!Array.isArray(body)) return [];

  const seen = new Map<string, number>();
  const headings: TocHeading[] = [];

  for (const block of body as PortableTextBlock[]) {
    if (
      !block ||
      block._type !== "block" ||
      !block._key ||
      (block.style !== "h2" && block.style !== "h3")
    ) {
      continue;
    }

    const text = block.children?.map((span) => span.text ?? "").join("") ?? "";
    if (!text) continue;

    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;

    headings.push({ key: block._key, id, text, level: block.style });
  }

  return headings;
}

export function headingIdsByKey(headings: TocHeading[]): Map<string, string> {
  return new Map(headings.map((heading) => [heading.key, heading.id]));
}
