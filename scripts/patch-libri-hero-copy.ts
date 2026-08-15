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

// Item 1 pass — owner's copy, inserted verbatim (no rephrasing, no
// punctuation changes). Narrow .patch().set() on the hero fields +
// seo.metaTitle/metaDescription + form.lead only — same "never
// createOrReplace" convention as patch-libri-book-content.ts/
// patch-libri-cover-images.ts, so every other live field (chapters,
// book.*, seo.noIndex, ...) is left exactly as it is.
async function main() {
  const tx = client.transaction();

  tx.patch("libriPage-it", (p) =>
    p.set({
      kicker: "Libro e manuale",
      title: "Un libro sul panico, e un manuale gratuito",
      titleEmphasisWord: "panico",
      lead: "Ho scritto un libro su come si esce dal panico con la psicoterapia, pubblicato nel 2023 e disponibile su Amazon. E un manuale breve, gratuito, su ansia e attacchi di panico: te lo mando in PDF.",
      "seo.metaTitle": "Libro e manuale su ansia e attacchi di panico — Dr. Giuseppe Iannone",
      "seo.metaDescription":
        '"E quindi uscimmo a riveder le stelle": il libro sul panico e sulla psicoterapia, pubblicato nel 2023. E un manuale gratuito in PDF su ansia e attacchi di panico.',
      "form.lead": "Ti arriva subito, in PDF. L'indirizzo serve a inviartelo e a rispondere se mi scrivi.",
    }),
  );

  tx.patch("libriPage-en", (p) =>
    p.set({
      kicker: "Book and guide",
      title: "A book on panic, and a free guide",
      titleEmphasisWord: "panic",
      lead: "I have written a book on coming out of panic through psychotherapy, published in 2023 and available on Amazon. And a short free guide to anxiety and panic attacks, which I will send you as a PDF.",
      "seo.metaTitle": "Book and guide on anxiety and panic attacks — Dr Giuseppe Iannone",
      "seo.metaDescription":
        '"E quindi uscimmo a riveder le stelle": the book on panic and psychotherapy, published in 2023. Plus a free PDF guide to anxiety and panic attacks.',
      "form.lead": "It arrives straight away, as a PDF. The address is used to send it and to reply if you write to me.",
    }),
  );

  const result = await tx.commit();
  console.log("Patched:", result.results.map((r) => r.id));
}
main().catch(console.error);
