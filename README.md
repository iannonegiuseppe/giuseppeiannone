# Giuseppe Iannone — website

Bilingual (it/en) Next.js + Sanity site for a psychologist-psychotherapist
practice. See [SPEC.md](./SPEC.md) for the project brief and fixed tech
decisions, and [CLAUDE.md](./CLAUDE.md) for working conventions.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site, or
[http://localhost:3000/studio](http://localhost:3000/studio) for the Sanity
Studio. Copy `.env.example` to `.env.local` and fill in real values first
(see that file for what each variable is for).

Full setup docs, environment variable reference, and a manual verification
checklist land in Step 10 of the build — this README is a work in progress
until then.

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

Before running, create a **temporary, write-scoped** Sanity API token
(dashboard → API → Tokens → Add API token, "Editor" permission), set it as
`SANITY_API_WRITE_TOKEN` in `.env.local`, then **delete the token again**
once the script has finished — it's not meant to be a long-lived credential
sitting in `.env.local`.

The script is **idempotent**: every document uses a deterministic `_id`
(`homePage-it`, `pillarPage-anxiety-en`, `faqItem-2-it`, etc.), created via
`createOrReplace`, so re-running it is always safe and just re-applies the
same content. It also links each it/en pair with its own
`translation.metadata` document (matching what
`@sanity/document-internationalization` expects) and uploads one shared
placeholder image (looked up by filename first, so it's only uploaded
once across runs).
