// Shared by TokenTable and ContrastTable. Reading a custom property's
// raw text via getComputedStyle().getPropertyValue() does NOT resolve
// var() chains between custom properties (e.g. --color-accent-contrast:
// var(--color-bg) comes back as the literal string "var(--color-bg)",
// not a hex) — custom properties are only substituted when consumed by
// a real CSS property. Routing every token through an actual property
// (background-color) on a probe element forces the browser to fully
// resolve it, so this works uniformly for plain-hex tokens and aliases
// alike, and reflects exactly what real elements render.
export function resolveTokenColor(probe: HTMLElement, varName: string): string {
  probe.style.backgroundColor = `var(${varName})`;
  const resolved = getComputedStyle(probe).backgroundColor;
  return rgbStringToHex(resolved);
}

function toHexChannel(n: number): string {
  return Math.round(n).toString(16).padStart(2, "0");
}

function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/[\d.]+/g);
  if (!match || match.length < 3) return rgb;
  const r = Number(match[0]);
  const g = Number(match[1]);
  const b = Number(match[2]);
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`.toUpperCase();
}

function hexChannel(hex: string, start: number): number {
  return parseInt(hex.slice(start, start + 2), 16);
}

function linearizeChannel(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

// Standard WCAG relative luminance (sRGB) — the same manual formula used
// throughout this project's own contrast verification passes.
function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = linearizeChannel(hexChannel(clean, 0));
  const g = linearizeChannel(hexChannel(clean, 2));
  const b = linearizeChannel(hexChannel(clean, 4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}
