# Pre-launch checklist

Rebuilt from the code and the data as they actually are (not patched from the
previous version — that one had drifted too far from reality to trust). Each
entry names what it's based on: a file, a live query, or a specific commit.
Re-verify anything older than a few weeks before relying on it — code and
content both move.

## 1. Blocks launch

Things that must be done before the domain switches.

- **`seo.noIndex` is `true` on 79 documents right now, not a fixed small
  number.** Live count via `*[seo.noIndex == true]`, by type:
  `pillarPage` 14 (all 7, both locales), `subtopicPage` 42 (all 21, both
  locales), `article` 5, `homePage` 2, `chiSonoSection` 2, `contactPage` 2,
  `cookiePolicyPage` 2, `faqPage` 2, `methodPage` 2, `pricePage` 2,
  `privacyPage` 2, `siteSettings` 2. Every real, built page on the site is
  currently noindexed — this isn't a short list to flip, it's "turn
  indexing on" as a real launch step. `siteSettings-it`/`-en` don't need
  touching: `buildMetadata()` never reads `siteSeo.noIndex`, only each
  page's own `seo.noIndex` — flipping it does nothing either way.
  - **The 5 `article` noIndex docs are the five new English articles
    added this session** (`perche-sono-impulsivo`, `quando-una-relazione-
    diventa-tossica`, `perche-ho-sempre-bisogno-di-conferme`, `isteria-o-
    borderline`, `coppie-lontane-da-casa-e-rischio-solitudine`) — they're
    the only 5 noindexed articles out of 473. Real, finished, working
    content that's currently invisible to search by omission, not by
    design — easy to miss since nothing else about them looks unfinished.
  - Reversal: in Studio, SEO → turn off "Hide from search engines" on
    each, or a scripted batch unset. Re-deploy so the sitemap and each
    page's own `<meta name="robots">` pick it up.

- **Privacy policy has 2 confirmed `[DA CONFERMARE — ...]` placeholders**,
  both awaiting Giuseppe: §1 "Sede: `[DA CONFERMARE — sede legale]`", §9
  "puoi scrivere a `[DA CONFERMARE — email diritti]`". Checked the full
  body text of `privacyPage-it` and `cookiePolicyPage-it` for any bracket
  pattern — these are the only two; cookie policy has none.

- **No consent banner, no script blocking — must exist before any
  analytics is connected, not after.** Checked the codebase for GA/GTM/
  Meta Pixel/Clarity script tags and for any cookie-consent component:
  none exist yet, anywhere. The privacy policy (§6) already documents
  Google Analytics/Tag Manager/Ads, Microsoft Clarity/Bing Webmaster,
  and Meta Pixel as "used only with consent" — so the policy is ahead of
  the code here. Not urgent today (nothing is tracking yet), but wiring
  any of those scripts before the consent gate exists would make the
  policy false the moment it happens.

- **Disavow file for the 84 junk backlink domains — not created.**
  Checked the repo for any `disavow*` file: none. (The 84-domain figure
  itself comes from an external backlink audit, not something checkable
  from this codebase — noted here as reported, not independently
  verified.) Needed before the domain switches so the junk backlink
  profile doesn't attach to the live domain from day one.

- **`NEXT_LOCALE` cookie — decided to disable, not implemented.** Checked
  the codebase for any reference: none (`next-intl`'s default behavior is
  untouched). Whatever code change the disable decision requires hasn't
  been written yet.

- **Giuseppe owes:** studio photographs (blocks the location pages below,
  and the `public/interiors` stock-photo swap already tracked in
  §2), and the WordPress user list (needed to finish reconciling the
  migrated article corpus's authorship).

## 2. Should fix before launch

Real defects, not launch-blocking.

- **`/design-lab` and `/design-preview` — awaiting a decision: re-gate or
  delete, not settled as re-gate.** 15 `page.tsx` routes total (14 under
  `src/app/design-lab/`, 1 under `src/app/design-preview/taupe/`) are
  still reachable on the production URL — deliberately, so Giuseppe can
  review them there; each has `noindex, nofollow` regardless, and none
  are linked or in the sitemap, so leaving them up costs nothing in
  search visibility either way.
  - **Case for deleting:** `prezzi-proposals` (a-ledger, b-percorso,
    c-editoriale) and `contatti-proposals` (a-canali, b-mappa,
    c-editoriale) were A/B/C mockups for pages that are now real —
    confirmed live: `/prezzi` and `/contatti` both exist and render real
    Sanity-driven content. Those 6+ routes are spent comparisons, not
    ongoing references.
  - **Case for re-gating instead:** `tone-swatch` was previously kept
    live post-approval specifically "at the client's own request so the
    tonal scale could be compared directly against the applied page" —
    an ongoing reference tool, not a spent mockup, unless that request
    has since lapsed. `/design-lab` itself, `density`/`density/en`, and
    `light-mode` are the homepage's own design sandbox, not a proposal
    comparison for an already-built page — deleting those forecloses
    being able to preview a homepage change in place before it ships.
  - **The dark/light default split (`/design-lab` renders dark,
    `/design-lab/light-mode` holds the light variant) is purely a
    design-lab-internal question, not a real-site one — confirmed by
    reading `[locale]/layout.tsx`: `data-theme="dark"` is a static,
    unconditional SSR'd attribute there, and the comment above it says
    outright this was "never actually conditional in production."** The
    real site's theme isn't an open question; only design-lab's own
    default is.
  - Reversal if re-gated: re-add the `isProductionDeployment()` gate each
    route had removed (see git history on these files for the exact
    block, or `/design-preview/taupe`'s own `page.tsx` for the same
    pattern still intact there).

- **FormazioneBand and PricingSection are still gated on the homepage.**
  Confirmed in `src/app/[locale]/page.tsx`: both imports are commented
  out (lines 87–88), the `<FormazioneBand>` JSX block is fully commented
  (lines 684–697), and no `<PricingSection>` JSX exists anywhere, active
  or commented. Both components still exist on disk, unimported. **Don't
  confuse this with "Tariffe"** — the homepage already has a separate,
  live pricing section (`PricingBlock`, driven by `homePage.tariffe`,
  rendered right below where the gated block would sit) that looks
  similar but is an explicitly different field/component; the file's own
  comment flags the distinction, but it's easy to misread from outside
  the code.

- **Three anomalies in the article corpus, found via a full-text sweep
  of all IT article bodies:**
  - `e-normale-controllare-tutto-mille-volte` — one link points to
    `https://claude.ai/chat/06f975ff-dc63-4737-8022-fb58dddc74b3#contatti`
    — a leaked AI chat-session URL, not a real citation.
  - `fumare-aiuta-a-gestire-lansia` — 10 links to
    `instagram.com/explore/tags/*` (fumo, sigaretta, paura, nicotina,
    psicoterapia, respirare, calcio, cervello, cuore, polmoni) — a
    hashtag-stuffing artifact, not real Instagram content.
  - `cose-un-disturbo-di-personalita` — 12 separate body blocks, six
    pairs of a `"PrecSucc"` block immediately followed by a `"123"`
    block — a WordPress pagination widget ("Precedente / Successivo",
    "1 2 3 …") that got flattened into plain text during migration, once
    per page break.

- **`come-si-cura-il-panico` has a "see this page" sentence promising a
  link that no longer exists — known cause, not a mystery to solve.**
  "Per maggiori informazioni sull'argomento è possibile consultare
  questa pagina." — the phrase "questa pagina" carries no link
  (`marks: []`, empty `markDefs`). The link was removed this session as
  part of the `systemamilano.it` cleanup (§5): its target was one of the
  outbound links belonging to that scheme, not a legitimate citation.
  **Whoever picks this up should delete the sentence, not go looking for
  a URL to restore** — there is no correct link to put back, the page it
  pointed to was never a real citation in the first place.

- **`ansia-sessuale` (subtopic) has no hero image.** Confirmed:
  `heroImage` is unset on `subtopicPage-ansia-sessuale-it`.

- **`SectionKicker`'s decorative rule fails non-text contrast sitewide.**
  In the dark theme, `.rule`'s `background: var(--color-line)` resolves
  to `hsla(42, 38%, 90%, 0.16)` over `--color-bg: #081512` — computed
  from those exact token values, this comes out to roughly 1.3–1.5:1,
  far under the WCAG 3:1 non-text floor. The element is `aria-hidden` and
  `pointer-events: none` (coded as purely decorative), which may exempt
  it from 1.4.11 outright — but if the rule is meant to read as a visible
  design element (its whole purpose), the contrast is real regardless of
  the ARIA treatment. Worth a decision either way, not just a shrug.

- **`src/sanity/presentationLocations.ts:62,86` still assumes EN redirects
  to IT.** Found during the sitemap/EN-gate work: the homepage's own EN
  gate is gone and the sitemap's EN carve-out is fixed, but this file
  (Studio's Presentation tool location resolver) never got the same
  update. Low impact — affects only the Studio editing UI, not the live
  site — but still a real stale assumption.

- **Dead Sanity fields and orphaned schema types — partial list, not a
  full schema audit:**
  - `homePage.diCosa` (`src/sanity/schemaTypes/documents/homePage.ts:227`)
    — `hidden: true`, comment confirms "nothing reads this field group,"
    superseded by `homePage.aree`. Data untouched, safe to remove
    whenever someone wants to.
  - `AreeSectionData.previewHover` — still fetched by `areeSectionQuery`,
    still a real schema field, read by nothing (carried forward from the
    card-grid rebuild pass). Reversal already recorded in that pass's own
    comment: remove once real `/aree/*` pages exist.
  - `areeSection` document type — its own schema comment marks it
    DEPRECATED in favor of `homePage.aree`, but `areeSectionQuery` is
    still actually fetched — by `src/app/design-lab/DesignLabHomepage.tsx`
    only, not by the production homepage. Not fully dead, just
    production-orphaned.
  - `area` document type is Studio-hidden (`hidden: () => true`, can't
    create new ones) but NOT dead data — its 6 existing documents are
    still the live source for `homePage.aree`'s grid rows. Don't delete
    these; "hidden in Studio" and "orphaned" are different things here.
  - This is what turned up while chasing specific other findings, not a
    dedicated sweep of all 28 document schema files — a real audit would
    likely find more.

## 3. Content debt

Corpus-wide problems needing a pass through the articles, not one-off fixes.

- **468 Italian articles (plus the 5 new English ones) carry no link to
  any of the six intervention areas.** The `article` schema
  (`src/sanity/schemaTypes/documents/article.ts`) has no relational field
  to the `area` type at all — only free-form `tags` (WordPress's own ~86
  tags, imported wholesale). The six areas exist as real data
  (`homePage.aree` grid, backed by 6 `area` documents) but nothing
  connects an article to one.

- **316 of 463 non-paired Italian articles (two-thirds of the corpus)
  have empty cover alt text — an accessibility problem, not a
  content-polish item, on a site whose entire subject is health.** Live
  count via `cover.alt` on every IT article outside the 5 EN-paired ones.
  A screen-reader user gets nothing at all on two out of every three
  article covers site-wide. A generic-text heuristic (alt starting with
  "image/img/photo/foto/placeholder/screenshot/…") found zero additional
  matches among the remaining 147 — but that heuristic can't catch alt
  text that's present and plausible-looking yet still wrong (describes
  the wrong subject, is copy-pasted across unrelated photos, etc.);
  confirming those needs an actual read, not a query.

- **34 headings longer than 120 characters, across 26 articles — a
  WordPress-migration artifact, not a code bug.** Paragraphs that became
  `h2`/`h3` during import. They corrupt the heading outline for search
  engines and fill both the desktop and mobile tables of contents with
  paragraph-length entries. Worst cases: `come-resistere-alle-tentazioni`
  (344 chars, `h3`, second-to-last block in the body — a paragraph
  continuing the article's own Ulysses metaphor into the next block, not
  a real section break), and `le-6-cause-della-claustrofobia`, where the
  same call-to-action paragraph ("Se soffri di sintomi di
  claustrofobia...") is tagged `h3` three separate times. Handle together
  with the categorisation task above — both require going through the
  same corpus, no reason to do it twice.

  All 34, slug — chars — level (Italian corpus only; the 5 English
  articles don't have this problem):
  - `come-resistere-alle-tentazioni` — 344 — h3
  - `le-6-cause-della-claustrofobia` — 300 — h3
  - `come-affrontare-il-ghosting` — 269 — h2 (block 0 — an intro
    paragraph as the article's first block, not the other 33's
    mid-body pattern)
  - `perche-mi-sento-in-ansia-senza-un-motivo` — 200 — h3
  - `le-6-cause-della-claustrofobia` — 200 — h3
  - `le-6-cause-della-claustrofobia` — 200 — h3
  - `le-6-cause-della-claustrofobia` — 198 — h3
  - `le-6-cause-della-claustrofobia` — 198 — h3
  - `la-fame-e-le-emozioni` — 197 — h3
  - `il-disturbo-dansia-generalizzata` — 194 — h3
  - `come-curare-la-depressione` — 178 — h3
  - `dipendenza-da-sesso-e-da-porno` — 176 — h3
  - `come-curare-la-depressione` — 172 — h3
  - `eiaculazione-precoce-e-ritardata` — 170 — h3
  - `il-disturbo-dansia-generalizzata` — 163 — h3
  - `uomini-e-salute-mentale` — 162 — h3
  - `come-imparare-a-non-ferire-chi-amiamo` — 156 — h3
  - `le-conseguenze-psicologiche-del-coronavirus` — 155 — h3
  - `le-6-cause-della-claustrofobia` — 154 — h3
  - `come-curare-la-depressione` — 139 — h3
  - `come-lansia-influisce-sul-sesso` — 133 — h3
  - `ipocondria-il-male-reale-del-malato-immaginario` — 133 — h3
  - `ex-militare-perche-mi-scatta-il-panico-in-situazioni-normali` — 132 — h3
  - `benzodiazepine-per-il-panico-si-o-no` — 131 — h3
  - `attacco-di-panico-cosa-fare` — 129 — h3
  - `assenza-orgasmo-cosa-fare` — 129 — h3
  - `agorafobia-claustrofobia-due-facce-stessa-medaglia` — 128 — h3
  - `come-si-cura-il-panico` — 127 — h3
  - `panico-o-ipocondria` — 126 — h3
  - `il-disturbo-dansia-generalizzata` — 126 — h3
  - `come-controllare-la-rabbia` — 125 — h3
  - `la-fame-e-le-emozioni` — 124 — h3
  - `dipendenza-da-sesso-e-da-porno` — 123 — h3
  - `il-disturbo-paranoide-di-personalita` — 121 — h3

- **`article-5049` and `article-5122` are a 94.2% duplicate pair.** Same
  title, "In quante sedute di psicoterapia starò meglio?" — slugs
  `in-quante-sedute-di-psicoterapia-staro-meglio` and
  `in-quante-sedute-di-psicoterapia-staro-meglio-2` (the `-2` suffix is
  the tell: a WordPress double-publish, not a deliberate follow-up
  piece). Measured via longest-common-subsequence ratio over the full
  body text (5,278 vs. 5,744 characters): 94.2% identical. Two URLs
  competing for the same query, one of them needs to redirect to the
  other — likely not the only such pair in a 468-article corpus this
  size, just the one found so far.

- **58 duplicate FAQ question strings across URLs.** Live count across
  all 295 `faqItem` documents: 58 distinct question strings appear more
  than once (139 total duplicate occurrences). Same question asked
  verbatim on more than one page reads as thin/duplicated content to
  search engines even when the answer differs by context.

- **Many CMS fields across the site still hold literal `[segnaposto]` /
  `[placeholder]` copy** (phone/email in site settings, several intro
  paragraphs, etc.) — an editorial task in Sanity Studio, not a code
  change. Not enumerated field-by-field here; grep the live dataset or
  check Studio directly for the current count.

## 4. Deliberately deferred

Decisions already taken — recorded so nobody re-opens them.

- **Location pages — deferred pending studio photographs.** Zero
  `locationPage` documents exist yet (confirmed live: `locIt: 0, locEn:
  0`). Waiting on Giuseppe's real photos of the Milan/Monza studios
  (see §1) before these get built at all.

- **`src/app/design-lab/density/SediCards.tsx` + `sediCards.module.scss`,
  and `Lightbox.tsx` + `lightbox.module.scss` — kept, not imported
  anywhere.** Confirmed via a repo-wide grep, not just `/design-lab` — a
  routine dead-code sweep will flag both as unreachable. They aren't
  meant to be deleted: this is the only implementation of the "Le sedi"
  location-cards block, built and then disconnected when that section
  came out of `/design-lab`. Giuseppe was attached to the idea and it may
  come back. Both files are untracked in git (never committed) — deleting
  them would be unrecoverable, no history to restore from. Keep parked
  until there's an explicit decision to revive or discard.

- **`public/interiors` stock photography is a deliberate placeholder,
  not a bug.** `src/app/design-lab/DesignLabHomepage.tsx`'s
  `INTERIOR_STOCK_FALLBACK` map — the Locations marquee falls back to 4
  generic stock photos whenever a `sede.addresses[]` entry has no
  `photo` set in Sanity, true for all of them right now. Switches to
  Giuseppe's real per-location interiors automatically, no code change,
  once those are uploaded (see §1 — same photograph dependency as the
  location pages above).

- **`AreeSectionData.previewHover` stays in the schema, unread, on
  purpose.** See §2's own entry — kept until real `/aree/*` pages exist
  to make the flag meaningful again, not deleted now.

## 5. Resolved this session

Terse and true, sourced from `git log` on `dev` — commits `e82b6fe`
through `f8a4614` (Aug 11–14, 2026) — plus a few Sanity-content changes
that never touched a repo file, so they don't show up in git at all;
called out separately below.

**Landed as commits:**

- Rebuilt Chi sono, Prezzi, FAQ, and the Blog listing/article pages as
  real, shared-UI-kit-based content (`e82b6fe`).
- Built real Contatti and Metodo pages (`21ef55e`).
- Fixed the contact form: split the merged email/phone field, merged the
  two duplicate form components into one (`70cd325`).
- Deleted `FinalContactSection` (zero importers); moved the
  `.pendingReveal`/`.revealed` classes `RevealOnScroll.tsx` actually
  depends on into their own module, out of the file that no longer
  exists (`f672bf5`).
- Added real Privacy and Cookie Policy pages (`bef7d09`).
- Added subtopic content-creation scripts (`05f1b7c`).
- Wired real locale switching and hreflang for articles and subtopics —
  same-slug pairing for articles, parent-pillar-aware fallback for
  subtopics with no counterpart, instead of always landing on the
  homepage (`d85d6e7`).
- Removed `ResourcesLab`'s mock-article fallback (`bb21078`).
- Deleted the now-fully-dead `ResourcesSection`/`ResourceColumn`/
  `FeaturedResource` cluster and rewrote this file (`ddcb4b4`).
- Added a mobile table of contents (`MobileToc`, extending
  `ScrollTrackingToc`'s shared `useActiveScrollId` hook) for article/
  pillar/subtopic/privacy/cookie-policy pages, wired in via
  `ReadingArea`; fixed three layout bugs found during a mobile audit —
  `LightPortraitHero` fold height, header CTA min-height, blog
  pagination flex-shrink (`f8a4614`).

**Resolved but not in git — Sanity content or diagnostic work, verified
live rather than by commit:**

- Added 5 English articles (adapted, not translated, from the Italian
  originals) with English excerpts, cover images, and alt text — pure
  Sanity writes via temporary scripts, deleted after use per this repo's
  own convention, so no file trace.
- Removed all ~428 `systemamilano.it` outbound links from article bodies
  (a WordPress-era cross-promotion scheme) — reverified live via a fresh
  query just now: 0 remaining.

**Already correctly marked resolved before this rewrite, left as-is:**
the Leaflet map attribution fix (Contatti build pass) was the one entry
the previous version of this file actually kept up to date — confirmed
still accurate, no change needed.
