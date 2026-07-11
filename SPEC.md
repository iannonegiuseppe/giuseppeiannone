# Project Spec — Foundation Stage

This document captures the foundational brief and tech decisions agreed at project
start. It is a historical/reference record — day-to-day working conventions for
whoever (human or AI) touches this repo live in [CLAUDE.md](./CLAUDE.md).

## Project

Bilingual website (Italian primary, English secondary) for a
psychologist-psychotherapist practice (Milan / Monza / online).

SEO + AEO/GEO (AI answer engines) are first-class requirements: the site must be
fully crawlable by Google/Bing and AI answer engines, so **all public pages must be
server-rendered (SSG/ISR) — no client-side content fetching.**

The content editor is the non-technical site owner. The Sanity CMS schemas must be
**structurally safe for a non-technical editor** (guardrails on required fields,
slugs, singletons, etc. — see Step 6/7 below).

## Fixed tech decisions

| Decision | Value |
|---|---|
| Framework | Next.js (latest stable), App Router, TypeScript strict mode |
| Styling | **No Tailwind.** SCSS Modules (`Component.module.scss`) + a global design-token layer |
| CMS | Sanity, Studio embedded at `/studio` via `next-sanity` |
| i18n | `next-intl`. Locales: `it` (default, served at root, no `/it` prefix) and `en` (under `/en/...`), via `next-intl` middleware with `localePrefix: 'as-needed'` |
| Package manager | **npm** (originally specified as pnpm; changed at Step 1 because pnpm was not installed on the target machine and the user chose npm over installing pnpm via Corepack). Only `package-lock.json` is committed. |
| Deploy target | Vercel. No vendor lock-in beyond that. |
| Typing | Full end-to-end typing: TS strict mode + `noUncheckedIndexedAccess`, no implicit `any`, typed Sanity/GROQ query results, typed next-intl messages, typed route handlers. |

## Foundation-stage step plan

1. Scaffold (create-next-app, TS/App Router/src-dir/alias, sass, `.editorconfig`/`.nvmrc`)
2. `CLAUDE.md` + `SPEC.md` (this file)
3. SCSS architecture (`_tokens.scss`, `_mixins.scss`, `globals.scss`)
4. i18n + middleware (`next-intl`, locale-aware nav helpers, message catalogs)
5. Sanity project wiring (`sanity.config.ts`, `/studio`, env vars, typed client, GROQ helpers)
6. Content schemas (singletons, `locationPage`, `pillarPage`/`subtopicPage`, `article`,
   `service`, `faqItem`, `author`, reusable objects, restricted Portable Text)
7. Editor guardrails (slug lock-after-publish, desk structure, singleton protection,
   `@sanity/document-internationalization`, required validations, English Studio UI)
8. Revalidation webhook (`/api/revalidate`, tag-based `revalidateTag`)
9. Wiring proof (seed demo content, 4 minimal unstyled server-component pages)
10. README + manual verification checklist

## Out of scope for this stage

Page designs/components, homepage sections, contact form, JSON-LD/metadata/sitemap/
robots.txt, draft mode & Presentation preview, WordPress migration/redirects. These
come in later stages.

## Working process

Foundation-stage work is done interactively, one step at a time, with explicit
approval before each step and a commit after each. See [CLAUDE.md](./CLAUDE.md) for
the exact workflow rules. This same interactive process continues into later stages.

## Stage 2 — SEO/AEO/GEO layer + draft-mode editing

Builds on the foundation to add real search/answer-engine visibility and editor
preview tooling. Work happens on the `dev` branch (Vercel builds a preview per push);
`main` (production) is only updated by a deliberate merge — see CLAUDE.md's
branching section.

1. Dev branch + Vercel preview deployment workflow
2. Environment-driven indexing — retires the Stage 1 `NEXT_PUBLIC_ENABLE_INDEXING`
   toggle in favor of `VERCEL_ENV`/`NEXT_PUBLIC_SITE_URL` detection, plus a hard
   "any `*.vercel.app` host is always noindex" rule enforced in `src/proxy.ts`
3. Metadata API layer (title template, canonical, hreflang, OpenGraph, Twitter card)
4. JSON-LD structured data (Person, MedicalBusiness, BreadcrumbList, MedicalWebPage/
   Condition/Therapy, FAQPage) — see `src/sanity/jsonLd.ts`
5. `sitemap.xml` + `robots.txt` (bot-allow policy below)
6. Breadcrumbs + Table of Contents components
7. Draft mode + Presentation (visual editing)
8. Localized 404 + error pages
9. Stage verification

### robots.txt bot-allow policy

Applies once the production domain is live (see `src/app/robots.ts` and
`isProductionDeployment()` in `src/sanity/metadata.ts`); preview/non-production
deployments disallow everything regardless of this policy.

- **Always allowed**: `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`,
  `Perplexity-User`, `Claude-SearchBot`, `Claude-User`.
- **Allowed, pending client confirmation**: `GPTBot`, `Google-Extended`. Implemented
  as allowed for now; flag to the client before launch that this is a provisional
  default, not a confirmed decision, in case they'd rather exclude their content
  from being used to train these companies' models while still allowing the
  search-answer bots above.
- **Disallowed**: `/studio`, `/api/`.
- Sitemap reference built from `NEXT_PUBLIC_SITE_URL` — no hardcoded host.

### Step 9 verification results

Re-verified this session, not assumed from earlier steps' own testing:

- **Build route table**: all public content routes (`/`, `/[pillarSlug]`,
  `/[pillarSlug]/[subtopicSlug]` × it/en) are static (SSG). Only `/api/*` and
  `/studio` are dynamic, as expected.
- **View-source on 4 proof routes** (it-home, it-pillar, it-subtopic, en-pillar):
  title, canonical (self-referencing), reciprocal hreflang (it/en/x-default), and
  JSON-LD (Person/BreadcrumbList/MedicalWebPage/FAQPage) all present and valid.
- **`sitemap.xml`**: found and fixed a real bug — its Sanity fetches had no cache
  tags, so the revalidate webhook could update every page but leave the sitemap
  stale until the next redeploy. Fixed by adding `sanityFetchPublished` (tags
  mandatory) and migrating every direct `client.fetch` call onto it; rule
  documented in CLAUDE.md. Re-verified live: publishing a change now updates
  `sitemap.xml` on the real preview deployment with no redeploy.
- **`robots.txt`**: correctly serves "disallow everything" right now, because
  `isProductionDeployment()` is false pre-launch. **The documented bot-allow
  policy itself is still unverified against a real production deployment** —
  can't be tested until `main`/production is actually live. Not a gap in this
  session's work, just not yet checkable.
- **Preview noindex hard rule**: confirmed against the real `*.vercel.app`
  deployment (not just localhost) — `X-Robots-Tag: noindex, nofollow` present,
  matching `<meta name="robots">`, self-referencing canonical to the deployment's
  own URL.
- **Stage-1 gap (real webhook)**: webhook configured in Sanity's dashboard
  against the preview URL (POST `/api/revalidate`, `x-vercel-protection-bypass`
  header for the deployment-protection wall, Sanity's own signed secret in its
  dedicated Secret field). Verified via a real Studio publish: webhook delivery
  log showed 200/`revalidated:true`, and the public page updated with no
  redeploy.
- **Presentation (draft mode + visual editing)**: found and fixed two real gaps
  neither caught by Step 7's original scripted test:
  - `<VisualEditing/>` (from `next-sanity/visual-editing`) was never rendered
    on the frontend, so Presentation couldn't establish its connection at all.
    Fixed in `src/app/[locale]/layout.tsx`, conditional on `isDraftModeEnabled()`.
  - The draft client had no `stega` config, so Presentation's "Documents on
    this page" panel and click-to-edit had nothing to trace rendered content
    back to a document. Fixed by enabling `stega` on `previewClient` only
    (confirmed directly against the Content Lake that draft fetches now carry
    the encoded characters and published fetches stay clean).
  - Full loop re-verified with a real, editor-driven draft (made via Structure,
    not scripted): confirmed via direct Content Lake read that a real draft
    existed and diverged from published; confirmed the anonymous/public page
    showed published-only content while the draft was live; confirmed
    publishing updated the public page with no redeploy.

## Deferred verification items (for future stages)

Things intentionally built as reusable infrastructure now, ahead of the pages that
will exercise them — flagged here so the wiring-up doesn't get silently skipped when
those pages are eventually built.

- **Article, location, and service public routes** (Stage 3+): when these routes are
  built, they must be wired to the existing helpers and then verified, not just
  assumed to work — `Article` JSON-LD (author, dates) and `MedicalBusiness` JSON-LD
  reuse from `src/sanity/jsonLd.ts`, sitemap entries from the sitemap generator
  (Stage 2 Step 5), and the full Metadata API layer (`src/sanity/seo.ts`) per page.
- **Pillar/subtopic article body has no max-width container** (found verifying
  the CTA band/boxed variant, Stage 3 Step 5): `[locale]/[pillarSlug]/page.tsx`
  and the subtopic equivalent render `<main>` and its Portable Text body with no
  `container` mixin at all — content (paragraphs, cards, the ctaBlock's boxed
  variant) currently stretches full viewport width instead of a readable
  measure. Needs a proper reading-column treatment (~65–75ch max-width) when
  Stage 3 Step 7 (or whenever these pages next get layout attention) is
  addressed — this is a real readability problem for long-form knowledge-base
  content, not cosmetic.

## Known items

Confirmed real, low-severity, not fixed yet — tracked here so they don't get
rediscovered from scratch later.

- **Empty-title `<head>` on 404s from `[pillarSlug]`/`[subtopicSlug]`** (found
  verifying Stage 2 Step 8): `generateMetadata` and the page component each fetch
  the document independently. When the slug doesn't resolve, `generateMetadata`
  still runs and builds a title from `data?.title ?? ""`, producing an empty
  `<title> | Giuseppe Iannone – ...</title>` tag before the page component's own
  `notFound()` call swaps in `not-found.tsx`'s content. `robots` still correctly
  resolves to `noindex` either way, so this is cosmetic, not an indexing bug.
  Revisit when Stage 3 builds out the full route set — likely fix: resolve the
  document once (shared between `generateMetadata` and the page component) and
  make that resolution `notFound()`-aware, rather than querying twice.
- **`ctaBlock` is now real, exercised in both contexts it can appear in**
  (closed in Stage 3 Step 5's CTA-variant pass): the homepage's own "not sure
  where you fit" moment uses a new full-bleed "band" variant
  (`ctaBlockVariant: "band"` in `getPortableTextComponents`), while article
  body content (pillar/subtopic pages) keeps the original contained "boxed"
  variant (the default, unchanged). Both variants verified via temporary
  overrides — including the band's full-bleed breakout at 360px and ~1440px+,
  both locales, confirmed no horizontal overflow — then added permanently to
  `scripts/seed.ts` (the pillar page's article body, and the homepage's
  `body`) rather than left as throwaway test data. **Not yet live**: the
  seed script isn't re-run against the published dataset (no write token), so
  the real site still shows the old placeholder paragraph until someone
  re-seeds or edits it directly in Studio.
- **`conditionCard`/`treatmentCard`/`blockquote` are still type-checked but
  not yet rendered in a browser** (found building Stage 3 Step 3, `ctaBlock`
  split off into its own resolved item above): no seed content exercises
  these three, so they're verified by type-check and code review only. No
  temporary write token is to be provisioned just for this — revisit when a
  real page naturally uses one.
- **`siteSettings.crisisSupportText` is only published for `it`, not `en`**
  (found verifying Stage 3 Step 4, re-checked after the client published the
  Italian text): confirmed directly against the Content Lake — `siteSettings-it`
  now has real crisis-support text (112 plus Telefono Amico Italia) and renders
  correctly in the footer; `siteSettings-en` still has `crisisSupportText: null`.
  The footer correctly omits the line rather than rendering it empty, but the
  English site currently has **no visible crisis-support line at all**. This is
  a deontology element — don't let the English gap sit unresolved silently.
- **Footer's Locations column renders empty** (found in the same verification):
  same root cause already logged in the Step 9 verification results above — zero
  `locationPage` documents are published yet. Resolves itself once Stage 3 Step 9
  (location pages) creates the two real documents; not a footer code defect. The
  homepage's `LocationsStrip` (Stage 3 Step 5) has the same underlying data gap —
  confirmed it degrades gracefully (only the fixed "Online" card renders, no
  empty `<li>` holes) rather than breaking, verified against the real page, not
  assumed.
- **Care pathway ("Il percorso") isn't live yet** (built in its own dedicated
  pass, Stage 3 Step 5): `siteSettings.carePathway` is new, seeded with the
  real four-step sequence (Primo colloquio → Valutazione → Percorso →
  Verifica / First consultation → Assessment → Treatment → Review) in both
  locales, but the seed script hasn't been re-run against the published
  dataset — the section simply doesn't render on the live site until it is.
  Thoroughly verified via temporary overrides before reverting: no-JS shows
  all 4 steps as real text (no `pendingReveal` class in the raw HTML —
  confirmed it's JS-only), `prefers-reduced-motion: reduce` keeps every step
  at opacity 1 with no animation, and normal-motion mode genuinely triggers
  the IntersectionObserver reveal on scroll (checked via computed opacity
  before/after, not just visually). Will also render on the Method page once
  that page exists (Stage 3 Step 7) — same `siteSettings.carePathway` data,
  no duplication.
- **Header/footer copy isn't Sanity-editable yet** (nav labels, CTA text, footer
  headings, legal link labels — all currently in `messages/it.json` /
  `messages/en.json`). The non-technical client can't change any of this without
  a code change. Deliberately deferred until the header/footer markup itself is
  finalized (no point building an editable-fields UI around a layout that's
  still moving) — revisit once Stage 3's header/footer work is done, likely as
  either new `siteSettings` fields or a dedicated navigation/footer document.
- **Homepage pricing summary and final contact block aren't live yet** (Stage 3
  Step 5, Batch B): `homePage.pricingSummary` (heading/body/button, button
  hardcoded to the pricing page so an editor can't misconfigure it) and
  `homePage.finalContact` (closing heading/body, CTA reusing the hero's exact
  button text, plus a fixed privacy-policy reassurance note — deliberately
  *not* a form or consent checkbox, since the real contact form with GDPR
  consent is its own later step) are new optional fields, both `null` on the
  currently published documents. The seed script's write token started
  returning `401 Unauthorized — Session not found` this session (read token
  still works fine, so it's just the write credential, not a general outage) —
  confirmed via a direct read-only query that both fields are genuinely absent
  from the Content Lake, not a bug. Verified via a temporary in-code override
  (not a Sanity write) that both sections render correctly in both locales at
  360px and 1280px, then reverted and rebuilt clean with zero `TEMP TEST`
  markers left; confirmed the real (field-less) page correctly renders neither
  section rather than an empty shell. Needs the write token rotated in
  sanity.io/manage, then `npm run seed` re-run, for these to go live.
