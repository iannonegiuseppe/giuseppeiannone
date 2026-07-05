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
the exact workflow rules.
