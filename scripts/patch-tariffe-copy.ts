import { createClient } from "@sanity/client";

// Tariffe copy pass — seeds homePage.tariffe (a NEW field group, separate
// from homePage.prezzi, see that field group's own schema comment for
// why) for the first time. New /design-lab pricing section: two rows (In
// studio / Online, both 100 €) + a four-fact footer (duration, payment,
// receipt, tax deduction).
//
// §9 note on detrazioneValue: states the 19% fact AND its traceable-
// payment condition in the same short line ("con pagamento tracciabile" /
// "with traceable payment") — per this pass's own brief, the deduction
// must never read as unconditional (cash payments don't qualify). No
// computed "real price after deduction" anywhere. detrazioneValue is the
// one field on the whole schema validated with deontologyCheckAllowingSymbols
// (see homePage.ts/deontologyValidator.ts) rather than the plain check,
// since it's the only field with a legitimate reason to contain "%".
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck
// validator (with the disclosed "%" carve-out on detrazioneValue only)
// for IT — see this pass's own report. EN checked by hand (no automated
// EN check exists — pre-existing, disclosed gap, same as every other
// bilingual patch script in this repo).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped token in the Sanity " +
      'dashboard (API -> Tokens -> Add API token, "Editor" permission), set it in ' +
      ".env.local, run this script, then delete the token again.",
  );
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const IT_TARIFFE = {
  eyebrow: "Tariffe",
  heading: "Quanto costa una seduta",
  headingEmphasisWord: "una seduta",
  rows: [
    {
      _key: "row-studio",
      mode: "In studio",
      subline: "Milano Citylife e Bicocca, Monza, Cernusco sul Naviglio",
      price: "100 €",
    },
    {
      _key: "row-online",
      mode: "Online",
      subline: "Da dove preferisci, su piattaforma riservata",
      price: "100 €",
    },
  ],
  durataLabel: "Durata",
  durataValue: "45 minuti",
  pagamentoLabel: "Pagamento",
  pagamentoValue: "Contanti, bonifico o carta",
  ricevutaLabel: "Ricevuta",
  ricevutaValue: "Sempre rilasciata",
  detrazioneLabel: "Detrazione",
  detrazioneValue: "19% come spesa sanitaria, con pagamento tracciabile",
};

const EN_TARIFFE = {
  eyebrow: "Pricing",
  heading: "What a session costs",
  headingEmphasisWord: "a session",
  rows: [
    {
      _key: "row-studio",
      mode: "In person",
      subline: "Milan Citylife and Bicocca, Monza, Cernusco sul Naviglio",
      price: "€100",
    },
    {
      _key: "row-online",
      mode: "Online",
      subline: "From wherever you prefer, on a private platform",
      price: "€100",
    },
  ],
  durataLabel: "Duration",
  durataValue: "45 minutes",
  pagamentoLabel: "Payment",
  pagamentoValue: "Cash, bank transfer, or card",
  ricevutaLabel: "Receipt",
  ricevutaValue: "Always issued",
  detrazioneLabel: "Deduction",
  detrazioneValue: "19% as a medical expense, with traceable payment",
};

async function getTariffe(id: string) {
  return client.fetch(`*[_id == $id][0]{ tariffe }`, { id });
}

async function patchDoc(id: string, tariffe: Record<string, unknown>) {
  const before = await getTariffe(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set({ tariffe }).commit();

  const after = await getTariffe(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_TARIFFE);
  await patchDoc("homePage-en", EN_TARIFFE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
