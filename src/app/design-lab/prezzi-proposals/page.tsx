import type { Metadata } from "next";
import Link from "next/link";
import { resolveRobots } from "@/sanity/metadata";
import styles from "./index.module.scss";

// Index for the three /prezzi redesign proposals — gated like every other
// /design-lab route (noindex, unlinked from navigation/sitemap; see
// ../density/page.tsx's own comment on the current PREVIEW-GATE state
// this pass matches: no hard production 404, noindex is the only gate
// right now). Not itself one of the three proposals.
export const metadata: Metadata = {
  title: "Prezzi — proposte (interno)",
  robots: resolveRobots(true),
};

const PROPOSALS = [
  {
    href: "/design-lab/prezzi-proposals/a-ledger",
    title: "A — Il foglio",
    summary: "Le tariffe come un documento: righe fatto/valore, nessuna narrazione.",
  },
  {
    href: "/design-lab/prezzi-proposals/b-percorso",
    title: "B — Il percorso",
    summary: "Le stesse informazioni in sequenza: cosa succede, in ordine.",
  },
  {
    href: "/design-lab/prezzi-proposals/c-editoriale",
    title: "C — Editoriale",
    summary: "Testo scorrevole con le cifre come elemento tipografico, più una scheda sintetica.",
  },
];

export default function PrezziProposalsIndex() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Prezzi — tre proposte</h1>
      <p className={styles.intro}>
        Mockup statici a scala reale (1440 / 390). Non collegati a /prezzi, nessuna scrittura su
        Sanity.
      </p>
      <ul className={styles.list}>
        {PROPOSALS.map((p) => (
          <li key={p.href} className={styles.item}>
            <Link href={p.href} className={styles.itemLink}>
              <span className={styles.itemTitle}>{p.title}</span>
              <span className={styles.itemSummary}>{p.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
