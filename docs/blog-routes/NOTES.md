# Blog routes pass — known build limitation (accepted deliberately)

## The finding

On Next.js `16.2.10` with Turbopack (this project's `npm run build`), a route
shaped **`[dynamic]/[static]/[dynamic]`** produces **zero pre-built pages**
from `generateStaticParams`, even though the function itself runs correctly
and returns the right data.

This project's `/blog/[slug]` and `/blog/page/[page]` are exactly that shape:
`[locale]` (dynamic, from the root layout) → `blog` (static) → `[slug]` /
`page/[page]` (dynamic). Build output shows these routes as `●` (SSG-eligible)
but with no generated sub-paths, and `.next/server/app` contains no per-slug
HTML/RSC output for either route — confirmed on a build with all 468 article
slugs and again with a single hardcoded slug.

## How this was isolated (not guessed)

Tested against a completely bare, dependency-free route with hardcoded
`generateStaticParams`, varying one thing at a time:

- Plain dynamic segment, catch-all segment, optional-catch-all segment — all
  fail the same way under a static parent.
- Reusing an already-working param name (`pillarSlug`) — still fails.
- Adding a `layout.tsx` to the static parent segment — still fails.
- **The exact same segment shape with no dynamic ancestor**
  (`/zzztest/[id]`, not nested under `[locale]`) — **works correctly**,
  generates its static page normally.
- `[locale]/[pillarSlug]/[subtopicSlug]` (dynamic directly under dynamic, no
  static segment between) — already known to work, reconfirmed.

So the precise failing shape is a dynamic segment nested under a *static*
segment that is itself nested under a *dynamic* ancestor. Dynamic-directly-
under-dynamic works; static-alone-then-dynamic (no dynamic ancestor) works.
Only the three-level dynamic→static→dynamic chain fails.

## What actually happens at runtime (verified against the real production build)

Started the built app with `next start` (not dev mode) and hit real routes:

- `/blog/{any real article slug}` → 200 on the first request (on-demand
  render — Next's `dynamicParams` defaults to `true`), then
  `x-nextjs-cache: HIT` / `Cache-Control: s-maxage=31536000` on the second
  request — functionally identical to SSG/ISR from the second visitor
  onward. The same `article` / `article:{slug}` revalidation tags
  (`src/sanity/articles.ts`) apply either way, so the publish webhook still
  invalidates it correctly.
- A nonexistent slug → 404, as expected.
- Both known edge-case articles (WP post 527, with a skipped dead image;
  the numeric-slug post `4466-2`) → 200.

## Decision

Accepted deliberately, 2026-08-03: ship as-is. The only real-world effect is
that each article's *very first* visitor gets a live-rendered response
instead of a pre-built one; every visitor after that is served from cache
exactly like true SSG. Not restructuring `/blog/[slug]` to dodge this (that
URL shape is decided) and not bumping the pinned Next.js version to chase a
fix mid-pass.

**Worth re-testing after a future, deliberate Next.js upgrade** — if this
turns out to be a Turbopack regression that gets fixed upstream, the 468
pages would start pre-building again with no code change needed here.
