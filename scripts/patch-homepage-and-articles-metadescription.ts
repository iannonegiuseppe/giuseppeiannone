import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HOMEPAGE_IT_DESC =
  "Psicologo psicoterapeuta a Milano, Monza e Cernusco sul Naviglio e online. Mi occupo di ansia, attacchi di panico e delle difficoltà che li accompagnano.";
const HOMEPAGE_EN_DESC =
  "Psychologist and psychotherapist in Milan, Monza and Cernusco sul Naviglio, and online. I work with anxiety, panic attacks and the difficulties around them.";
const ARTICLE_3372_DESC =
  "Quali farmaci vengono indicati dalle linee guida per il disturbo di panico, e che ruolo hanno accanto alla psicoterapia.";
const ARTICLE_3378_DESC =
  "Che cosa si intende per personalità e quando si parla di disturbo di personalità, a partire dalla definizione dell'OMS.";

async function main() {
  const tx = client.transaction();
  tx.patch("homePage-it", (p) => p.set({ "seo.metaDescription": HOMEPAGE_IT_DESC }));
  tx.patch("homePage-en", (p) => p.set({ "seo.metaDescription": HOMEPAGE_EN_DESC }));
  tx.patch("article-3372", (p) => p.set({ "seo.metaDescription": ARTICLE_3372_DESC }));
  tx.patch("article-3378", (p) => p.set({ "seo.metaDescription": ARTICLE_3378_DESC }));
  const result = await tx.commit();
  console.log("committed:", JSON.stringify(result.results, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
