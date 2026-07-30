import type { Metadata } from "next";
import { buildDesignLabMetadata, DesignLabHomepage } from "../DesignLabHomepage";

// Phase 2 default-theme switch: the light presentation moved here,
// unchanged in every token value, no longer primary. /design-lab itself
// is now the dark variant — see that route's own comment. Same gate as
// every other /design-lab route: hard production 404 removed for client
// review, noindex unconditional, unlinked, absent from sitemap.
export const metadata: Metadata = buildDesignLabMetadata(
  "Proposta homepage — variante chiara (interno)",
);

export default async function DesignLabHomepageLightMode() {
  return <DesignLabHomepage variant="light" />;
}
