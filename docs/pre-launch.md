# Pre-launch checklist

Temporary, preview-only, or demo-only items found self-documented in the
codebase (grep for "PREVIEW-GATE", "TEMPORARY", "HONESTY-RULE FLAG" to
re-find these as the code evolves). Each one names its own reversal — do
that, then delete the line here.

## Must fix before launch

- **Leaflet map attribution is hidden.** `src/app/[locale]/globals.scss`
  — `.leaflet-control-attribution { display: none !important; }`,
  commented `TEMPORARY — preview only`. Attribution is a licence
  requirement for the CARTO/OSM tiles the Locations map uses. Reversal:
  delete the rule.
- **9 standalone page routes are still placeholder stubs**, each
  rendering `PreviewPlaceholderPage` instead of real content: `/prezzi`,
  `/pricing`, `/faq`, `/contatti`, `/contact`, `/risorse`, `/resources`,
  `/privacy`, `/cookie-policy` (see `src/components/PreviewPlaceholderPage.tsx`'s
  own comment for the full list). Note these are the *dedicated* routes
  for these topics — the homepage's own FAQ/Contact/Resources
  *sections* are already real, un-gated content; only the standalone
  pages remain stubs. Reversal: delete each route folder once its real
  page is built (nothing else references the placeholder for it).
- **"Chi sono" header nav link scrolls to the homepage section instead
  of a dedicated route.** `src/components/headerNavItems.ts` —
  `PREVIEW_GATE_ANCHOR_OVERRIDES` — `/chi-sono` isn't built yet, so the
  nav link resolves to `#chi-sono` on the homepage instead. ("Metodo" is
  in the same map but is *not* part of this gate — that anchor behavior
  is permanent, not a placeholder — see the file's own comment.) Reversal:
  delete the `"chi-sono"` entry from that map once `/chi-sono` exists.
- **FormazioneBand and PricingSection homepage sections are gated**,
  commented out of `src/app/[locale]/page.tsx` (see that file's own
  PREVIEW-GATE comment at the top) — content/design decisions still
  pending on both. Reversal instructions are written inline in that
  comment block.
- **`previewHover` demo flag on the Aree section rows.** Schema field
  `src/sanity/schemaTypes/documents/areeSection.ts:39`, currently seeded
  `true` by `scripts/patch-aree-section.ts:112`. Makes non-linked area
  rows show a hover arrow they don't actually act on yet — disable once
  real `/aree/*` pages exist and rows are real links (see
  `AreeSection.tsx`'s own comment for the row-state logic this flag
  drives).
- **Resources: 3 hardcoded placeholder articles.**
  `src/components/ResourcesSection.tsx` — `FULL_MOCK_ARTICLES` (line 44),
  used whenever the CMS has 0 published `article` documents (currently
  always, per that file's own HONESTY-RULE FLAG comment). Reversal:
  publish real articles in Sanity; the component already prefers real
  data the moment any exists.
- **Resources: featured-image placeholder.** `src/components/FeaturedResource.tsx:42`
  — `hasImage = Boolean(article.image)`, always false today since the
  `article` schema has no image field yet, so the featured card always
  renders the greige placeholder frame (`.featuredImagePlaceholder`,
  line 66) instead of a real cover image. Reversal: add an image field
  to the `article` schema and populate it.
- **Re-gate `/design-lab` before launch.** `src/app/design-lab/page.tsx`,
  `src/app/design-lab/density/page.tsx`, `src/app/design-lab/density/en/page.tsx`
  — each had its `if (isProductionDeployment()) notFound()` gate removed
  (PREVIEW-GATE comment at each site), so the route is currently
  reachable on the real production URL — deliberately, so the client can
  review it there. noindex/nofollow stays on regardless (`resolveRobots(true)`,
  unconditional), and the route stays unlinked and out of the sitemap.
  Reversal: re-add the `isProductionDeployment()`/`notFound()` gate in
  all three files (see git history on these files for the exact block,
  or `/design-preview/taupe`'s own page.tsx for the same pattern still
  intact there).

## Found during this pass, needs reconciling (not fixed here — outside this task's scope)

- **EN gate: inconsistent state.** `src/app/[locale]/page.tsx:220`
  documents "EN GATE LIFTED" (the EN homepage now has real, translated
  content and the hardcoded IT redirect + hreflang suppression were
  removed there; `proxy.ts` confirms it — no gate logic remains there
  either). But `src/app/sitemap.ts:62` and `src/sanity/presentationLocations.ts:62,86`
  still carry comments and logic treating "the temporary EN gate" as
  active — the sitemap still excludes the EN homepage entirely, and
  presentationLocations still assumes it should redirect EN to IT. These
  three files were meant to be updated in lockstep (per page.tsx's own
  comment) but sitemap.ts/presentationLocations.ts appear to have been
  missed. Worth a dedicated pass to confirm and fix — flagging rather
  than changing, since it's outside what this pass was asked to do.

## Also worth knowing (not code gates, editorial/content work)

- Many CMS fields across the site still hold literal `[segnaposto]` /
  `[placeholder]` copy (phone/email in site settings, several intro
  paragraphs, etc.) — an editorial task in Sanity Studio, not a code
  change. Not enumerated here field-by-field; grep the live dataset or
  check Studio directly for the current count.
