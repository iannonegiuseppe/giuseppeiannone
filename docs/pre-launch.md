# Pre-launch checklist

Rebuilt from the code and the data as they actually are (not patched from the
previous version — that one had drifted too far from reality to trust). Each
entry names what it's based on: a file, a live query, or a specific commit.
Re-verify anything older than a few weeks before relying on it — code and
content both move.

## 1. Blocks launch

Things that must be done before the domain switches.

- **`seo.noIndex` is `true` on 81 documents right now, not a fixed small
  number — this entry previously said 79 and was stale by exactly
  `libriPage`'s 2 documents (missing from the breakdown below since
  whenever this file last checked; re-verified live just now).** Live
  count via `*[seo.noIndex == true]`, by type: `pillarPage` 14 (all 7,
  both locales), `subtopicPage` 42 (all 21, both locales), `article` 5,
  `homePage` 2, `chiSonoSection` 2, `contactPage` 2, `cookiePolicyPage` 2,
  `faqPage` 2, `libriPage` 2, `methodPage` 2, `pricePage` 2, `privacyPage`
  2, `siteSettings` 2. Every real, built page on the site is currently
  noindexed — this isn't a short list to flip, it's "turn indexing on" as
  a real launch step. `siteSettings-it`/`-en` don't need touching:
  `buildMetadata()` never reads `siteSeo.noIndex`, only each page's own
  `seo.noIndex` — flipping it does nothing either way.
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

- **`robots.txt` currently blocks all crawling (verified live:
  `User-Agent: *` / `Disallow: /`) — this is correct and load-bearing
  pre-launch, and needs no separate sitemap exception.** Checked whether
  `/sitemap.xml` also carries an `X-Robots-Tag: noindex` header (it would
  need excluding from that at launch, since Google won't read a sitemap
  marked noindex): it doesn't. `proxy.ts`'s middleware — the only thing
  that sets that header — has a matcher that excludes any path containing
  a dot (meant for static assets), so it never runs for `/sitemap.xml` on
  any hostname; confirmed with a live header check. `robots.ts`'s
  production branch already both allows crawling and lists
  `sitemap: .../sitemap.xml` — that flips on automatically the same
  moment `isProductionDeployment()` does (see `robots.ts`'s own comment).
  Re-confirm this with a live header check against the real Vercel
  preview before launch, since Vercel-dashboard-level config wouldn't
  show up in this repo — but nothing here points to action being needed.
  **Reconfirmed 27 August 2026** (pre-launch batch 1, independent
  re-investigation): still true, nothing has drifted. The launch-day
  action here is setting `NEXT_PUBLIC_SITE_URL` in Vercel — not a code
  change to this repo.

- **Consent banner and gated script-loading both exist now — GA4 and
  Microsoft Clarity are wired, not just the mechanism.**
  `CookieConsentBanner` and `src/lib/consent/consent.ts`'s
  `runWhenConsented` gate real script injection for both vendors (`src/lib/consent/loadGoogleAnalytics.ts`,
  `loadClarity.ts`, mounted via `AnalyticsLoader.tsx`) — verified live
  with a clean browser profile: zero requests to either vendor's domain
  before consent, both fire correctly after accepting, nothing after
  choosing necessary-only. Two real findings from that verification, not
  yet resolved: Clarity's own project configuration pulls in Microsoft
  Advertising cookies (`MUID`, `MR`, `SRM_B`, `SM`, `ANONCHK`) under
  analytics-only consent, which the published cookie policy doesn't
  document and which — per that policy's own §2 grouping — shouldn't be
  tied to marketing tracking at all; and GA4 sent nothing beyond its own
  script load in every test run, likely a property-side Consent Mode
  setting, not a code issue. Giuseppe is checking both dashboards before
  this ships live; not committed yet pending that.

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

- **Setting `NEXT_PUBLIC_SITE_URL` at launch fixes the contact-form
  emails too, not just canonicals/hreflang/sitemap/JSON-LD — easy to
  miss since nobody would think to check an email for this.**
  `getSiteUrl()` (`src/sanity/metadata.ts`) is the one constant behind
  every absolute URL in both the internal-notification and visitor
  confirmation emails (`src/lib/contact/emailTemplate.ts`'s `siteUrl()`,
  used for the header logo's click-through link). Locally, and on every
  Vercel preview deployment today, `NEXT_PUBLIC_SITE_URL` is unset and
  Vercel's own `VERCEL_URL` is the fallback — confirmed live (`.env.local`
  has neither set, so it resolves all the way to `http://localhost:3000`
  locally; on a real `dev`-branch preview, Vercel auto-populates
  `VERCEL_URL` to that deployment's own `*.vercel.app` host instead), so
  every link in a contact-form email sent from a preview deployment today
  points at that preview's own throwaway URL, not the eventual production
  domain. Setting `NEXT_PUBLIC_SITE_URL=https://giuseppeiannone.it` in
  Vercel at launch is the single edit that corrects this — same one edit
  that already fixes canonicals — no code change needed.

- **Giuseppe owes:** studio photographs — Monza's is in now (`sede-monza`/
  `-en`, addr-1, uploaded and verified live in the map popup and the
  homepage's "Gli spazi" strip), Milano's two addresses and Cernusco's
  one are still on the stock-photo fallback (blocks the location pages
  below, and the rest of the `public/interiors` stock-photo swap tracked
  in §4, which had this cross-reference backwards as "§2" before this
  pass) — and the WordPress user list (needed to finish reconciling the
  migrated article corpus's authorship).

## 2. Should fix before launch

Real defects, not launch-blocking.

- **The WordPress redirect map (`wordpressArticleSlugs.json`) is a frozen
  snapshot, not a live query — it matches Sanity exactly today (verified:
  468 IT articles ↔ 468 entries, zero gaps either direction), but nothing
  keeps it that way.** An editor adding or removing an article in Sanity
  doesn't touch this file — it's a one-time commit from the migration, not
  regenerated on content changes. Add a post, and it simply has no
  redirect (not a regression, just never covered — same as any new post,
  expected). Delete or rename one that a redirect still points at, and
  that redirect now silently sends a visitor — and Google, for a URL it
  already indexed — to a 404 on `/blog/{old-slug}`, which is worse than a
  clean 404 at the original URL: it looks like the destination itself is
  broken, not just missing.
  - **Same shape of problem as the singleton-registration gap
    `singletonPages.completeness.test.ts` already tests for — two lists
    that must agree with nothing enforcing it — but not the same shape of
    *test*.** That test is pure, static, offline: it compares hardcoded
    arrays against each other, no network, safe to run on every commit,
    and its result stays true until the code itself changes again. A
    redirect-vs-Sanity check would need a live Sanity fetch, meaning
    `npm test` would start requiring `.env.local`/credentials to even run
    (today it needs neither), and — the bigger difference — a pass at
    commit time wouldn't stay true: Sanity content changes independently
    of any git commit, so this check would need re-running periodically
    or on demand, not just in CI on push, to mean anything. Technically
    buildable with the same `node:test` mechanism; not the same
    maintenance model, and not built here — flagged for a decision, not
    assumed.

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

- **Three article-corpus anomalies, all now fixed — re-checked live:**
  - ~~`e-normale-controllare-tutto-mille-volte` — one link pointed to
    `https://claude.ai/chat/06f975ff-dc63-4737-8022-fb58dddc74b3#contatti`,
    a leaked AI chat-session URL, not a real citation~~ — **fixed.**
    Re-pointed to `/contatti`, anchor text ("→ Contattami per un primo
    colloquio") unchanged. A full corpus sweep for the same class of
    problem (localhost, staging hosts, file paths, other leaked chat
    URLs) turned up one more, separately fixed: `quando-finisce-la-psicoterapia`
    linked the word "articolo" mid-sentence to a WordPress
    `wp-admin/post.php?...&action=edit` URL — not a citation of
    anything, so the link mark was removed and "articolo" left as plain
    text rather than pointed anywhere.
  - ~~`fumare-aiuta-a-gestire-lansia` — 10 links to
    `instagram.com/explore/tags/*`~~ — **fixed.** Re-checked live: zero
    Instagram hashtag links remain on this article.
  - ~~`cose-un-disturbo-di-personalita` — six `"PrecSucc"`/`"123"`
    pagination-widget block pairs~~ — **fixed.** Re-checked live: no
    `"PrecSucc"` block remains in the body.

- **Three near-duplicate article pairs need a human skim, not an
  overlap-percentage call.** Found during the blog-category pass
  alongside a fourth, confirmed-genuine duplicate that's already been
  resolved (`in-quante-sedute-di-psicoterapia-staro-meglio-2`, 98.6%
  word overlap, deleted — the earlier unsuffixed article was kept).
  These three sit at 53–60% word overlap each: real thematic overlap,
  same question in the title, but not clearly a copy/rewrite pair the
  way the deleted one was. Each pair, both slugs, and the measured
  overlap:
  - `cosa-fa-uno-psicoterapeuta` (2024-11-13) vs.
    `cosa-fa-uno-psicoterapeuta-2` (2025-03-24) — **~60% overlap.** The
    second adds explicit Dr. Iannone framing the first lacks; reads more
    like a deliberate variant than an accidental republish.
  - `perche-e-difficile-perdonare` (2023-12-09) vs.
    `perche-e-difficile-perdonare-2` (2025-04-01) — **~53–59% overlap.**
    The weakest case of the three: the first is about the difficulty of
    forgiving generally (etymology, betrayal, pride, trust), the second
    is framed around resentment and "an unforgiving heart" — plausibly
    two genuinely different articles that happen to share a title.
  - `lo-psicoterapeuta-mi-giudica` (2024-02-06) vs.
    `lo-psicoterapeuta-ti-giudica` (2024-07-28) — **~59% overlap.** Same
    question, five months apart, first- vs. second-person address — the
    closest call of the three; plausibly a rewrite, but overlap alone
    doesn't say whether the second is an improvement or a redundant
    republish.
  Nothing here has been deleted or merged — that's a 55%-overlap call
  only a human read can make, not a percentage.

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

- **`ansia-sessuale` shares its hero image with `ansia-da-prestazione` —
  the only shared subtopic image on the site, and should be replaced with
  its own photo when one exists.** Was unset entirely (confirmed:
  `heroImage` was empty on `subtopicPage-ansia-sessuale-it`); fixed by
  reusing `ansia-da-prestazione`'s asset (`ansia-sessuale`'s real title is
  "Ansia da prestazione sessuale," so the two are close cousins, not an
  arbitrary pairing) with its own, independently written alt text — not
  the neighbour's. Checked before doing this, not assumed: queried all 21
  IT subtopics, and every other one has a fully unique image — zero
  pairs share an asset. So this isn't "how it already works elsewhere,"
  it's a first, done here only because no real photo exists yet. Give it
  its own image the moment one does; until then this is the one place on
  the site where two different pages show an identical picture.

- **301 article covers now have real, title-derived `alt` text
  (`cover.alt`, "Copertina dell'articolo: {title}" / "Article cover:
  {title}") — but nothing on the live site renders it.** Checked every
  consumer: `[slug]/page.tsx`'s own cover band and `BlogFilterableSection.tsx`'s
  listing cards both hardcode `alt=""`; there's no Open Graph image alt,
  no JSON-LD, no RSS. This looks like a deliberate, consistent sitewide
  convention — the same `alt=""` pattern appears on the author portrait,
  the diplomi row, the locations marquee, and several other components,
  always where a heading or caption next to the image already says the
  same thing in real text — not an oversight to fix reflexively. Left
  alone for now, per the owner's own instruction, but flagged so whoever
  next touches this doesn't rediscover the same gap and write the alt
  strings a second time: the data is already there and correct.
  **The one place this convention may not hold is the article's own
  cover band** — unlike the author portrait or a card's own title
  (which sits directly beside its image), the cover there functions as a
  full-bleed background behind the H1, not as a caption pairing; whether
  that counts as "redundant with adjacent text" the same way the others
  do is a real judgment call, not a settled one. Worth a decision before
  assuming the convention applies here too by default.

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

- ~~**34 headings longer than 120 characters, across 26 articles.**~~ —
  **fixed.** Re-verified live: the real count was 34 headings across 23
  articles (this entry's own "26" was stale). 29 demoted from `h2`/`h3`
  to plain paragraphs (WordPress-migration artifacts — paragraphs that
  became headings on import, corrupting the heading outline and the
  tables of contents). 3 deleted outright: `le-6-cause-della-claustrofobia`
  had the same "Se soffri di sintomi di claustrofobia..." call-to-action
  paragraph tagged `h3` four separate times — a plugin repeating itself,
  not four real headings — three copies removed, the fourth kept as a
  plain paragraph. 2 became real, short headings instead of being
  demoted: `panico-o-ipocondria` now has "Come si presenta l'ipocondria?"
  and `il-disturbo-paranoide-di-personalita` now has "Il circolo vizioso
  del sospetto," both inserted above the original (now-paragraph) text
  rather than editing it apart, so nothing written was lost or reworded.

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
  0`). Monza's photo has landed; still waiting on Giuseppe's real photos
  of Milano's two addresses and Cernusco's one (see §1) before these get
  built at all.

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
  not a bug — no longer true for all of them.**
  `src/app/design-lab/DesignLabHomepage.tsx`'s `INTERIOR_STOCK_FALLBACK`
  map — the Locations marquee falls back to a generic stock photo whenever a
  `sede.addresses[]` entry has no `photo` set in Sanity. Monza's address
  has a real photo now (see §1); Milano's two addresses and Cernusco's
  one are still on the fallback. Switches automatically per address, no
  code change, as each remaining one gets uploaded (see §1 — same
  photograph dependency as the location pages above).

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

**Resolved since (Aug 15–19, 2026) — a later session, outside the commit
range above; same sourcing discipline, checked live rather than assumed:**

- Built the real `/libri` (`/en/books`) page (`f8773df`, Aug 15) — not
  recorded anywhere in this file until now, since it postdates the
  commit range this section was originally scoped to.
- Filled the privacy policy's two `[DA CONFERMARE — ...]` placeholders
  (controller block's registered-address line removed entirely per
  instruction, not left blank; rights-request email filled) — the bullet
  that used to record these as open, in §1, is gone.
- Uploaded Monza's real studio photo to `sede-monza`/`-en` (addr-1) and
  wired the map popup to render it as a background with a scrim
  (readable-text contrast measured live, all ≥4.5:1) instead of a top
  band — separate from the Advertising-cookie and GA-reporting findings
  recorded in §1's own updated consent-banner entry.
- Fixed two real, tsc-clean-but-actually-broken things found while
  auditing the sitemap for this pass: `robots.ts`'s own comment now
  explains exactly what changes on launch day (was previously
  undocumented); this file's own noIndex count was stale by 2 documents
  (79 → 81, `libriPage` was never added to the breakdown).
- **Fixed the pattern, not the instance, on the six-missing-query
  sitemap gap.** `sitemap.ts` used to fetch each fixed-route singleton
  type via a hand-written query (or, for six of them, no query at all).
  It now derives its entire singleton-page section from
  `paths.ts`'s own `SINGLETON_ROUTES` — one array pairing each fixed
  path function with the Sanity document type behind it, already the
  established source for `reservedSlugs.ts` and `LocaleSwitcher.tsx`.
  Adding a future singleton page now means one array entry, not a
  matching hand-written sitemap query nobody remembers to add. URL count
  is unchanged today (470 → 470) since all six affected types are still
  noIndex; the fix is real and verified regardless (queried all six
  directly — real documents, real timestamps, ready the moment noIndex
  clears).

**Already correctly marked resolved before this rewrite, left as-is:**
the Leaflet map attribution fix (Contatti build pass) was the one entry
the previous version of this file actually kept up to date — confirmed
still accurate, no change needed.

## 6. Post-launch monitoring

Not a pre-launch gate — nothing here blocks going live. Scheduled checks to
run once real traffic exists.

- **A week after launch, check the Vercel logs for `[contact] Honeypot
  triggered`.** That line (added to `src/app/api/contact/route.ts` during
  the contact-form hardening pass, alongside `EMAIL_USER`/`EMAIL_PASSWORD`
  and the signed-token layer) fires every time the honeypot field rejects a
  submission — logged with the requester's IP only, never the field's own
  contents.
  - **If it appears regularly against ordinary residential/mobile
    addresses**, the trap is catching real visitors, not bots, and needs
    loosening — this already happened once before launch: Android Chrome's
    own Autofill filled the honeypot field on a real submission (it was
    named `companyWebsite`, which reads to Chrome as a plausible
    organization/URL field despite being visually and `aria-hidden` from
    the visitor), silently swallowing a genuine enquiry. Fixed by renaming
    the field to something with no autofill-dictionary overlap
    (`hp_x7k2`), but the same failure mode could resurface from a different
    browser/password-manager heuristic — this is the check that would catch
    a recurrence.
  - **If it only spikes occasionally**, the honeypot is working as
    intended.
  - **Why this needs an explicit check, not just "wait for a complaint":**
    the honeypot rejects silently by design — a bot must not be able to
    tell it was caught. That same silence means a false positive costs a
    real enquiry and leaves no trace on the visitor's own side: they see
    the normal success message and simply never hear back, with nothing to
    suggest their message never arrived.
