// EN-slug folder for libriPath's own "/en/books" output — same dual-folder
// pattern as chi-sono/about-me, prezzi/pricing, contatti/contact (one
// literal folder per locale's translated slug). Re-exports the real
// implementation wholesale — content and behavior are locale-driven (the
// `locale` param), not folder-driven.
export { generateMetadata, default } from "../libri/page";
