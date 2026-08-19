import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NAV_ROUTE_KEYS, SINGLETON_ROUTES } from "./paths";
import { PINNED_SINGLETON_PAGES } from "./structure";

// Completeness test — the fix for a real, already-happened failure:
// chiSonoSection went unreachable from the desk for a stretch after the
// type went live, because nobody added its row back to structure.ts (see
// that file's own "chiSonoSection correction" comment). sitemap.ts had the
// same shape of bug independently (five singleton types with no sitemap
// query, one that postdated the file entirely) — see this file's sibling
// fix in src/app/sitemap.ts. Both were silent: nothing failed, nothing
// crashed, a page just quietly wasn't reachable from where an editor or a
// crawler would look for it.
//
// SINGLETON_ROUTES (paths.ts) is the source of truth this test checks
// everything else against, not the other way around — it's what routing
// itself derives from (singletonPathFns), so a type not in it isn't a
// real routable singleton page in the first place.
//
// NAV_ROUTE_KEYS is checked by pathFn REFERENCE equality, not by string
// key — the two arrays don't share a naming scheme (SINGLETON_ROUTES
// keys by Sanity document type, e.g. "chiSonoSection"; NAV_ROUTE_KEYS
// keys by route slug, e.g. "chi-sono"), but they DO share the exact same
// imported path function for a given route (aboutPath, methodPath, etc.),
// so that's the one thing that reliably ties one array's row to the
// other's.
//
// PINNED_SINGLETON_PAGES is structure.ts's own exported data — not a
// parse of the S.list()/S.listItem() builder tree itself (those build
// opaque Sanity Studio objects, not inspectable data — parsing them would
// mean re-implementing enough of the structure builder's own internals to
// walk .items()). structure.ts's actual desk tree is now BUILT from this
// exact array (see that file's own comment), so checking the array is
// checking the tree by construction, not by trusting the two stay in
// sync — there's only one list now, not two.
describe("every SINGLETON_ROUTES entry (src/sanity/paths.ts) is reachable everywhere a fixed page needs to be", () => {
  for (const route of SINGLETON_ROUTES) {
    describe(route.documentType, () => {
      it("has a NAV_ROUTE_KEYS entry", () => {
        const navEntry = NAV_ROUTE_KEYS.find((entry) => entry.pathFn === route.pathFn);
        assert.ok(
          navEntry,
          `\n"${route.documentType}" is registered in SINGLETON_ROUTES (src/sanity/paths.ts) ` +
            `but has no matching entry in NAV_ROUTE_KEYS in that same file — a header/footer nav ` +
            `link can never be pointed at this page's route until one exists.\n\n` +
            `Fix: add this to the NAV_ROUTE_KEYS array in src/sanity/paths.ts —\n` +
            `  { key: "<url-safe-route-key>", studioLabel: "<English label, Studio UI>", ` +
            `pathFn: <the same path function "${route.documentType}" uses in SINGLETON_ROUTES> }`,
        );
      });

      it("has a row in the Studio desk structure", () => {
        const structureEntry = PINNED_SINGLETON_PAGES.find(
          (page) => page.documentType === route.documentType,
        );
        assert.ok(
          structureEntry,
          `\n"${route.documentType}" is registered in SINGLETON_ROUTES (src/sanity/paths.ts) ` +
            `but has no matching row in PINNED_SINGLETON_PAGES in src/sanity/structure.ts — an ` +
            `editor has no way to reach this document from the Studio desk. This is the exact ` +
            `failure that already happened once for real, for chiSonoSection.\n\n` +
            `Fix: add this to the PINNED_SINGLETON_PAGES array in src/sanity/structure.ts —\n` +
            `  { documentType: "${route.documentType}", title: "<label shown in the desk>", ` +
            `group: "pages" | "blog" }`,
        );
      });
    });
  }
});
