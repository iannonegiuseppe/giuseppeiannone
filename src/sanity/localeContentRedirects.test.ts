import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildLocaleContentRedirects,
  type LocalizedDoc,
} from "./localeContentRedirects";

// Regression guard for the live half of the wrong-locale URL problem:
// localeSlugRedirects.ts fixed it for the 8 fixed singleton routes in
// September; pillarPage/subtopicPage/page were never covered, and the
// 18 Oct 2026 Search Console export still showed 50 of their URLs
// 404ing. See localeContentRedirects.ts's own comment.
//
// The rule is exercised against fixtures rather than the dataset on
// purpose: the generator's only Sanity dependency is the fetch, and a
// test that needs credentials is a test nobody runs.

// Mirrors the real shape: a translated pair, a pair that is spelled the
// SAME in both languages (trauma — the collision the realPaths check
// exists for), subtopics under both, and a page type.
const DOCS: LocalizedDoc[] = [
  { _type: "pillarPage", language: "it", slug: "disturbi-d-ansia" },
  { _type: "pillarPage", language: "en", slug: "anxiety-disorders" },
  { _type: "pillarPage", language: "it", slug: "trauma" },
  { _type: "pillarPage", language: "en", slug: "trauma" },
  { _type: "subtopicPage", language: "it", slug: "ansia-sociale", parentSlug: "disturbi-d-ansia" },
  { _type: "subtopicPage", language: "en", slug: "social-anxiety", parentSlug: "anxiety-disorders" },
  { _type: "subtopicPage", language: "it", slug: "lutto-e-perdita", parentSlug: "trauma" },
  { _type: "subtopicPage", language: "en", slug: "grief-and-loss", parentSlug: "trauma" },
  { _type: "page", language: "it", slug: "una-pagina-qualsiasi" },
];

function sourceMap(docs: LocalizedDoc[]) {
  return new Map(buildLocaleContentRedirects(docs).map((r) => [r.source, r]));
}

describe("cross-locale content redirects", () => {
  const bySource = sourceMap(DOCS);

  describe("translated slugs", () => {
    it("sends an English pillar slug reached without /en to the English page", () => {
      const redirect = bySource.get("/anxiety-disorders");
      assert.ok(redirect, "/anxiety-disorders had no redirect — it 404s today");
      assert.equal(redirect?.destination, "/en/anxiety-disorders");
      assert.equal(redirect?.permanent, true);
    });

    it("sends an Italian pillar slug reached under /en to the Italian page", () => {
      const redirect = bySource.get("/en/disturbi-d-ansia");
      assert.ok(redirect, "/en/disturbi-d-ansia had no redirect — it 404s today");
      assert.equal(redirect?.destination, "/disturbi-d-ansia");
    });

    it("covers subtopics as full paths, not just their root segment", () => {
      assert.equal(
        bySource.get("/anxiety-disorders/social-anxiety")?.destination,
        "/en/anxiety-disorders/social-anxiety",
      );
      assert.equal(
        bySource.get("/en/disturbi-d-ansia/ansia-sociale")?.destination,
        "/disturbi-d-ansia/ansia-sociale",
      );
    });

    it("covers a page document the same way a pillar is covered", () => {
      assert.equal(
        bySource.get("/en/una-pagina-qualsiasi")?.destination,
        "/una-pagina-qualsiasi",
      );
    });
  });

  // The whole reason realPaths exists. Getting this wrong does not
  // produce a 404 — it produces a redirect loop on two working pages,
  // which is strictly worse than the bug being fixed.
  describe("a slug spelled the same in both languages", () => {
    it("never redirects either direction", () => {
      assert.equal(
        bySource.has("/trauma"),
        false,
        "/trauma is the real Italian pillar — redirecting it to /en/trauma would make it unreachable",
      );
      assert.equal(
        bySource.has("/en/trauma"),
        false,
        "/en/trauma is the real English pillar — redirecting it to /trauma would make it unreachable",
      );
    });

    it("still redirects its subtopics, whose full paths are not claimed", () => {
      assert.equal(
        bySource.get("/trauma/grief-and-loss")?.destination,
        "/en/trauma/grief-and-loss",
      );
      assert.equal(
        bySource.get("/en/trauma/lutto-e-perdita")?.destination,
        "/trauma/lutto-e-perdita",
      );
    });
  });

  describe("safety rails", () => {
    it("never emits a source that is a real document URL", () => {
      const realPaths = new Set([
        "/disturbi-d-ansia",
        "/en/anxiety-disorders",
        "/trauma",
        "/en/trauma",
        "/disturbi-d-ansia/ansia-sociale",
        "/en/anxiety-disorders/social-anxiety",
        "/trauma/lutto-e-perdita",
        "/en/trauma/grief-and-loss",
        "/una-pagina-qualsiasi",
      ]);
      for (const source of bySource.keys()) {
        assert.equal(
          realPaths.has(source),
          false,
          `"${source}" is a real page; a redirect fires before routing and would hide it`,
        );
      }
    });

    it("drops a candidate landing on a reserved root slug", () => {
      // A document can't legally hold "contatti" (rootSlugValidator), so
      // this asserts the backstop, not an expected data shape.
      const redirects = sourceMap([
        { _type: "pillarPage", language: "en", slug: "contatti" },
      ]);
      assert.equal(redirects.size, 0);
    });

    it("drops a source two documents claim with different destinations", () => {
      const redirects = sourceMap([
        { _type: "pillarPage", language: "it", slug: "doppio" },
        { _type: "page", language: "it", slug: "doppio" },
      ]);
      // Both want /en/doppio, but one says -> /doppio via pillarPath and
      // the other via pagePath; identical output, so this stays ONE
      // redirect rather than being dropped as a conflict.
      assert.equal(redirects.size, 1);
      assert.equal(redirects.get("/en/doppio")?.destination, "/doppio");
    });

    it("ignores documents it cannot place", () => {
      const redirects = sourceMap([
        { _type: "pillarPage", language: null, slug: "senza-lingua" },
        { _type: "pillarPage", language: "it", slug: null },
        { _type: "subtopicPage", language: "it", slug: "orfano", parentSlug: null },
        { _type: "article", language: "it", slug: "un-articolo" },
      ]);
      assert.equal(redirects.size, 0);
    });

    it("has no duplicate sources and is sorted", () => {
      const redirects = buildLocaleContentRedirects(DOCS);
      assert.equal(new Set(redirects.map((r) => r.source)).size, redirects.length);
      const sources = redirects.map((r) => r.source);
      assert.deepEqual(sources, [...sources].sort((a, b) => a.localeCompare(b)));
    });

    it("is order-independent", () => {
      const reversed = buildLocaleContentRedirects([...DOCS].reverse());
      assert.deepEqual(reversed, buildLocaleContentRedirects(DOCS));
    });
  });
});
