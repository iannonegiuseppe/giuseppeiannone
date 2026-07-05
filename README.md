# Giuseppe Iannone — website

Bilingual (it/en) Next.js + Sanity site for a psychologist-psychotherapist
practice. See [SPEC.md](./SPEC.md) for the project brief and fixed tech
decisions, and [CLAUDE.md](./CLAUDE.md) for working conventions.

## Getting started

Prerequisites: Node ≥24.14.0 (see `.nvmrc`), npm, and a Sanity project you
have API access to.

```bash
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site (Italian,
default/unprefixed), [http://localhost:3000/en](http://localhost:3000/en)
for English, or [http://localhost:3000/studio](http://localhost:3000/studio)
for the Sanity Studio.

## Environment variables

All variables are declared in `.env.example`; copy it to `.env.local` and
fill in real values there (`.env.local` is gitignored).

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Everything | Public — exposed to the browser (Studio + client reads). |
| `NEXT_PUBLIC_SANITY_DATASET` | Everything | Defaults to `production`. Public, same reason as above. |
| `SANITY_API_READ_TOKEN` | Server-side reads | Server-only. Used by `src/sanity/client.ts` for authenticated/draft reads. |
| `SANITY_REVALIDATE_SECRET` | The revalidation webhook | Must match the secret configured on the Sanity webhook — see below. |
| `NEXT_PUBLIC_ENABLE_INDEXING` | Controlling search visibility | Defaults to unset (= hidden). Set to `"true"` only when ready to let the site be indexed — see `src/app/robots.ts` and `src/sanity/metadata.ts`. |
| `SANITY_API_WRITE_TOKEN` | `npm run seed` only | **Temporary** — see [Temporary tokens](#temporary-tokens) below. Not needed for normal dev/build. |

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) at `localhost:3000`. |
| `npm run build` | Production build. Also runs the TypeScript check. |
| `npm run start` | Serve the production build (run `build` first). |
| `npm run lint` | ESLint. |
| `npm run seed` | Seed demo content into Sanity — see [Seeding demo content](#seeding-demo-content). |

## Project structure

```text
sanity.config.ts, sanity.cli.ts   Sanity Studio config (root, so the CLI finds them)
scripts/seed.ts                   Idempotent demo-content seed script

src/
  app/
    [locale]/                     Localized site (it unprefixed, en under /en)
      layout.tsx                  Root layout for the site: <html lang>, fonts,
                                   NextIntlClientProvider, generateStaticParams,
                                   site-wide metadata/robots default
      page.tsx                    Homepage — fetches Sanity's homePage doc
      [pillarSlug]/page.tsx       Pillar (topic hub) page
      [pillarSlug]/[subtopicSlug]/page.tsx   Subtopic page
    studio/                       Embedded Sanity Studio at /studio — its own
                                   root layout (outside next-intl entirely)
    api/revalidate/route.ts       Sanity webhook handler (tag-based ISR)
    robots.ts                     robots.txt, gated by NEXT_PUBLIC_ENABLE_INDEXING
  proxy.ts                        next-intl locale routing (Next.js 16 renamed
                                   the "middleware" file convention to "proxy")
  i18n/                           next-intl routing/navigation/request config
  styles/                         _tokens.scss, _mixins.scss (design-token layer)
  sanity/
    client.ts                     Typed read client (useCdn: false)
    image.ts                      Sanity image URL builder
    queries.ts                    GROQ queries (with the shared body projection
                                   that expands reference-bearing custom blocks)
    portableTextComponents.tsx    Server-side renderers for every custom block
    metadata.ts                   robots.index resolution (site toggle + per-doc noIndex)
    structure.ts                  Custom desk structure + singleton/locationPage
                                   protection sets (SINGLETON_TYPES, PROTECTED_TYPES,
                                   TRANSLATABLE_TYPES)
    components/
      SlugLockedAfterPublish.tsx  Custom slug input: read-only once published
    schemaTypes/
      documents/                  One file per document type
      objects/                    Reusable objects + the restricted Portable Text schema
      lib/                        Shared field helpers (e.g. languageField)

messages/it.json, messages/en.json   next-intl UI-chrome strings (currently
                                      empty — all page content lives in Sanity)
```

## Sanity webhook (content revalidation)

Publishing a document in Sanity should invalidate the corresponding cached
page(s) via `src/app/api/revalidate/route.ts`. To wire this up:

1. In the Sanity project dashboard, go to **API → Webhooks → Create webhook**.
2. **URL**: `https://<your-deployed-domain>/api/revalidate`
3. **Dataset**: the dataset this project uses (`production` by default).
4. **Trigger on**: Create, Update, Delete (all three — deletions need to
   invalidate cached pages too).
5. **Filter**: leave as `true` (all document types) unless you want to
   exclude something like `translation.metadata`.
6. **Projection** — this determines the JSON payload the route handler
   receives, and it must match what the handler expects:

   ```groq
   {
     "_type": _type,
     "slug": slug
   }
   ```

   (Documents without a `slug` field, like the singleton pages, will just
   omit it — the handler only revalidates the type-wide tag for those.)
7. **Secret**: generate a random string and set it as both the webhook's
   secret in the Sanity dashboard *and* the `SANITY_REVALIDATE_SECRET`
   environment variable on your deployment (Vercel project settings) —
   they must match exactly.
8. **HTTP method**: POST. **API version**: leave default.

### How the handler verifies requests

The route uses `next-sanity/webhook`'s `parseBody`, which internally calls
`@sanity/webhook`'s `isValidSignature` against the raw request body and the
`sanity-webhook-signature` header — never a hand-rolled comparison, and
never a plaintext secret check. A missing or invalid signature returns
`401` immediately. The eventual-consistency wait that `parseBody` offers is
deliberately skipped (`waitForContentLakeEventualConsistency: false`): the
handler only calls `revalidateTag`, it doesn't re-query Sanity within the
same request, so there's nothing that needs replication to catch up to.

### Tag scheme

Every change revalidates the **type-wide tag** (e.g. `article`), always —
this is deliberately broad rather than clever. It also covers cases that
don't get their own targeted invalidation yet: a document referenced
elsewhere (`relatedTopics`, `faqBlock`, `conditionCard`/`treatmentCard`,
`subtopicPage`'s parent pillar reference) can change without the page that
*embeds* it receiving its own webhook event, and an it/en translation pair
are separate documents that each fire their own event. Over-revalidating
one extra tag is cheap; a stale page is not.

When there's a slug (`locationPage`, `pillarPage`, `subtopicPage`,
`article`, `service`), a **document-specific tag** is also revalidated
(`${_type}:${slug}`), for pages that only need to know about that one
document changing.

**Future refinement**: per-reference invalidation (e.g. revalidating only
the specific pillar pages that embed a changed `faqItem` via `faqBlock`,
instead of every page tagged with that type) would need either a GROQ
back-reference query in the webhook handler or a dedicated "referenced by"
index — not implemented yet; the type-wide tag is the correctness
fallback until that's worth the complexity.

Pages that fetch from Sanity tag their `client.fetch` calls to match:
``client.fetch(query, params, { next: { tags: [type, `${type}:${slug}`] } })``
— see `src/app/[locale]/page.tsx`, `[pillarSlug]/page.tsx`, and
`[pillarSlug]/[subtopicSlug]/page.tsx`.

## Seeding demo content

`scripts/seed.ts` (`npm run seed`) creates the minimal content needed to
prove the Sanity → Next.js pipeline end to end: `siteSettings`, `homePage`
(it/en), one pillar (`disturbi-d-ansia` / `anxiety-disorders`), one subtopic
(`attacchi-di-panico` / `panic-attacks`), and 3 `faqItem`s — exercising
every custom Portable Text block (H2/H3, key takeaways, FAQ block, related
topics, an image with alt) in both locales.

**The pillar/subtopic body copy is deliberately, obviously fake**
(`[IT segnaposto — H2]`, lorem-ipsum-style filler, `[EN placeholder — H2]`,
etc.) — never plausible clinical prose. This is a YMYL health site; real
copy goes through the doctor's review workflow later, not through a seed
script.

Run it:

```bash
npm run seed
```

This requires `SANITY_API_WRITE_TOKEN` — see [Temporary tokens](#temporary-tokens).

The script is **idempotent**: every document uses a deterministic `_id`
(`homePage-it`, `pillarPage-anxiety-en`, `faqItem-2-it`, etc.), created via
`createOrReplace`, so re-running it is always safe and just re-applies the
same content. It also links each it/en pair with its own
`translation.metadata` document (matching what
`@sanity/document-internationalization` expects) and uploads one shared
placeholder image (looked up by filename first, so it's only uploaded
once across runs).

## Temporary tokens

`npm run seed` needs a Sanity API token with write access
(`SANITY_API_WRITE_TOKEN`) — the normal `SANITY_API_READ_TOKEN` used by the
running site is deliberately read-only and must stay that way.

Every time you need to (re-)run the seed script:

1. Sanity dashboard → project → **API → Tokens → Add API token**.
2. Name it something identifiable (e.g. `seed-script-temp`), permission
   **Editor**.
3. Paste it into `.env.local` as `SANITY_API_WRITE_TOKEN`.
4. Run `npm run seed`.
5. **Delete the token** from the Sanity dashboard, and clear the value from
   `.env.local`.

Don't leave a write-capable token sitting in `.env.local` (or anywhere else)
between runs — create it, use it, revoke it, every time. This applies to
any future one-off script that needs write access too, not just this one.

## For the content editor

This section is intentionally short — it'll grow into full handover
material once real page design/content lands. For now:

- **Log in** at `/studio` (e.g. `https://<the-live-domain>/studio`) with the
  account the developer invited you with.
- **Where things live**: the left-hand menu is grouped into **Pages**,
  **Knowledge Base**, **Blog**, **FAQ**, and **Settings**. Site-wide pages
  (Home, About, Method, Pricing, Contact) and Settings are single fixed
  documents — you edit them directly, there's no "create a new one."
- **Italian first, then English**: create and publish the Italian version
  of a page first. Once published, open its **Translations** menu (in the
  document toolbar) to create the English version — English is only
  reachable that way, not from the main "+ Create" button, so an Italian
  and English page can never accidentally end up unpaired.
- **Why the URL (slug) field locks**: once a page has been published, its
  slug becomes read-only. This is deliberate — changing a published page's
  URL breaks links and search rankings. If a live page's URL genuinely
  needs to change, ask the developer.

## Stage 1 (foundation) verification checklist

What "done" means for this stage — see [SPEC.md](./SPEC.md) for the full
brief. Re-run this after any change to the foundation layer.

- [ ] `npm run dev` starts cleanly, no errors in the terminal.
- [ ] `/` resolves (Italian, unprefixed) and `/en` resolves (English,
      prefixed); each shows its own title/body and a `noindex` robots tag
      while `NEXT_PUBLIC_ENABLE_INDEXING` is unset.
- [ ] `/studio` opens, shows the five desk structure groups (Pages,
      Knowledge Base, Blog, FAQ, Settings), and the guardrails hold:
      singletons and Locations have no Delete/Duplicate and don't appear in
      "+ Create"; translatable types offer only Italiano/English creation
      templates (no bare, language-less option); a published document's
      slug is locked, a fresh draft's isn't.
- [ ] Editing and publishing a demo document, then firing the Sanity
      webhook, revalidates the corresponding page (content changes without
      a rebuild).
- [ ] `npm run build` succeeds; `npx tsc --noEmit`, `npm run lint`, and
      `npx sanity schemas validate` are all clean.
