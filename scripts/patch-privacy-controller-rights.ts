import { createClient } from "@sanity/client";

// Privacy page placeholder fill — two of the three placeholders, both
// locales. See CLAUDE.md's own Sanity data fetching rule: content lives in
// Sanity, not in a repo markdown file (the original
// contents/privacy-cookie-policy.md used by
// scripts/create-privacy-cookie-policy.ts was a one-off input, not
// committed — it no longer exists in the repo). Patches the live `body`
// Portable Text array directly, by _key, so unrelated blocks are untouched.
//
// 1. Controller block — the "Sede: [DA CONFERMARE — sede legale]" /
//    "Registered address: [TO BE CONFIRMED]" bullet line is REMOVED
//    entirely (not left empty, not filled with a placeholder value —
//    explicit instruction: no street address at all). Every other line in
//    that block (the "Il titolare del trattamento..." / "The controller
//    of data..." lead-in, Partita IVA/VAT, Email, PEC) is untouched,
//    confirmed unchanged against the live document before this patch.
// 2. Section 9 rights-request line — the bold "[DA CONFERMARE — email
//    diritti]" / "[TO BE CONFIRMED]" span is replaced with
//    info@giuseppeiannone.it, un-bolded to match the rest of the
//    document's prose (the bold mark was there to flag the placeholder
//    for attention, not a real style choice for an email address — see
//    block[4]'s own plain "Email: info@giuseppeiannone.it" line for the
//    precedent).
//
// The third placeholder — lastUpdated — is explicitly left alone; it's not
// a body block at all, it's the privacyPage schema's own lastUpdated
// field (empty), rendered as a fallback by LegalPageShell.tsx.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

interface Span {
  _key: string;
  _type: "span";
  text: string;
  marks: string[];
}
interface Block {
  _key: string;
  _type: string;
  children?: Span[];
  [key: string]: unknown;
}

interface DocPatch {
  id: string;
  sedeBlockKey: string;
  rightsBlockKey: string;
  rightsSpanKey: string;
  rightsPrefix: string;
  rightsSuffix: string;
  email: string;
}

const patches: DocPatch[] = [
  {
    id: "privacyPage-it",
    sedeBlockKey: "k10g1bl2w",
    rightsBlockKey: "k144ve8xdl",
    rightsSpanKey: "k141motzli",
    rightsPrefix: "Per esercitare questi diritti puoi scrivere a ",
    rightsSuffix: " oppure alla PEC indicata al punto 1. La risposta arriva entro un mese.",
    email: "info@giuseppeiannone.it",
  },
  {
    id: "privacyPage-en",
    sedeBlockKey: "k252ougf9d",
    rightsBlockKey: "k386z62de3",
    rightsSpanKey: "k383t9kyc3",
    rightsPrefix: "To exercise these rights, write to ",
    rightsSuffix: " or to the certified email address given in section 1. A reply follows within one month.",
    email: "info@giuseppeiannone.it",
  },
];

async function main() {
  for (const p of patches) {
    const doc = await client.getDocument(p.id);
    if (!doc) throw new Error(`${p.id} not found`);
    const body = (doc as unknown as { body: Block[] }).body;

    const sedeIdx = body.findIndex((b) => b._key === p.sedeBlockKey);
    if (sedeIdx === -1) throw new Error(`${p.id}: sede block not found`);

    const rightsIdx = body.findIndex((b) => b._key === p.rightsBlockKey);
    if (rightsIdx === -1) throw new Error(`${p.id}: rights block not found`);

    const newBody = body.filter((b) => b._key !== p.sedeBlockKey);
    const rightsBlockNewIdx = newBody.findIndex((b) => b._key === p.rightsBlockKey);
    const rightsBlock = newBody[rightsBlockNewIdx]!;
    rightsBlock.children = [
      {
        _key: p.rightsSpanKey,
        _type: "span",
        text: p.rightsPrefix + p.email + p.rightsSuffix,
        marks: [],
      },
    ];

    if (process.env.DRY_RUN) {
      console.log(`=== ${p.id} ===`);
      console.log("removed:", JSON.stringify(body[sedeIdx]));
      console.log("rights now:", JSON.stringify(rightsBlock));
      continue;
    }

    await client.patch(p.id).set({ body: newBody }).commit();
    console.log(`patched ${p.id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
