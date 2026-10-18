import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCrossLocaleArticleRedirects } from "./buildTimeRedirects";
import wordpressArticleSlugs from "./wordpressArticleSlugs.json";

// Guards the /en/blog/{italian-slug} pass. 477 of the 540 URLs in the
// 18 Oct 2026 Coverage export are these, and the thing that can go wrong
// is not "a redirect is missing" — it is the opposite: a redirect that
// swallows one of the five real English articles whose slug happens to
// be Italian. See getCrossLocaleArticleRedirects's own comment.

const SNAPSHOT: readonly string[] = wordpressArticleSlugs;

describe("cross-locale article redirects", () => {
  it("sends an Italian slug under /en/blog to the Italian article", () => {
    const [redirect, ...rest] = buildCrossLocaleArticleRedirects(
      ["amico-o-psicologo"],
      new Set(),
    );
    assert.equal(rest.length, 0);
    assert.deepEqual(redirect, {
      source: "/en/blog/amico-o-psicologo",
      destination: "/blog/amico-o-psicologo",
      permanent: true,
    });
  });

  // The one that matters. A real English article lives at
  // /en/blog/{its own Italian-looking slug}; redirecting that URL takes
  // a published page off the site.
  it("never redirects a slug a real English article occupies", () => {
    const redirects = buildCrossLocaleArticleRedirects(
      ["amico-o-psicologo", "paura-del-coronavirus"],
      new Set(["paura-del-coronavirus"]),
    );
    assert.deepEqual(
      redirects.map((r) => r.source),
      ["/en/blog/amico-o-psicologo"],
    );
  });

  it("emits nothing when every slug is claimed", () => {
    assert.deepEqual(buildCrossLocaleArticleRedirects(["a", "b"], new Set(["a", "b"])), []);
  });

  it("deduplicates and sorts", () => {
    const redirects = buildCrossLocaleArticleRedirects(["b", "a", "b"], new Set());
    assert.deepEqual(redirects.map((r) => r.source), ["/en/blog/a", "/en/blog/b"]);
  });

  describe("against the frozen snapshot", () => {
    const redirects = buildCrossLocaleArticleRedirects(SNAPSHOT, new Set());

    it("covers every slug in it", () => {
      assert.equal(redirects.length, SNAPSHOT.length);
    });

    it("only ever claims the /en/blog namespace", () => {
      for (const { source, destination } of redirects) {
        assert.ok(source.startsWith("/en/blog/"), `${source} escapes /en/blog`);
        assert.ok(destination.startsWith("/blog/"), `${destination} escapes /blog`);
      }
    });

    // /en/blog/page/2..18 are in the same Coverage report and are
    // DELIBERATELY left to 404: there is one page of English articles
    // today, and publishing more makes those URLs real. A slug that
    // collided with them would quietly break pagination later.
    it("never shadows blog pagination", () => {
      for (const { source } of redirects) {
        assert.ok(
          !source.startsWith("/en/blog/page/"),
          `${source} would shadow a pagination URL that must stay routable`,
        );
      }
    });
  });
});
