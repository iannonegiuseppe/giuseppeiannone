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

// Owner's decision (footer Explore column, next to Risorse, not the
// header) — inserted right after the existing "risorse" (routeKey)
// entry in both locales' footerSettings.navItems, same navLink object
// shape every other entry already uses.
async function main() {
  const tx = client.transaction();

  tx.patch("footerSettings-it", (p) =>
    p.insert("after", 'navItems[_key=="fnav-5"]', [
      { _key: "fnav-libri", _type: "navLink", customLabel: "Libri", linkType: "route", routeKey: "libri" },
    ]),
  );
  tx.patch("footerSettings-en", (p) =>
    p.insert("after", 'navItems[_key=="fnav-5"]', [
      { _key: "fnav-libri", _type: "navLink", customLabel: "Books", linkType: "route", routeKey: "libri" },
    ]),
  );

  const result = await tx.commit();
  console.log("Patched:", result.results.map((r) => r.id));
}
main().catch(console.error);
