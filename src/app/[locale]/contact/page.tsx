// EN-slug folder for contactPath's own "/en/contact" output — same
// dual-folder pattern as chi-sono/about-me, prezzi/pricing (one literal
// folder per locale's translated slug; next-intl's routing here doesn't
// auto-translate path segments). Re-exports the real implementation
// wholesale rather than duplicating it: this route's content and
// behavior are locale-driven (the `locale` param), not folder-driven, so
// there is nothing route-specific left to write here.
export { generateMetadata, default } from "../contatti/page";
