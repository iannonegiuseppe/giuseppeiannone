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

Pages that fetch from Sanity must tag their `fetch` calls to match:
``fetch(url, { next: { tags: [type, `${type}:${slug}`] } })``. Step 9 wires
this up on the actual proof-of-pipeline pages.
