// EN-slug folder for libriPath's own "/en/books" output — same dual-folder
// pattern as chi-sono/about-me, prezzi/pricing, contatti/contact (one
// literal folder per locale's translated slug). Re-exports the real
// implementation wholesale — content and behavior are locale-driven (the
// `locale` param), not folder-driven.
export { generateMetadata, default } from "../libri/page";
// Re-exported above, but `revalidate` itself is NOT — Next's segment-
// config extraction statically parses each route file's own top-level
// consts and does not follow cross-file re-exports, so this restates
// libri/page.tsx's own value. See that file's own comment (in turn
// pointing to [locale]/page.tsx) for the full rationale.
export const revalidate = 86400;
