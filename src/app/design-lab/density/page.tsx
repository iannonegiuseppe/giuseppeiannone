import type { Metadata } from "next";
import { resolveRobots } from "@/sanity/metadata";
import { DensityPage } from "./DensityPage";

// Was gated exactly like /design-preview/taupe and /styleguide: hard 404
// in production, noindex as a redundant second layer. PREVIEW-GATE
// (temporary) — the production 404 is deliberately REMOVED here (see
// ../page.tsx's own comment on DesignLabHomepage for the full reasoning)
// so the client can review this page at its real production URL — noindex
// (resolveRobots(true), unconditional) still applies. Not linked from any
// navigation, not in the sitemap. Reversal: re-add the
// isProductionDeployment()/notFound() gate, flagged in docs/pre-launch.md.
export const metadata: Metadata = {
  title: "Density direction — preview (internal)",
  robots: resolveRobots(true),
};

export default function DensityPreviewPageIt() {
  return <DensityPage locale="it" />;
}
