# WordPress → Sanity migration — follow-up notes

## Retry of the 4 Stage C failures

Stage C's full run (468 posts) landed 464 on the first pass; 4 posts failed
with transient WordPress-side errors (`fetch failed` / `503`), not
conversion bugs. They were re-run afterward with no code changes
(`WP_TEST_IDS=4814,4306,4020,4016`):

| WP ID | First attempt | Retry |
|---|---|---|
| 4814 | FAILED — fetch failed | OK |
| 4306 | FAILED — WP 503 | OK |
| 4020 | FAILED — fetch failed | OK |
| 4016 | FAILED — fetch failed | OK |

All 4 succeeded on retry. **468/468 WordPress posts are now imported.**
`failures.json` in this directory still reflects the original Stage C run
and lists these 4 as failed — that's the as-run report, kept as-is rather
than edited after the fact. Treat it as historical; the current true state
is 0 failures.

## Possible duplicate: WP posts 5049 and 5122

While checking two unrelated numeric-slug posts (4466, 4023) for
duplication, found that WP posts **5049** and **5122** share the exact
same title — *"In quante sedute di psicoterapia starò meglio?"* — and their
bodies are ~94% identical by word-overlap (Jaccard similarity), starting
with the same opening paragraph. Published dates: 5049 on 2026-03-22,
5122 on 2026-05-11 (about 7 weeks apart).

Both were imported as separate articles (`article-5049`, `article-5122`).
This is a content decision, not a migration bug — flagging it here rather
than acting on it. Giuseppe should decide whether to keep both, consolidate,
or unpublish one.
