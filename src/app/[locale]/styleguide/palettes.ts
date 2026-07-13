// Stage 3.5 groundwork — shared between the server-rendered page (resolves
// the initial palette from the URL, no client/hydration flash) and the
// client-side switcher (keeps the same four options/labels in sync).

export type Palette = "terracotta" | "plum" | "olive" | "bronze";

export const DEFAULT_PALETTE: Palette = "terracotta";

export const PALETTES: { value: Palette; label: string }[] = [
  { value: "terracotta", label: "Terracotta" },
  { value: "plum", label: "Plum" },
  { value: "olive", label: "Oliva" },
  { value: "bronze", label: "Bronzo" },
];

export function isPalette(value: string | undefined): value is Palette {
  return (
    value === "terracotta" ||
    value === "plum" ||
    value === "olive" ||
    value === "bronze"
  );
}
