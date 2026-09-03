// EN-slug folder for monzaPath's own "/en/psychologist-monza" output —
// same dual-folder pattern as chi-sono/about-me, metodo/method (see that
// pair's own comment). Re-exports the real implementation wholesale.
export { generateMetadata, default } from "../psicologo-monza/page";
// Re-exported above, but `revalidate` itself is NOT — Next's segment-
// config extraction statically parses each route file's own top-level
// consts and does not follow cross-file re-exports, so this restates
// psicologo-monza/page.tsx's own value. See that file's own comment (in
// turn pointing to [locale]/page.tsx) for the full rationale.
export const revalidate = 86400;
