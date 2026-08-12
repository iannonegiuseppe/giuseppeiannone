import type { Metadata } from "next";
import Link from "next/link";
import { resolveRobots } from "@/sanity/metadata";
import styles from "./index.module.scss";

// Index for the three Contatti redesign proposals — gated like every other
// /design-lab route (noindex, unlinked from navigation/sitemap; see
// ../density/page.tsx's own comment on the current PREVIEW-GATE state this
// pass matches: no hard production 404, noindex is the only gate right
// now). Not itself one of the three proposals. Structure mirrors
// ../prezzi-proposals/page.tsx exactly — same reviewed pattern, new content.
export const metadata: Metadata = {
  title: "Contatti — proposte (interno)",
  robots: resolveRobots(true),
};

const PROPOSALS = [
  {
    href: "/design-lab/contatti-proposals/a-canali",
    title: "A — I canali",
    summary: "Apre con come raggiungerlo — WhatsApp, telefono, email — prima della geografia.",
  },
  {
    href: "/design-lab/contatti-proposals/b-mappa",
    title: "B — La mappa",
    summary: "Apre con la mappa interattiva: dove trovarlo, poi come scrivergli.",
  },
  {
    href: "/design-lab/contatti-proposals/c-editoriale",
    title: "C — Editoriale",
    summary: "Un unico testo scorrevole, i canali dentro la prosa, il numero come cifra tipografica.",
  },
];

export default function ContattiProposalsIndex() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Contatti — tre proposte</h1>
      <p className={styles.intro}>
        Mockup statici a scala reale (1440 / 390). Non collegati a /contatti, nessuna scrittura su
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
