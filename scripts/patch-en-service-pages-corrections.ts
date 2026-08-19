import { createClient } from "@sanity/client";

// English-only corrections pass, sourced from the /en/pricing + /en/method
// copy audit: the 19% deduction was stated three times on pricePage-en but
// only one of the three flagged it as Italian-specific; and methodPage-en
// never said sessions are available in English. homePage-it/pricePage-it/
// methodPage-it are never referenced below — only the two -en documents are
// patched.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const PRICE_EN_SET: Record<string, unknown> = {
  "darkBand.column2.block1Body":
    "At the end of each session, by cash, bank transfer or card. A receipt is issued every time without your having to ask: it is the document to keep for the 19% Italian healthcare-expense deduction, on traceable payments. It applies only if you file an Italian tax return.",
  "facts[3].value":
    "19% Italian healthcare-expense deduction, on traceable payments, if you file in Italy",
};

const METHOD_EN_SET: Record<string, unknown> = {
  "practical.col1.p":
    "Same length, same fee, same way of working. Two studios in Milan, one in Monza, one in Cernusco sul Naviglio — or a private platform, from wherever you are. Sessions are held in English or in Italian, whichever you think in.",
};

async function main() {
  const beforeItPrice = await client.fetch<string>(`*[_id == "pricePage-it"][0]._rev`);
  const beforeItMethod = await client.fetch<string>(`*[_id == "methodPage-it"][0]._rev`);
  console.log("BEFORE pricePage-it._rev:", beforeItPrice);
  console.log("BEFORE methodPage-it._rev:", beforeItMethod);

  await client.patch("pricePage-en").set(PRICE_EN_SET).commit();
  await client.patch("methodPage-en").set(METHOD_EN_SET).commit();

  const afterItPrice = await client.fetch<string>(`*[_id == "pricePage-it"][0]._rev`);
  const afterItMethod = await client.fetch<string>(`*[_id == "methodPage-it"][0]._rev`);
  console.log("AFTER  pricePage-it._rev:", afterItPrice, "unchanged:", beforeItPrice === afterItPrice);
  console.log("AFTER  methodPage-it._rev:", afterItMethod, "unchanged:", beforeItMethod === afterItMethod);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
