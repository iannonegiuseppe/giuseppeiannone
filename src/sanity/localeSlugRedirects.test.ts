import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { getLocaleSlugRedirects } from "./localeSlugRedirects";
import { SINGLETON_ROUTES } from "./paths";

// Regression guard for a real, already-shipped bug: every fixed singleton
// page answered 200 at FOUR URLs instead of two, because its two literal
// route folders (metodo/ + method/) both live under the `[locale]`
// dynamic segment and neither binds itself to a locale. Search Console
// picked up all 16 wrong URLs. See localeSlugRedirects.ts's own comment.
//
// Nothing about that failure was loud: the pages rendered correctly, the
// canonicals were right, the build passed, the tests passed. The only
// symptom was in a crawler's report weeks later. So the check has to be
// structural — assert the redirects exist for every route that needs one,
// derived from the same array routing itself derives from.

const APP_LOCALE_DIR = path.join(process.cwd(), "src", "app", "[locale]");

function rootSegment(routePath: string, locale: "it" | "en"): string | null {
  const withoutLocale = locale === "en" ? routePath.slice("/en".length) : routePath;
  return withoutLocale.split("/").filter(Boolean)[0] ?? null;
}

// The routes this file is actually about: a fixed singleton whose slug is
// genuinely translated, so it owns two differently-named route folders.
// blog/faq/privacy/cookie-policy translate to themselves (one folder,
// /en/faq is the real English URL) and the homepage owns no segment —
// neither can produce a wrong-locale duplicate, so neither should produce
// a redirect.
const TRANSLATED_SINGLETONS = SINGLETON_ROUTES.map(({ documentType, pathFn }) => ({
  documentType,
  itPath: pathFn("it"),
  enPath: pathFn("en"),
})).filter(
  ({ itPath, enPath }) =>
    itPath !== "/" && enPath.startsWith("/en/") && enPath.slice("/en".length) !== itPath,
);

describe("locale-slug redirects", () => {
  const redirects = getLocaleSlugRedirects();
  const bySource = new Map(redirects.map((r) => [r.source, r]));

  for (const { documentType, itPath, enPath } of TRANSLATED_SINGLETONS) {
    const enUnprefixed = enPath.slice("/en".length);

    describe(documentType, () => {
      it(`redirects the English slug reached without /en (${enUnprefixed} -> ${enPath})`, () => {
        const redirect = bySource.get(enUnprefixed);
        assert.ok(
          redirect,
          `\n"${documentType}" has translated slugs (${itPath} / ${enPath}), so "${enUnprefixed}" ` +
            `renders the ITALIAN page at an English URL — a duplicate. No redirect covers it.\n\n` +
            `Fix: this list is derived from SINGLETON_ROUTES (src/sanity/paths.ts) by ` +
            `getLocaleSlugRedirects() — if this fails, that derivation broke, not the data.`,
        );
        assert.equal(redirect?.destination, enPath);
        assert.equal(redirect?.permanent, true);
      });

      it(`redirects the Italian slug reached under /en (/en${itPath} -> ${itPath})`, () => {
        const redirect = bySource.get(`/en${itPath}`);
        assert.ok(
          redirect,
          `\n"${documentType}" has translated slugs (${itPath} / ${enPath}), so "/en${itPath}" ` +
            `renders the ENGLISH page at an Italian URL — a duplicate. No redirect covers it.`,
        );
        assert.equal(redirect?.destination, itPath);
        assert.equal(redirect?.permanent, true);
      });

      // The redirects only matter because BOTH folders exist and both
      // match both locales. If one is ever deleted (or the pair is
      // replaced by a real dispatcher), this fails and the redirect
      // should be revisited rather than left behind as a stale rule.
      it("has both literal route folders on disk", () => {
        for (const [routePath, locale] of [
          [itPath, "it"],
          [enPath, "en"],
        ] as const) {
          const segment = rootSegment(routePath, locale);
          assert.ok(segment, `${routePath} has no root segment`);
          assert.ok(
            existsSync(path.join(APP_LOCALE_DIR, segment)),
            `\nsrc/app/[locale]/${segment}/ does not exist, but ${documentType} still claims ` +
              `"${routePath}" in SINGLETON_ROUTES.`,
          );
        }
      });
    });
  }

  it("never redirects a URL that is itself a correct route", () => {
    const realPaths = new Set(
      SINGLETON_ROUTES.flatMap(({ pathFn }) => [pathFn("it"), pathFn("en")]),
    );
    for (const { source, destination } of redirects) {
      assert.ok(
        !realPaths.has(source),
        `\n"${source}" is a real singleton route but is being redirected to "${destination}". ` +
          `A redirect that fires before routing would make that page permanently unreachable.`,
      );
    }
  });

  it("emits no redirect for an untranslated slug", () => {
    const untranslated = SINGLETON_ROUTES.map(({ pathFn }) => pathFn("it")).filter(
      (itPath) => itPath !== "/" && !TRANSLATED_SINGLETONS.some((r) => r.itPath === itPath),
    );
    for (const itPath of untranslated) {
      assert.ok(
        !bySource.has(itPath) && !bySource.has(`/en${itPath}`),
        `\n"${itPath}" translates to itself (/en${itPath} IS its real English URL) — ` +
          `redirecting either direction would break a working page.`,
      );
    }
  });

  it("has no duplicate sources", () => {
    assert.equal(bySource.size, redirects.length);
  });
});
