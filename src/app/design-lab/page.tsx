import type { Metadata } from "next";
import { buildDesignLabMetadata, DesignLabHomepage } from "./DesignLabHomepage";

// Assembled proposed homepage — DARK variant, now the PRIMARY route (Phase
// 2 default-theme switch: Cyprus's own model is dark-as-:root-default, and
// this route now matches it). The light presentation still exists,
// unchanged, parked at /design-lab/light-mode — see that route's own
// comment. Gated identically to /design-lab/density: hard 404 in
// production, noindex as a redundant second layer, unlinked, absent from
// sitemap. Italian only — no /en variant (this pass's own "Italian only,
// no i18n" constraint).
export const metadata: Metadata = buildDesignLabMetadata("Proposta homepage — anteprima (interno)");

// PREVIEW-GATE (temporary) — this route's hard production 404 (`if
// (isProductionDeployment()) notFound()`) is deliberately REMOVED here so
// the client can review this page at its real production URL — noindex
// (metadata.robots above, unconditional, not environment-driven) still
// applies, so it stays unindexed and unlinked either way. Reversal:
// re-add the isProductionDeployment()/notFound() gate (see
// /design-lab/density's own page.tsx, .../density/en/page.tsx, or git
// history on this file, for the exact block) once client review is done —
// flagged in docs/pre-launch.md.
export default async function DesignLabHomepageDark() {
  return <DesignLabHomepage variant="dark" />;
}
