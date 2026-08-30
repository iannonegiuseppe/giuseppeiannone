// EN-slug folder for methodPath's own "/en/method" output — same
// dual-folder pattern as chi-sono/about-me, prezzi/pricing, contatti/
// contact (one literal folder per locale's translated slug; next-intl's
// routing here doesn't auto-translate path segments). Re-exports the real
// implementation wholesale rather than duplicating it: this route's
// content and behavior are locale-driven (the `locale` param), not
// folder-driven, so there is nothing route-specific left to write here.
export { generateMetadata, default } from "../metodo/page";
// Re-exported above, but `revalidate` itself is NOT — Next's segment-
// config extraction statically parses each route file's own top-level
// consts and does not follow cross-file re-exports, so this restates
// metodo/page.tsx's own value. See that file's own comment (in turn
// pointing to [locale]/page.tsx) for the full rationale.
export const revalidate = 1800;
