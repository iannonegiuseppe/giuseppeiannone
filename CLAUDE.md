# CLAUDE.md

Conventions for anyone (human or AI) working in this repo. See [SPEC.md](./SPEC.md)
for the original project brief and fixed tech decisions this all derives from.

## Working process (foundation stage)

While the foundation is being built, work happens in **interactive mode**:

- Big changes are proposed as a numbered plan first and approved before any code is written.
- Work proceeds **one step at a time**. Before each step: explain what will be done
  and why (2–4 sentences), list the files that will be created/modified, and wait
  for explicit "go" before touching anything.
- After each step: show a short diff summary and make **one git commit** with a
  conventional message (`feat:`, `chore:`, `fix:`, `docs:`, ...).
- Steps are never bundled. A dependency is never installed without first naming it
  and its purpose.
- If a library's current API differs from what's documented here or in SPEC.md,
  say so and propose the current approach before coding — don't silently guess.

This applies for the remainder of the foundation stage. Once the foundation is
merged, day-to-day feature work can move to normal (non-gated) collaboration unless
told otherwise.

## Package manager

**npm only.** Commit `package-lock.json`. Do not add `pnpm-lock.yaml` or
`yarn.lock`. (Originally specified as pnpm; changed because pnpm wasn't available
on the setup machine — see SPEC.md.)

## Rendering rule (SEO/AEO/GEO)

All public-facing pages **must be server-rendered** (static generation or ISR via
`revalidateTag`/`revalidate`). No client-side fetching of page content (no
`useEffect` + `fetch` for content that should be indexed, no client components
fetching from Sanity for anything user-facing). Client components are fine for
pure interactivity (menus, form widgets) but must not be the source of indexable
content.

## Typing

Full end-to-end typing is a hard requirement, not a nice-to-have:

- `strict: true` + `noUncheckedIndexedAccess` in `tsconfig.json`. Do not weaken these.
- No implicit `any`. Avoid explicit `any` — if truly unavoidable, narrow it
  immediately and comment why.
- Sanity/GROQ query results must have explicit result types (hand-written or
  generated) — no untyped `client.fetch(...)` returning `any`.
- next-intl message usage should be type-checked against the message catalogs.
- Route handlers (`app/api/**/route.ts`) must type their request/response shapes.

## Styling (SCSS Modules, no Tailwind)

- Component styles live in co-located `Component.module.scss` files next to
  `Component.tsx`.
- Shared design tokens live in `src/styles/_tokens.scss` (CSS custom properties:
  palette, type scale, spacing scale, radii, breakpoints, z-index map) and
  `src/styles/_mixins.scss` (breakpoint mixins, focus-visible, visually-hidden,
  container). `src/styles/globals.scss` holds the reset/base typography and
  imports tokens.
- **No raw hex colors and no raw px values** in component styles, except `1px`
  borders. Reference tokens/mixins only.
- Media queries are mobile-first, expressed via the breakpoint mixins — not raw
  `@media` queries with hand-written widths.

## i18n routing

- `it` is the default locale, served unprefixed at `/...`.
- `en` is served under `/en/...`.
- Implemented via `next-intl` middleware with `localePrefix: 'as-needed'`.
- The middleware matcher must exclude `/studio`, `/api`, and static assets.
- UI chrome strings (nav labels, buttons, etc.) come from `messages/it.json` /
  `messages/en.json`. **Actual page content comes from Sanity**, never from the
  message catalogs.

## Sanity schema guardrails

These principles protect a non-technical editor from breaking the site and must be
upheld in every schema added later:

- Slugs auto-generate from `title` on create, then become **read-only after the
  document has been published** (checked via the field's `readOnly` callback
  against document publish state).
- Singleton documents (site settings, one-off pages) and `locationPage` (exactly
  two: Milan, Monza) must have delete/duplicate document actions removed and be
  pinned in the desk structure.
- All fields that must not be empty carry `validation: Rule.required()` — no
  relying on UI convention alone.
- Portable Text is restricted per content type (see schema files) — don't add
  marks/blocks/styles beyond what's explicitly allowed without deliberately
  revisiting this rule.
- it/en content pairs use `@sanity/document-internationalization` — don't invent
  an ad hoc parallel-field i18n scheme.
- Studio UI language is English regardless of site locale.

## Commit conventions

Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`),
one focused commit per approved step, imperative present tense subject line.
