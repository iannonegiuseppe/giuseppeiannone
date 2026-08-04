import { createClient } from "@sanity/client";
import { RESERVED_ROOT_SLUGS } from "../src/sanity/reservedSlugs";
import wordpressArticleSlugs from "../src/sanity/wordpressArticleSlugs.json";

// Root-namespace pass — on-demand audit of everything that can contend
// for a root-level URL (/{slug} in IT, /en/{slug} in EN).
//
// This exists because server logs and build logs are not a safety layer
// nobody reads them until after the damage. This is the checkable one:
// run it whenever you want to know the namespace is still clean.
//
// Run: npx tsx -r dotenv/config scripts/audit-root-slug-collisions.ts dotenv_config_path=.env.local
//
// Exits non-zero if anything is found, so it can be wired into CI later
// without modification.
//
// WHAT CONTENDS, and what deliberately does not:
//
//   pillarPage  — /{slug}          contends
//   page        — /{slug}          contends (type may not exist yet; empty is fine)
//   WP redirect — /{slug} -> /blog/{slug}, IT root only, from the frozen
//                 snapshot. Contends because redirects run BEFORE routing,
//                 so a matching redirect makes the document unreachable.
//
//   subtopicPage — DOES NOT CONTEND. Subtopics live at /{pillar}/{subtopic},
//                 two segments; a one-segment root slug can never collide
//                 with one. Auditing them here would report collisions that
//                 cannot occur. Excluded on purpose, not by oversight.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}

const client = createClient({
  projectId,
  dataset,
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: "2026-07-05",
  useCdn: false,
});

interface RootDoc {
  _id: string;
  _type: string;
  language: string | null;
  slug: string | null;
  title: string | null;
}

interface Problem {
  kind: string;
  detail: string;
}

function urlFor(language: string, slug: string): string {
  return language === "it" ? `/${slug}` : `/${language}/${slug}`;
}

async function main() {
  const docs = await client.fetch<RootDoc[]>(
    `*[_type in ["pillarPage", "page"] && defined(slug.current)]{
      _id, _type, language, title, "slug": slug.current
    }`,
  );

  const problems: Problem[] = [];

  // --- 1. Cross-type / duplicate collisions, scoped per locale ---------
  // Per-locale because it/en are separate documents at separate URLs:
  // an IT page "il-mio-libro" and an EN page "il-mio-libro" are
  // /il-mio-libro and /en/il-mio-libro — different URLs, not a collision.
  const byLocaleSlug = new Map<string, RootDoc[]>();
  for (const doc of docs) {
    if (!doc.slug || !doc.language) continue;
    const key = `${doc.language}::${doc.slug}`;
    const bucket = byLocaleSlug.get(key);
    if (bucket) bucket.push(doc);
    else byLocaleSlug.set(key, [doc]);
  }

  for (const [key, group] of byLocaleSlug) {
    if (group.length < 2) continue;
    const [language = "", slug = ""] = key.split("::");
    const who = group.map((d) => `${d._type} ${d._id} ("${d.title ?? ""}")`).join(" vs ");
    problems.push({
      kind: "ROOT SLUG CLAIMED TWICE",
      detail: `${urlFor(language, slug)} — ${who}`,
    });
  }

  // --- 2. Reserved-list collisions -------------------------------------
  for (const doc of docs) {
    if (!doc.slug || !doc.language) continue;
    if (RESERVED_ROOT_SLUGS.has(doc.slug.toLowerCase())) {
      problems.push({
        kind: "RESERVED ROUTE",
        detail: `${urlFor(doc.language, doc.slug)} — ${doc._type} ${doc._id} ("${doc.title ?? ""}") uses a reserved site address`,
      });
    }
  }

  // --- 3. WordPress redirect shadowing ---------------------------------
  // IT only: redirect sources are unprefixed, so an EN document at
  // /en/{slug} is never shadowed by one.
  const wpSlugs = new Set<string>(wordpressArticleSlugs);
  for (const doc of docs) {
    if (!doc.slug || doc.language !== "it") continue;
    if (wpSlugs.has(doc.slug)) {
      problems.push({
        kind: "SHADOWED BY WP REDIRECT",
        detail: `/${doc.slug} — ${doc._type} ${doc._id} ("${doc.title ?? ""}") collides with a frozen WordPress redirect. next.config.ts drops that redirect so the document wins; the article stays at /blog/${doc.slug}.`,
      });
    }
  }

  // Reserved slugs inside the frozen WP snapshot itself.
  const reservedWpSlugs = [...wpSlugs].filter((s) => RESERVED_ROOT_SLUGS.has(s.toLowerCase()));
  for (const slug of reservedWpSlugs) {
    problems.push({
      kind: "WP REDIRECT ON RESERVED ROUTE",
      detail: `/${slug} — a frozen WordPress redirect targets a reserved site address. next.config.ts drops it.`,
    });
  }

  // --- Report ----------------------------------------------------------
  const itDocs = docs.filter((d) => d.language === "it").length;
  const enDocs = docs.filter((d) => d.language === "en").length;

  console.log("Root-namespace slug audit");
  console.log("=========================");
  console.log(`Root-level documents:  ${docs.length} (it: ${itDocs}, en: ${enDocs})`);
  console.log(`  pillarPage:          ${docs.filter((d) => d._type === "pillarPage").length}`);
  console.log(`  page:                ${docs.filter((d) => d._type === "page").length}`);
  console.log(`Frozen WP redirects:   ${wpSlugs.size}`);
  console.log(`Reserved slugs:        ${RESERVED_ROOT_SLUGS.size}`);
  console.log(`Subtopics:             not audited (two-segment URLs cannot collide — by design)`);
  console.log("");

  if (problems.length === 0) {
    console.log("No collisions found.");
    return;
  }

  console.log(`${problems.length} problem(s) found:\n`);
  for (const p of problems) {
    console.log(`  [${p.kind}] ${p.detail}`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
