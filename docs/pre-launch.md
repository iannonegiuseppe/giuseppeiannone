# Pre-launch checklist

Temporary, preview-only, or demo-only items found self-documented in the
codebase (grep for "PREVIEW-GATE", "TEMPORARY", "HONESTY-RULE FLAG" to
re-find these as the code evolves). Each one names its own reversal — do
that, then delete the line here.

## Must fix before launch

- **At launch: flip `seo.noIndex` off on exactly 6 documents** —
  `homePage-it`, `homePage-en`, `pillarPage-anxiety-it`,
  `pillarPage-anxiety-en`, `subtopicPage-panic-it`,
  `subtopicPage-panic-en`. Until then, the sitemap stays empty of them
  and each one keeps serving `noindex`. All 468 `article` documents are
  already `noIndex: false` (untouched, not gated) and are correctly
  included in the sitemap as of this pass.
  - **`siteSettings-it`/`-en` are ALSO `noIndex: true` — leave them.**
    Not part of the 6. Confirmed by reading `buildMetadata()`
    (`src/sanity/seo.ts`): it never reads `siteSeo.noIndex`, only each
    page's own `seo.noIndex`. The field is inert — flipping it does
    nothing, and NOT flipping it does nothing either. It can stay
    exactly as it is, at launch and after; don't spend time on it and
    don't mistake it for one of the 6 that actually matter.
  - **One-time cleanup, not a recurring trap:** the schema's `noIndex`
    field (`src/sanity/schemaTypes/objects/seo.ts`) has
    `initialValue: false` — confirmed by all 468 articles already being
    `false` with nobody having touched them individually. New documents
    are born indexable, not hidden; flipping the 6 above is a finite
    action.
  - **Reverse warning, same fact from the other side:** because nothing
    inherits the gate automatically, any NEW `pillarPage`/`subtopicPage`
    (or another `homePage`, unlikely as that is) created between now and
    launch will be born **indexable** — the opposite of gated. If
    pre-launch content like that gets added, someone has to set
    `noIndex: true` on it by hand, the same way it was apparently done
    for the original 6, or it goes live in search before it's meant to.
  - Reversal (the 6 real gates only): in Studio, open each document →
    SEO → turn off "Hide from search engines." Re-run/redeploy so the
    sitemap and each page's own `<meta name="robots">` pick it up.
    Delete this entry once done.

- **Profilo (Chi sono full-bleed rebuild) copy (homePage-it/-en) is
  DRAFT, not approved.** `scripts/patch-profilo-copy.ts` — new `profilo`
  field group (eyebrow, heading, headingEmphasisWord, three paragraphs).
  Deliberately separate from `chiSonoSection` (the real, live production
  singleton) — see `homePage.ts`'s own comment on `profilo` for why. Per
  the client's own explicit request, the personal-experience material
  (the Siena 2001 panic-attack paragraph, the Amsterdam/own-therapy
  paragraph, the old "Conosco l'ansia da vicino" heading) is dropped
  entirely — three professional-fact paragraphs only. §9-checked via the
  actual `deontologyCheck` validator for IT; EN checked by hand (EN
  paragraphs reuse `content.ts`'s own existing, already-drafted
  `paragraphsAfterPhoto` translations verbatim, not retranslated from
  scratch). Reversal: once Giuseppe reviews and approves (or rewrites)
  both languages, delete this line.
- **CTA bridge body copy (ctaBridgeSection-it/-en) is DRAFT, not
  approved.** `scripts/patch-cta-bridge-body.ts` — replaces the old
  `[segnaposto]`/`[placeholder]` body text. Title/titleEmphasis/linkLabel
  are unchanged. "Rispondo entro 24 ore" is a commitment the client
  explicitly confirmed he can keep. §9-checked via the actual
  `deontologyCheck` validator for IT; EN checked by hand. Reversal: once
  Giuseppe reviews and approves (or rewrites) both languages, delete this
  line.
- **Hero headline/description copy (homePage-it/-en) is DRAFT, not
  approved.** `scripts/patch-hero-copy-2.ts` — set via that script, not
  written in Studio by Giuseppe. It's real, finished-reading prose (name,
  credentials, disorders treated, method, locations, languages, first-
  contact process), not `[segnaposto]`-style placeholder text, because it
  was needed to judge Hero's actual line-count/layout against — but it
  has NOT been reviewed or signed off. Both `hero.headline` and
  `hero.positioningStatement`, IT and EN, need Giuseppe's approval (or
  rewrite) before this ships past `/design-lab`. Reversal: once approved,
  either accept as final in Studio or replace with his own wording —
  either way, delete this line once someone has actually looked at it.
- **Recognition/Hope/Welcome copy (homePage-it/-en) is DRAFT, not
  approved.** `scripts/patch-recognition-hope-welcome-copy.ts` — real,
  finished-reading prose in Giuseppe's voice, not `[segnaposto]`-style
  placeholders (needed to judge Recognition's actual composition against
  real-length copy, including a new sixth fragment), but not reviewed or
  signed off. Covers `recognition.kicker/heading/bridgeLine/fragments`,
  `hope.eyebrow/heading`, and the new `welcome.kicker/title/titleEmphasis/
  paragraph` field group (Welcome's copy was hardcoded in
  `density/content.ts` before this pass — now sourced from Sanity like
  every other section). §9-checked via the actual `deontologyCheck`
  validator for IT; EN checked by hand against the same categories (no
  automated EN check exists — pre-existing, disclosed gap). Reversal: once
  Giuseppe reviews and approves (or rewrites) both languages, delete this
  line.
- **Credentials band copy (homePage-it/-en) is DRAFT, not approved.**
  `scripts/patch-credentials-band.ts` — new `credentialsBand` field group
  (eyebrow, heading, the three counter captions, the languages caption).
  The three numbers (13 years clinical practice, 14 years training, 5
  locations including online) are established/verified facts, not drafted
  copy — only the surrounding wording is DRAFT. Was hardcoded in
  `density/content.ts`'s `CREDENTIALS` constant before this pass — now
  sourced from Sanity. §9-checked via the actual `deontologyCheck`
  validator for IT; EN checked by hand. Reversal: once Giuseppe reviews the
  eyebrow/heading/caption wording, delete this line.
- **Metodo copy (homePage-it/-en) is DRAFT, not approved.**
  `scripts/patch-metodo-copy.ts` — new `metodo` field group (kicker,
  heading, headingEmphasisWord, paragraph, the four step titles +
  descriptions). Deliberately separate from `percorso` (the real, live
  JourneySection's own field group) — see `homePage.ts`'s own comment on
  `metodo` for why reusing `percorso` directly wasn't safe. Step titles
  are the pre-existing wording, unchanged; only the four step descriptions
  are new copy replacing the old `[segnaposto]`/`[placeholder]` markers.
  §9-checked via the actual `deontologyCheck` validator for IT; EN checked
  by hand. Reversal: once Giuseppe reviews and approves (or rewrites) both
  languages, delete this line.
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
- **`previewHover` demo flag on Aree — now already inert, field itself
  still live.** Card-grid rebuild pass removed the prop from
  `AreeSection.tsx` entirely (it faked a hover/clickable affordance on
  non-interactive cards, which directly contradicted that pass's own
  accessibility requirement) — `AreeSectionData.previewHover` is still
  fetched by `areeSectionQuery` and still a real field
  (`src/sanity/schemaTypes/documents/areeSection.ts`), but nothing reads
  it anymore in either `AreeSection.tsx` caller (`page.tsx` or
  `DesignLabHomepage.tsx`). Reversal: once real `/aree/*` pages exist,
  remove the now-fully-dead `previewHover` field from the schema (and
  drop it from `areeSectionQuery`) — every area will be a real, working
  link by then anyway, so there's nothing left for it to demo.
- **Aree card descriptions (`area` documents, it/en) is DRAFT, not
  approved.** `scripts/patch-area-descriptions.ts` — real, finished
  one-sentence descriptions replacing the old `[segnaposto]`/
  `[placeholder]` descriptors, part of the card-grid rebuild (titles
  unchanged). §9-checked via the actual `deontologyCheck` validator for
  IT; EN checked by hand. Reversal: once Giuseppe reviews and approves (or
  rewrites) both languages, delete this line.
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
- **Re-gate `/design-lab` before launch.** `src/app/design-lab/page.tsx`
  (now the DARK/primary variant — see the Phase 2 default-theme switch,
  below), `src/app/design-lab/light-mode/page.tsx` (the parked light
  variant), `src/app/design-lab/density/page.tsx`,
  `src/app/design-lab/density/en/page.tsx`
  — each had its `if (isProductionDeployment()) notFound()` gate removed
  (PREVIEW-GATE comment at each site), so the route is currently
  reachable on the real production URL — deliberately, so the client can
  review it there. noindex/nofollow stays on regardless (`resolveRobots(true)`,
  unconditional), and the route stays unlinked and out of the sitemap.
  Reversal: re-add the `isProductionDeployment()`/`notFound()` gate in
  all four files (see git history on these files for the exact block,
  or `/design-preview/taupe`'s own page.tsx for the same pattern still
  intact there).
- **Phase 2 default-theme switch — decide before launch whether dark
  stays primary.** `/design-lab` now renders the DARK (Cyprus-derived)
  theme by default — the light presentation moved, unchanged, to
  `/design-lab/light-mode`. This was a deliberate internal-preview
  decision (see this pass's own report), not yet a decision about what
  ships to the real `/[locale]` site — the real site's own theme was NOT
  touched in this pass. Before launch: confirm which theme (or both, and
  how) the real site should use, and update `/[locale]` accordingly —
  this route pair is only the design-lab sandbox's own default.
- **Replace `public/interiors` stock with real per-location interiors.**
  `src/app/design-lab/DesignLabHomepage.tsx`'s `INTERIOR_STOCK_FALLBACK`
  map — the Locations marquee (slot 13) falls back to 4 generic stock
  photos (`public/interiors/interior-1.jpg` through `-4.jpg`; `-5.jpg` is
  spare/unused) whenever a `sede.addresses[]` entry has no `photo` set in
  Sanity — true for all of them right now. Once Giuseppe's real per-location
  interiors (Citylife / Bicocca / Monza / Cernusco) are uploaded to the
  corresponding Sanity `sede` documents, the marquee switches to them
  automatically (no code change) — at that point `INTERIOR_STOCK_FALLBACK`
  and the 5 files in `public/interiors/` are dead weight and safe to delete.
- **Delete `/design-lab/tone-swatch` before launch.** Temporary Phase-1
  proof route for the tonal-scale pass (`src/app/design-lab/tone-swatch/`)
  — a 3-tone × 2-theme swatch grid, kept live post-approval at the
  client's own request so the tonal scale could be compared directly
  against the applied page. Noindexed, unlinked from anywhere, but still
  a real reachable route — delete the whole `tone-swatch/` directory
  once it's no longer needed for comparison.

## Found during this pass, needs reconciling (not fixed here — outside this task's scope)

- **EN gate: partially reconciled.** `src/app/[locale]/page.tsx:220`
  documents "EN GATE LIFTED" (the EN homepage now has real, translated
  content and the hardcoded IT redirect + hreflang suppression were
  removed there; `proxy.ts` confirms it — no gate logic remains there
  either). `src/app/sitemap.ts` carried the same stale special case
  (excluded the EN homepage entirely) — **fixed in the sitemap pass**:
  the EN-specific `continue`/alternates carve-out is gone, homePage now
  emits both locales like every other type here (moot in practice right
  now since `homePage-{it,en}` both carry `seo.noIndex: true` regardless
  — see the noIndex entry below). `src/sanity/presentationLocations.ts:62,86`
  still carries the old assumption (EN should redirect to IT) — still
  unreconciled, still outside what either pass was asked to do. Worth a
  dedicated look.

## Intentionally parked — do not delete in a future cleanup

- **`src/app/design-lab/density/SediCards.tsx` + `sediCards.module.scss`,
  and `Lightbox.tsx` + `lightbox.module.scss`.** Not imported anywhere —
  confirmed via a repo-wide grep, not just `/design-lab` — so a routine
  dead-code sweep will flag both as unreachable. They aren't: this is the
  only implementation of the "Le sedi" location-cards block, built and
  then disconnected when that section came out of `/design-lab`. Giuseppe
  was attached to the idea and it may come back. Both files are untracked
  in git (never committed), so deleting them is unrecoverable — there's no
  history to restore from afterward. Keep parked until there's an explicit
  decision to either revive or discard the idea.

## Lessons

- **When a token's value or retoning changes, grep ALL its consumers and
  spot-check each — not just the ones the task was about.** Two edits in
  this project's Phase 2 dark-theme work each silently changed a consumer
  nobody was looking at: repointing `--color-bg`-derived values first
  broke, and later a follow-up fix to `--color-accent-contrast` broke a
  *second* time, VideoPlayer's control icon — a component neither task was
  about, discovered only because a later, unrelated audit happened to
  render it. A token is a shared contract; changing what it resolves to
  (or what retones it) affects every reader, not just the one the change
  was written for. Before calling a token edit done: grep the token name
  repo-wide, list every consumer, and check each one's actual rendered
  result — the same discipline already applied to contrast measurements
  themselves (real selectors, real sampled pixels, not assumptions) should
  apply to token blast-radius too.

## Also worth knowing (not code gates, editorial/content work)

- Many CMS fields across the site still hold literal `[segnaposto]` /
  `[placeholder]` copy (phone/email in site settings, several intro
  paragraphs, etc.) — an editorial task in Sanity Studio, not a code
  change. Not enumerated here field-by-field; grep the live dataset or
  check Studio directly for the current count.
