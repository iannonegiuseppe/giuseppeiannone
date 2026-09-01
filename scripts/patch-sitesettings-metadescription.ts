import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const IT_DESC =
  "Psicologo psicoterapeuta a Milano, Monza e Cernusco sul Naviglio e online. Mi occupo di ansia e attacchi di panico.";
const EN_DESC =
  "Psychologist and psychotherapist in Milan, Monza and Cernusco sul Naviglio, and online. I work with anxiety and panic attacks.";

async function main() {
  const tx = client.transaction();
  tx.patch("siteSettings-it", (p) => p.set({ "seo.metaDescription": IT_DESC }));
  tx.patch("siteSettings-en", (p) => p.set({ "seo.metaDescription": EN_DESC }));
  const result = await tx.commit();
  console.log("committed:", JSON.stringify(result.results, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
