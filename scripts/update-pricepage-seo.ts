import { createClient } from "@sanity/client";

// /prezzi SEO pass — leaf-path patch only (seo.metaTitle/seo.metaDescription),
// never touching the rest of the seo object or the document.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  await client
    .patch("pricePage-it")
    .set({
      "seo.metaTitle": "Tariffe — psicologo e psicoterapeuta a Milano, Monza e Cernusco",
      "seo.metaDescription":
        "Seduta individuale 100 € (45 minuti), terapia di coppia 130 € (60 minuti). Stessa tariffa nei due studi di Milano, a Monza, a Cernusco sul Naviglio e online. Pagamento a fine seduta, ricevuta sempre rilasciata, detrazione del 19% sui pagamenti tracciabili.",
    })
    .commit();
  console.log("pricePage-it: seo.metaTitle/seo.metaDescription set");

  await client
    .patch("pricePage-en")
    .set({
      "seo.metaTitle": "Fees — English-speaking psychotherapist in Milan and Monza",
      "seo.metaDescription":
        "Individual session €100 (45 minutes), couples therapy €130 (60 minutes). The same fee at both Milan studios, in Monza, in Cernusco sul Naviglio and online. Payment at the end of each session, receipt always issued.",
    })
    .commit();
  console.log("pricePage-en: seo.metaTitle/seo.metaDescription set");
}

main();
