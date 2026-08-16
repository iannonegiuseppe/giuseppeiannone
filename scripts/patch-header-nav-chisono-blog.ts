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

// Header nav restructure pass, revision — owner's corrections to the
// previous round:
//   1. "Blog" (nav-blog) becomes a self-sufficient link, no dropdown: gets
//      its own routeKey ("risorse", the blog index — same route the old
//      "Risorse" child pointed at) and loses its children entirely (both
//      "Risorse" and "Libri" go away as separate submenu items).
//   2. "Libri" moves to "Chi sono" (nav-1) as its own new submenu item —
//      Chi sono keeps its existing routeKey ("chi-sono") AND gains
//      children, the first real "link that's also a submenu parent" on
//      this site (navLink.ts's own schema already supported both fields
//      set together; this is the first content to actually use it).
async function main() {
  const tx = client.transaction();

  tx.patch("headerSettings-it", (p) =>
    p
      .set({ 'navItems[_key=="nav-blog"].routeKey': "risorse", 'navItems[_key=="nav-blog"].linkType': "route" })
      .unset(['navItems[_key=="nav-blog"].children'])
      .set({
        'navItems[_key=="nav-1"].children': [
          { _key: "nav-1-libri", _type: "navLink", customLabel: "Libri", linkType: "route", routeKey: "libri" },
        ],
      }),
  );

  tx.patch("headerSettings-en", (p) =>
    p
      .set({ 'navItems[_key=="nav-blog"].routeKey': "risorse", 'navItems[_key=="nav-blog"].linkType': "route" })
      .unset(['navItems[_key=="nav-blog"].children'])
      .set({
        'navItems[_key=="nav-1"].children': [
          { _key: "nav-1-libri", _type: "navLink", customLabel: "Books", linkType: "route", routeKey: "libri" },
        ],
      }),
  );

  const result = await tx.commit();
  console.log("Patched:", result.results.map((r) => r.id));
}
main().catch(console.error);
