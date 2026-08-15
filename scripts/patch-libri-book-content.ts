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

// Owner's content, inserted verbatim (see this pass's own report) —
// narrow .patch().set() on the specific book.* subfields only, not
// createOrReplace: the live document has real, current values in every
// OTHER field (chapters, hero copy, etc.) that a full replace would risk
// clobbering with seed-libri-page.ts's own stale placeholder values.
const bookTitle = "E quindi uscimmo a riveder le stelle";

const subtitleIt = "Guarire dal panico con la psicoterapia · 2023";
const subtitleEn = "Guarire dal panico con la psicoterapia · 2023";

const bodyIt = [
  "Il titolo è l'ultimo verso dell'Inferno di Dante: il punto in cui, usciti dal buio, si torna a vedere il cielo. Il libro segue quella struttura — dal panico come lo si vive dall'interno, fino a quello che resta possibile dopo.",
  "È costruito attorno alle domande che le persone fanno davvero: ansia e panico sono la stessa cosa? Perché proprio a me? Gli psicofarmaci creano dipendenza, o cambiano il carattere? Come si lavora in psicoterapia, e quanto dura? E perché, dopo un percorso già fatto, qualcosa a volte resta?",
  "Scritto per chi convive con il panico, e per chi gli sta accanto.",
].join("\n\n");

const bodyEn = [
  "The title is the closing line of Dante's Inferno: the moment when, having come out of the dark, you can see the sky again. The book follows that shape — from panic as it is lived from the inside, to what remains possible afterwards.",
  "It is built around the questions people actually ask: are anxiety and panic the same thing? Why me? Do medications create dependence, or change who you are? How does the work proceed, and how long does it take? And why, after a course of therapy already completed, does something sometimes remain?",
  "Written for people living with panic, and for those beside them. The book is in Italian.",
].join("\n\n");

const amazonUrl = "https://www.amazon.it/uscimmo-riveder-stelle-Guarire-psicoterapia/dp/B0BSWB7PDT";

async function main() {
  const tx = client.transaction();

  tx.patch("libriPage-it", (p) =>
    p.set({
      "book.title": bookTitle,
      "book.subtitle": subtitleIt,
      "book.body": bodyIt,
      "book.amazonUrl": amazonUrl,
    }),
  );
  tx.patch("libriPage-en", (p) =>
    p.set({
      "book.title": bookTitle,
      "book.subtitle": subtitleEn,
      "book.body": bodyEn,
      "book.amazonUrl": amazonUrl,
    }),
  );

  const result = await tx.commit();
  console.log("Patched:", result.results.map((r) => r.id));
}
main().catch(console.error);
