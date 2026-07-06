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
- **`ctaBlock`/`conditionCard`/`treatmentCard`/`blockquote` are type-checked but
  not yet rendered in a browser** (found building Stage 3 Step 3): no seed
  content exercises them, so they're verified by type-check and code review
  only. To be visually confirmed on the first real page that uses one —
  `ctaBlock` surfaces on the homepage in Stage 3 Step 5. No temporary write
  token is to be provisioned just for this.
- **`siteSettings.crisisSupportText` isn't on the live published documents yet**
  (found verifying Stage 3 Step 4): the schema field is required and
  `scripts/seed.ts` has a sensible default (Italian 112 reference), but the
  *already-published* `siteSettings-it`/`siteSettings-en` documents predate the
  field and don't have it — the footer's own code correctly omits the
  crisis-support line rather than rendering it empty, but that means the
  deontology-required line is **not currently visible on the live site** until
  someone re-runs the seed script (needs a write token) or fills the field in
  directly in Studio. Flagging because this is a deontology element, not a
  cosmetic one — don't let this stay silently unresolved.
- **Footer's Locations column renders empty** (found in the same verification):
  same root cause already logged in the Step 9 verification results above — zero
  `locationPage` documents are published yet. Resolves itself once Stage 3 Step 9
  (location pages) creates the two real documents; not a footer code defect.
