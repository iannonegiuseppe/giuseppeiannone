// EN-slug folder for onlineTherapyPath's own
// "/en/online-therapy-italians-abroad" output — same dual-folder pattern
// as chi-sono/about-me, metodo/method. Re-exports the real implementation
// wholesale.
export { generateMetadata, default } from "../psicoterapia-online-italiani-estero/page";
// Re-exported above, but `revalidate` itself is NOT — Next's segment-
// config extraction statically parses each route file's own top-level
// consts and does not follow cross-file re-exports, so this restates
// psicoterapia-online-italiani-estero/page.tsx's own value. See that
// file's own comment (in turn pointing to [locale]/page.tsx) for the
// full rationale.
export const revalidate = 1800;
