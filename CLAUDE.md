# CLAUDE.md

Conventions for anyone (human or AI) working in this repo. See [SPEC.md](./SPEC.md)
for the original project brief and fixed tech decisions this all derives from.

## Working process (interactive mode)

Work happens in **interactive mode**, stage by stage:

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

This has applied since the foundation stage and continues into later stages unless
told otherwise.

## Design charter

Design work must comply with §10 of `docs/design-direction.md` (the
design charter). Before finishing any task that changes visual output,
check the result against §10 and report every rule it violates, by
number. §9 (deontology) outranks §10 wherever they conflict.

## Branching & deployment workflow

Starting Stage 2 (SEO/AEO/GEO layer):

- **`dev`** is where feature work lands — every push builds a Vercel preview
  deployment automatically.
- **`main`** tracks the production domain. It is only updated by a deliberate,
  explicitly-requested merge — never pushed to as a side effect of regular work.
  During an active stage, assume `main` is off-limits unless told otherwise for
  that specific push.
- Preview deployments (any `*.vercel.app` host) are **always** `noindex, nofollow`,
  as a hard rule independent of any other environment signal — see the
  environment-driven indexing rules added in Stage 2 Step 2.

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
  container). `src/app/[locale]/globals.scss` holds the reset/base typography
  and imports tokens.
- **No raw hex colors and no raw px values** in component styles, except `1px`
  borders. Reference tokens/mixins only.
- Media queries are mobile-first, expressed via the breakpoint mixins — not raw
  `@media` queries with hand-written widths.
- **Inside `tone.light-island-surface` (or `tone-mid-surface`), only the tokens
  that mixin explicitly reassigns are safe to use — every other token still
  resolves to the site's ambient DARK theme value**, because the mixin doesn't
  touch the `:root` cascade, it just locally overrides a specific list of custom
  properties. Found live (chi-sono opening pass): `var(--color-sand)` inside a
  light island rendered near-black, because `--color-sand` is theme-flipped
  (`#f1ece2` light / `#16261F` dark) and isn't one of the properties the mixin
  reassigns.
  - **Covered** (safe, already re-pointed to the light-theme value):
    `--color-bg`, `--color-text`, `--color-text-muted`, `--color-hairline`,
    `--color-line`, `--color-focus`, `--color-accent`, `--color-accent-hover`,
    `--color-accent-contrast` (plus a few component-specific ones —
    `--hope-section-bg`, `--hope-emphasis-color`, `--divider-glow`).
  - **NOT covered** (still resolves to the dark-theme literal inside a light
    island — check `_tokens.scss` for both `:root` values before using any of
    these there): `--color-surface`, `--color-surface-tint`,
    `--color-surface-raised`, `--color-sand`, `--color-sand-deep`,
    `--color-greige`, `--color-accent-light`, `--color-accent-deep`,
    `--color-accent-gradient-light`/`-dark`, `--color-accent-soft`,
    `--color-amber`, `--color-gold-bronze`, `--color-photo-backdrop`,
    `--color-glass-*`, `--color-glow*`, `--color-text-faint`,
    `--color-hairline-strong`.
  - For a surface fill inside a light island, reach for a `--light-base-*`
    token directly (`--light-base-bg`, `--light-base-hairline`,
    `--light-base-line`, `--light-base-accent`/`-accent-hover`) — these are
    theme-invariant by construction, not reassigned per-scope, so they can't
    have this problem.
  - **The mirror-image trap: a DARK section (`tone.rich-dark-surface`/
    `tone.tone-deep-foreground`) nested INSIDE a light island resolves to
    LIGHT values, regardless of `:root[data-theme="dark"]`.** `light-island-
    surface` reassigns `--color-bg` (and everything `rich-dark-surface`/
    `tone-deep-foreground` read) on itself for its *entire subtree* — that
    beats the root theme for anything nested inside it, because CSS custom
    properties resolve from the nearest ancestor that sets them, not from
    `:root` once something closer overrides them. Hit twice: first on the
    `/prezzi` design-lab proposal (blamed on design-lab's own layout never
    setting `data-theme="dark"` on `<html>` — a real but incomplete
    diagnosis), then again porting that section to the real `/prezzi`
    page, where `:root[data-theme="dark"]` unquestionably *was* set and the
    dark band still rendered near-white — because `.page` (light-island-
    surface, an ancestor of the dark band) was the actual source, not the
    root theme. Fix: an explicit `.themeDark` wrapper as an ANCESTOR of the
    dark section, re-establishing the real dark values at that point in the
    tree — never applied to the SAME element as `tone-deep-foreground`,
    which creates a genuine circular custom-property reference
    (`--color-text` -> `--tone-deep-text` -> `--color-text`, both declared
    for one element) that resolves to nothing (`getComputedStyle` returns
    `""`), confirmed live during the design-lab pass.
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
  document has been published**. Schema-level `readOnly` callbacks are synchronous
  with no dataset access, so this can't be a plain callback — it's a custom slug
  input component using `useEditState` (see `src/sanity/components/SlugLockedAfterPublish.tsx`).
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

## Sanity data fetching

- Every Sanity content fetch goes through `src/sanity/client.ts` — never call
  `client.fetch(...)` or `previewClient.fetch(...)` directly from a page,
  route, or component. Two wrappers, both with tags as a required argument
  (not optional — an untagged fetch is a fetch the revalidation webhook can
  never invalidate):
  - `sanityFetch(query, params, tags)` — draft-mode aware, for request-time
    page/metadata fetches (branches to preview content when draft mode is on).
  - `sanityFetchPublished(query, params, tags)` — always published, no
    draft-mode check. Use this for `generateStaticParams` (build time, no
    request/cookies exist yet, so draft mode isn't meaningful) and for public
    routes like `sitemap.ts`/`robots.ts` that must never reflect a visitor's
    own draft-mode cookie.
- `client` itself stays exported for the handful of legitimate non-fetch uses
  (`next-sanity/draft-mode`'s `defineEnableDraftMode`, `@sanity/image-url`'s
  `createImageUrlBuilder`) — the rule is about `.fetch()` calls, not the
  export.

## Singleton page routes

- **One route folder per locale, not a shared dynamic dispatcher.** Chi sono
  (`chi-sono/` + `about-me/`), Prezzi (`prezzi/` + `pricing/`), and the rest of
  the fixed singleton pages (Metodo, Contatti, FAQ) each get their own literal
  folder per translated slug — the non-English-slug folder re-exports the
  other's `generateMetadata`/`default` wholesale (see `about-me/page.tsx` or
  `pricing/page.tsx`) rather than duplicating logic. A single
  `[locale]/[singletonSlug]/page.tsx` reading a slug→type map was considered
  and rejected: these are five fixed, known pages, each with its own schema
  shape and its own template — a dispatcher doesn't reduce that work, it just
  moves the same branching into one file instead of five, while putting the
  one already-working, already-verified route (Chi sono) at risk for no
  benefit. Reconsider only if a sixth+ singleton makes the duplication itself
  the actual maintenance cost, not before.
- **Build a singleton's `localizedPaths` from its path function
  (`src/sanity/paths.ts`), never from an `alternates`/`translation.metadata`
  projection.** Chi sono's `generateMetadata` passes
  `{ it: aboutPath("it"), en: aboutPath("en") }` directly — no document
  lookup in the chain. This is what a fixed page needs: the URL is already
  known in code, so there's nothing to gain from deriving it via
  `translation.metadata`, and doing so is what caused chi-sono's own
  canonical-resolves-to-"/" bug (silently falls back to `"/"` when that
  metadata document doesn't exist yet — confirmed live: zero
  `translation.metadata` documents exist for any singleton type today, and
  chi-sono's canonical/hreflang are still correct, because they never depend
  on one). Every singleton page must follow this pattern from day one.

## Sanity Studio verification

`/studio` is behind auth (Google/GitHub/email login) — there are no headless
credentials, so a `structure.ts` (desk) change can't be screenshotted or driven
by a browser tool. This is expected, not a bug to work around. Fallback: run the
exact GROQ query the resolver itself uses (e.g. a `parentPillar._ref` lookup for
nested desk items) directly against the dataset via `@sanity/client`, and confirm
the shape matches what the desk tree should show — this proves the data layer,
not rendered pixels. Pair it with a `_rev` snapshot before/after to prove the
verification itself made no writes, then ask the owner to confirm the visual
result once they're logged in.

The working tree is authoritative. Never revert or overwrite existing code that appears intentional without asking — manual edits by the owner are expected.

## Commit conventions

Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`),
one focused commit per approved step, imperative present tense subject line.
