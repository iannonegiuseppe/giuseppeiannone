import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN.");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

// Header nav restructure pass — owner's brief: seven top-level items,
// nothing cut (Chi sono · Metodo · Aree ▾ · Prezzi · Blog ▾ · FAQ ·
// Contatti). Two content changes, both locales:
//   1. "Aree" (nav-3): drop its old single placeholder child ("Ansia")
//      and flip isPillarTaxonomy on — its real content now comes from the
//      live pillar/subtopic query (src/sanity/areaTaxonomy.ts), not a
//      second CMS-typed copy.
//   2. Insert a new "Blog" grouping item between Prezzi (nav-4) and FAQ
//      (nav-5), holding the two items the brief asked for: the blog index
//      and Libri. "Blog" itself is deliberately NOT translated in the EN
//      document either — same established convention as the URL itself
//      (paths.ts's own articlesPath comment: "blog isn't translated").
//      The two children reuse the EXACT labels the footer's own nav
//      already uses for the same two routes (fnav-5/fnav-libri) rather
//      than inventing new copy.
async function main() {
  const tx = client.transaction();

  tx.patch("headerSettings-it", (p) =>
    p
      .unset(['navItems[_key=="nav-3"].children'])
      .set({ 'navItems[_key=="nav-3"].isPillarTaxonomy': true })
      .insert("before", 'navItems[_key=="nav-5"]', [
        {
          _key: "nav-blog",
          _type: "navLink",
          customLabel: "Blog",
          children: [
            { _key: "nav-blog-1", _type: "navLink", customLabel: "Risorse", linkType: "route", routeKey: "risorse" },
            { _key: "nav-blog-2", _type: "navLink", customLabel: "Libri", linkType: "route", routeKey: "libri" },
          ],
        },
      ]),
  );

  tx.patch("headerSettings-en", (p) =>
    p
      .unset(['navItems[_key=="nav-3"].children'])
      .set({ 'navItems[_key=="nav-3"].isPillarTaxonomy': true })
      .insert("before", 'navItems[_key=="nav-5"]', [
        {
          _key: "nav-blog",
          _type: "navLink",
          customLabel: "Blog",
          children: [
            { _key: "nav-blog-1", _type: "navLink", customLabel: "Resources", linkType: "route", routeKey: "risorse" },
            { _key: "nav-blog-2", _type: "navLink", customLabel: "Books", linkType: "route", routeKey: "libri" },
          ],
        },
      ]),
  );

  const result = await tx.commit();
  console.log("Patched:", result.results.map((r) => r.id));
}
main().catch(console.error);
